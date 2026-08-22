const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'booking_confirmation',
      'reminder',
      'cancellation',
      'leave_notice',
      'medication_reminder',
      'post_visit_summary',
    ],
    required: true,
  },
  channel: { type: String, enum: ['email'], default: 'email' },
  status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
  retryCount: { type: Number, default: 0 },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  subject: { type: String },
  message: { type: String },
  // Doubles as "do not attempt before this time" for the exponential-backoff retry cron.
  scheduledAt: { type: Date, default: Date.now },
  sentAt: { type: Date },
  lastError: { type: String },
});

notificationSchema.index({ status: 1, retryCount: 1, scheduledAt: 1 });
notificationSchema.index({ userId: 1, scheduledAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
