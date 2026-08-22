const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const { sendAndLog } = require('../services/email');
const { reminderTemplate } = require('../templates/reminder');

function appointmentDateTime(appointment) {
  const [h, m] = appointment.startTime.split(':').map(Number);
  const dt = new Date(appointment.date);
  dt.setUTCHours(h, m, 0, 0);
  return dt;
}

// Hourly: emails patients whose confirmed appointment falls within the next 24h and
// hasn't been reminded yet. `reminderSent` makes this idempotent across runs.
async function appointmentReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const candidates = await Appointment.find({ status: 'confirmed', reminderSent: false }).populate(
    'patientId',
    'name email'
  );

  const due = candidates.filter((a) => {
    const dt = appointmentDateTime(a);
    return dt > now && dt <= in24h;
  });

  for (const appointment of due) {
    const doctorProfile = await DoctorProfile.findById(appointment.doctorId);
    if (!doctorProfile) continue;
    const doctorUser = await User.findById(doctorProfile.userId).select('name');
    if (!doctorUser || !appointment.patientId) continue;

    const template = reminderTemplate({
      doctorName: doctorUser.name,
      specialisation: doctorProfile.specialisation,
      date: appointment.date,
      startTime: appointment.startTime,
    });

    await sendAndLog({
      userId: appointment.patientId._id,
      appointmentId: appointment._id,
      type: 'reminder',
      to: appointment.patientId.email,
      subject: template.subject,
      html: template.html,
    });

    appointment.reminderSent = true;
    await appointment.save();
  }

  if (due.length > 0) {
    console.log(`[jobs:appointmentReminders] sent ${due.length} reminder(s)`);
  }
}

module.exports = appointmentReminders;
