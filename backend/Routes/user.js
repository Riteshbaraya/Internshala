const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Subscription = require("../Model/Subscription");
const plans = require("../config/plans");
const { authMiddleware } = require("./auth");
const Razorpay = require('razorpay');
const moment = require('moment-timezone');
const { sendSubscriptionEmail } = require('../utils/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get user profile (requires authentication)
router.get("/profile", authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error fetching user profile:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Change subscription plan (requires authentication)
router.post("/change-subscription", authMiddleware(['user']), async (req, res) => {
  try {
    const { plan, razorpayPaymentId, invoiceId } = req.body;
    if (!plan) {
      return res.status(400).json({ error: "Plan is required" });
    }
    if (!plans[plan]) {
      return res.status(400).json({ error: "Invalid plan. Available plans: free, bronze, silver, gold" });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Free plan: allow instant switch
    if (plan === 'free') {
      await Subscription.updateMany({ userId: req.user.id, isActive: true }, { isActive: false });
      const newSubscription = new Subscription({
        userId: req.user.id,
        planName: plan,
        amountPaid: 0,
        invoiceId: `INV-${Date.now()}`,
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicationsUsed: 0
      });
      await newSubscription.save();
      return res.status(200).json({
        message: "Subscription changed successfully",
        plan,
        planDetails: plans[plan],
        validTill: newSubscription.validTill
      });
    }
    // Paid plan: require paymentId and invoiceId
    if (!razorpayPaymentId || !invoiceId) {
      return res.status(400).json({ error: "Payment required for paid plans" });
    }
    // Validate payment with Razorpay
    let payment;
    try {
      payment = await razorpay.payments.fetch(razorpayPaymentId);
    } catch (err) {
      return res.status(400).json({ error: "Invalid payment ID" });
    }
    if (!payment || payment.status !== 'captured' || payment.amount !== plans[plan].price * 100) {
      return res.status(400).json({ error: "Payment not verified or incorrect amount" });
    }
    // Deactivate current subscription
    await Subscription.updateMany({ userId: req.user.id, isActive: true }, { isActive: false });
    // Create new subscription
    const newSubscription = new Subscription({
      userId: req.user.id,
      planName: plan,
      amountPaid: plans[plan].price,
      invoiceId,
      razorpayPaymentId,
      validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      applicationsUsed: 0
    });
    await newSubscription.save();
    // Send invoice email
    await sendSubscriptionEmail(
      user.email,
      user.name,
      plans[plan].name,
      plans[plan].price,
      invoiceId,
      newSubscription.validTill
    );
    res.status(200).json({
      message: "Subscription changed successfully",
      plan,
      planDetails: plans[plan],
      validTill: newSubscription.validTill
    });
  } catch (error) {
    console.error("❌ [User] Error changing subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update notification settings (requires authentication)
router.put("/profile/notification", authMiddleware(['user', 'admin']), async (req, res) => {
  try {
    const { notificationEnabled } = req.body;
    
    if (typeof notificationEnabled !== 'boolean') {
      return res.status(400).json({ error: "notificationEnabled must be a boolean" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { notificationEnabled },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error updating notification settings:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router; 