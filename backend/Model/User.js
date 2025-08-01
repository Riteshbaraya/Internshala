const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true }, // Optional, unique username
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resume: { type: String }, // URL or file path
  notificationEnabled: { type: Boolean, default: true }, // New field for notification preferences
  createdAt: { type: Date, default: Date.now },
  lastPasswordReset: { type: Date },
});

module.exports = mongoose.model('User', UserSchema); 