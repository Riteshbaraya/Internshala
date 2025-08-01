const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: {
    type: String,
    enum: ['free', 'bronze', 'silver', 'gold'],
    default: 'free'
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  invoiceId: {
    type: String
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  validTill: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationsUsed: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema); 