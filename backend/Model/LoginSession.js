const mongoose = require('mongoose');

const LoginSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  browser: {
    type: String,
    required: true
  },
  os: {
    type: String,
    required: true
  },
  device: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('LoginSession', LoginSessionSchema); 