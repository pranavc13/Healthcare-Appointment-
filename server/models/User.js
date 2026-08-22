const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true, default: 'patient' },
  phone: { type: String, trim: true },
  googleCalendarRefreshToken: { type: String, select: false },
  googleCalendarConnected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
