const cron = require('node-cron');
const slotHoldCleanup = require('./slotHoldCleanup');
const appointmentReminders = require('./appointmentReminders');
const medicationReminders = require('./medicationReminders');
const emailRetry = require('./emailRetry');
const llmRetry = require('./llmRetry');

function safeRun(name, fn) {
  return async () => {
    try {
      await fn();
    } catch (err) {
      console.error(`[jobs:${name}] failed:`, err);
    }
  };
}

// Registers all background jobs. Schedules match the assignment's spec exactly.
function registerJobs() {
  cron.schedule('* * * * *', safeRun('slotHoldCleanup', slotHoldCleanup)); // every 1 minute
  cron.schedule('0 * * * *', safeRun('appointmentReminders', appointmentReminders)); // every hour
  cron.schedule('0 * * * *', safeRun('medicationReminders', medicationReminders)); // every hour
  cron.schedule('*/10 * * * *', safeRun('emailRetry', emailRetry)); // every 10 minutes
  cron.schedule('*/15 * * * *', safeRun('llmRetry', llmRetry)); // every 15 minutes

  console.log('[jobs] registered: slotHoldCleanup(1m), appointmentReminders(1h), medicationReminders(1h), emailRetry(10m), llmRetry(15m)');
}

module.exports = registerJobs;
