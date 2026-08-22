const Appointment = require('../models/Appointment');

// Every minute: releases any slot whose 5-minute hold has expired without the
// patient confirming, so it becomes bookable again immediately (the atomic
// hold logic also reclaims expired holds on-demand, but this keeps stale
// pending documents from piling up in the meantime).
async function slotHoldCleanup() {
  const result = await Appointment.deleteMany({ status: 'pending', heldUntil: { $lt: new Date() } });
  if (result.deletedCount > 0) {
    console.log(`[jobs:slotHoldCleanup] released ${result.deletedCount} expired hold(s)`);
  }
}

module.exports = slotHoldCleanup;
