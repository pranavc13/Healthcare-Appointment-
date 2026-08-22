const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notifications/my — read-only history of notifications sent to the
// current user (used to power the in-app notification bell).
const myNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ scheduledAt: -1 })
    .limit(50)
    .select('type status subject sentAt scheduledAt appointmentId');
  res.json(notifications);
});

module.exports = { myNotifications };
