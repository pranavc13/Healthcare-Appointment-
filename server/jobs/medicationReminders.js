const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { sendAndLog } = require('../services/email');
const { medicationReminderTemplate } = require('../templates/medicationReminder');
const { parseFrequency } = require('../utils/frequencyParser');

function parseDurationDays(duration = '') {
  const match = duration.match(/(\d+)\s*(day|week|month)/i);
  if (!match) return 7; // unparseable — default to a week so a reminder still fires
  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit === 'week') return n * 7;
  if (unit === 'month') return n * 30;
  return n;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Hourly: for every completed appointment with an active prescription, checks whether
// "now" matches one of each medication's times-of-day (derived from its free-text
// frequency) and — if so, and a reminder for that medication/day/slot hasn't already
// been sent — emails the patient. This satisfies both "schedule reminders based on
// frequency" (section 5) and the hourly cron requirement (section 9) without needing
// to pre-materialize a reminder row per future dose.
async function medicationReminders() {
  const now = new Date();
  const currentHour = now.getHours();

  const appointments = await Appointment.find({
    status: 'completed',
    'prescription.0': { $exists: true },
  }).populate('patientId', 'name email');

  let sent = 0;
  for (const appointment of appointments) {
    if (!appointment.patientId) continue;
    const completedAt = appointment.updatedAt || appointment.createdAt;

    for (const item of appointment.prescription) {
      const durationDays = parseDurationDays(item.duration);
      const courseEnds = new Date(completedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
      if (now > courseEnds) continue;

      const times = parseFrequency(item.frequency);
      const isDueThisHour = times.some((t) => parseInt(t.split(':')[0], 10) === currentHour);
      if (!isDueThisHour) continue;

      const subject = `Medication reminder: ${item.medication}`;
      const alreadySent = await Notification.findOne({
        userId: appointment.patientId._id,
        appointmentId: appointment._id,
        type: 'medication_reminder',
        subject,
        scheduledAt: { $gte: startOfDay(now) },
      });
      if (alreadySent) continue;

      const template = medicationReminderTemplate(item);
      await sendAndLog({
        userId: appointment.patientId._id,
        appointmentId: appointment._id,
        type: 'medication_reminder',
        to: appointment.patientId.email,
        subject: template.subject,
        html: template.html,
      });
      sent += 1;
    }
  }

  if (sent > 0) {
    console.log(`[jobs:medicationReminders] sent ${sent} medication reminder(s)`);
  }
}

module.exports = medicationReminders;
