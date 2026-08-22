const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../services/email');

const MAX_RETRIES = 3;
const BACKOFF_MINUTES = 10; // next attempt waits 10min * 2^retryCount

// Every 10 minutes: retries failed notifications (up to 3 attempts total) with
// exponential backoff. `scheduledAt` doubles as "don't attempt before this time" —
// the Notification schema (per spec) has no dedicated nextRetryAt field, so this
// reuses scheduledAt for that purpose (documented in SYSTEM_DESIGN.md).
async function emailRetry() {
  const due = await Notification.find({
    status: 'failed',
    retryCount: { $lt: MAX_RETRIES },
    scheduledAt: { $lte: new Date() },
  });

  let recovered = 0;
  for (const notification of due) {
    const user = await User.findById(notification.userId).select('email');
    if (!user) continue;

    try {
      await sendEmail({ to: user.email, subject: notification.subject, html: notification.message });
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
      recovered += 1;
    } catch (err) {
      notification.retryCount += 1;
      notification.lastError = err.message;
      if (notification.retryCount >= MAX_RETRIES) {
        // Alerting is log-based for this assignment's scope — no external alerting
        // service is wired up. The row stays status:'failed' and is excluded from
        // further retries by the retryCount<3 filter above.
        console.error(
          `[jobs:emailRetry] notification ${notification._id} exhausted ${MAX_RETRIES} retries — giving up`
        );
      } else {
        notification.scheduledAt = new Date(Date.now() + BACKOFF_MINUTES * 2 ** notification.retryCount * 60 * 1000);
      }
      await notification.save();
    }
  }

  if (due.length > 0) {
    console.log(`[jobs:emailRetry] processed ${due.length}, recovered ${recovered}`);
  }
}

module.exports = emailRetry;
