const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const plans = require('../config/plans');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /api/payment/checkout
router.post('/checkout', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || !plans[plan] || plans[plan].price <= 0) {
      return res.status(400).json({ message: 'Invalid or free plan' });
    }
    // Enforce 10-11 AM IST
    const istTime = moment().tz('Asia/Kolkata');
    if (istTime.hour() !== 10) {
      return res.status(403).json({ message: 'Payments allowed only between 10 AM to 11 AM IST' });
    }
    const amount = plans[plan].price * 100;
    const invoiceId = `INV-${Date.now()}-${uuidv4().slice(0,8)}`;
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: invoiceId,
      notes: { plan }
    });
    res.json({ orderId: order.id, amount, invoiceId });
  } catch (err) {
    console.error('Razorpay checkout error:', err);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
});

module.exports = router;