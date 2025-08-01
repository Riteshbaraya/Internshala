const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const moment = require("moment-timezone");
const Subscription = require("../Model/Subscription");
const User = require("../Model/User");
const plans = require("../config/plans");
const { checkPaymentTimeRestriction } = require("../utils/loginTracking");
const { sendSubscriptionEmail } = require("../utils/emailService");
const { authMiddleware } = require("./auth");

// Initialize Razorpay only if credentials are available
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.log('⚠️ Razorpay credentials not found. Payment features will be disabled.');
}

// Test endpoint to check subscription service
router.get("/test", (req, res) => {
  try {
    res.json({
      message: 'Subscription service is working',
      razorpayAvailable: !!razorpay,
      plansAvailable: !!plans,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ message: 'Test failed', error: error.message });
  }
});

// Get current subscription
router.get("/current", authMiddleware(['user']), async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ startedAt: -1 });

    if (!subscription) {
      return res.json({
        planName: 'free',
        planDetails: plans.free,
        applicationsUsed: 0,
        applicationsLeft: plans.free.limit,
        validTill: null,
        isActive: false
      });
    }

    const planDetails = plans[subscription.planName];
    const applicationsLeft = planDetails.limit === Infinity ? 
      Infinity : 
      planDetails.limit - subscription.applicationsUsed;

    res.json({
      planName: subscription.planName,
      planDetails,
      applicationsUsed: subscription.applicationsUsed,
      applicationsLeft,
      validTill: subscription.validTill,
      isActive: subscription.isActive && new Date() < subscription.validTill
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available plans
router.get("/plans", async (req, res) => {
  try {
    res.json(plans);
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment order
router.post("/create-order", authMiddleware(['user']), async (req, res) => {
  try {
    console.log('🔍 [Subscription] Creating order for user:', req.user.id);
    const { planName } = req.body;
    
    console.log('🔍 [Subscription] Plan requested:', planName);
    
    if (!plans[planName]) {
      console.log('❌ [Subscription] Invalid plan:', planName);
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      console.log('❌ [Subscription] Razorpay not initialized');
      return res.status(503).json({ 
        message: 'Payment service is currently unavailable. Please contact support.' 
      });
    }

    console.log('✅ [Subscription] Razorpay initialized, creating order...');

    const plan = plans[planName];
    const amount = plan.price * 100; // Razorpay expects amount in paise

    console.log('🔍 [Subscription] Order details:', { planName, amount, currency: 'INR' });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        planName: planName,
        userId: req.user.id
      }
    });

    console.log('✅ [Subscription] Order created successfully:', order.id);

    res.json({
      orderId: order.id,
      amount: amount,
      currency: order.currency,
      planName: planName,
      planDetails: plan
    });
  } catch (error) {
    console.error('❌ [Subscription] Error creating order:', error);
    console.error('❌ [Subscription] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Verify payment and activate subscription
router.post("/verify-payment", authMiddleware(['user']), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = req.body;

    // Verify payment signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Deactivate current subscription
    await Subscription.updateMany(
      { userId: req.user.id, isActive: true },
      { isActive: false }
    );

    // Create new subscription
    const plan = plans[planName];
    const validTill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription = new Subscription({
      userId: req.user.id,
      planName: planName,
      amountPaid: plan.price,
      invoiceId: `INV-${Date.now()}`,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      validTill: validTill,
      isActive: true
    });

    await subscription.save();

    // Send confirmation email
    const user = await User.findById(req.user.id);
    await sendSubscriptionEmail(
      user.email,
      user.name,
      plan.name,
      plan.price,
      subscription.invoiceId,
      validTill
    );

    res.json({
      message: 'Subscription activated successfully',
      subscription: {
        planName: subscription.planName,
        amountPaid: subscription.amountPaid,
        validTill: subscription.validTill,
        applicationsLeft: plan.limit
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subscription history
router.get("/history", authMiddleware(['user']), async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id })
      .sort({ startedAt: -1 })
      .limit(10);

    res.json(subscriptions);
  } catch (error) {
    console.error('Error getting subscription history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user can apply (subscription limit check)
router.get("/can-apply", authMiddleware(['user']), async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ startedAt: -1 });

    if (!subscription) {
      // Free plan
      const plan = plans.free;
      res.json({
        canApply: true,
        planName: 'free',
        applicationsLeft: plan.limit,
        message: 'Free plan - 1 application allowed'
      });
      return;
    }

    const plan = plans[subscription.planName];
    const applicationsLeft = plan.limit === Infinity ? 
      Infinity : 
      plan.limit - subscription.applicationsUsed;

    res.json({
      canApply: applicationsLeft > 0,
      planName: subscription.planName,
      applicationsLeft: applicationsLeft,
      applicationsUsed: subscription.applicationsUsed,
      message: applicationsLeft > 0 ? 
        `${subscription.planName} plan - ${applicationsLeft} applications left` :
        'Application limit reached'
    });
  } catch (error) {
    console.error('Error checking application limit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment application count (called when user applies)
router.post("/increment-application", authMiddleware(['user']), async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ startedAt: -1 });

    if (!subscription) {
      // Free plan - create subscription record
      const newSubscription = new Subscription({
        userId: req.user.id,
        planName: 'free',
        applicationsUsed: 1,
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      });
      await newSubscription.save();
    } else {
      // Increment application count
      subscription.applicationsUsed += 1;
      await subscription.save();
    }

    res.json({ message: 'Application count updated' });
  } catch (error) {
    console.error('Error incrementing application count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 