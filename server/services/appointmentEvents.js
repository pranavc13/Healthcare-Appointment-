const { sendAndLog } = require('./email');
const calendarService = require('./calendar');
const { bookingConfirmationTemplate } = require('../templates/bookingConfirmation');
const { cancellationTemplate } = require('../templates/cancellation');
const { leaveCancellationTemplate } = require('../templates/leaveCancellation');

function toISO(dateOnly, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(dateOnly);
  d.setUTCHours(h, m, 0, 0);
  return d.toISOString();
}

// Sends booking-confirmation emails to both sides. Never throws — email failures are
// logged as failed Notification rows for the retry cron, per the spec's requirement
// that the appointment flow must not break on notification failure.
async function notifyBookingConfirmation(appointment, patientUser, doctorUser, doctorProfile) {
  const common = { doctorName: doctorUser.name, patientName: patientUser.name, specialisation: doctorProfile.specialisation, date: appointment.date, startTime: appointment.startTime, endTime: appointment.endTime };

  const patientEmail = bookingConfirmationTemplate({ ...common, recipientRole: 'patient' });
  await sendAndLog({
    userId: patientUser._id,
    appointmentId: appointment._id,
    type: 'booking_confirmation',
    to: patientUser.email,
    subject: patientEmail.subject,
    html: patientEmail.html,
  });

  const doctorEmail = bookingConfirmationTemplate({ ...common, recipientRole: 'doctor' });
  await sendAndLog({
    userId: doctorUser._id,
    appointmentId: appointment._id,
    type: 'booking_confirmation',
    to: doctorUser.email,
    subject: doctorEmail.subject,
    html: doctorEmail.html,
  });
}

async function notifyCancellation(appointment, patientUser, doctorUser, { leaveTriggered = false } = {}) {
  const common = { doctorName: doctorUser.name, patientName: patientUser.name, date: appointment.date, startTime: appointment.startTime };

  const patientTemplate = leaveTriggered
    ? leaveCancellationTemplate(common)
    : cancellationTemplate({ ...common, recipientRole: 'patient' });
  await sendAndLog({
    userId: patientUser._id,
    appointmentId: appointment._id,
    type: leaveTriggered ? 'leave_notice' : 'cancellation',
    to: patientUser.email,
    subject: patientTemplate.subject,
    html: patientTemplate.html,
  });

  if (doctorUser) {
    const doctorTemplate = cancellationTemplate({ ...common, recipientRole: 'doctor' });
    await sendAndLog({
      userId: doctorUser._id,
      appointmentId: appointment._id,
      type: 'cancellation',
      to: doctorUser.email,
      subject: doctorTemplate.subject,
      html: doctorTemplate.html,
    });
  }
}

// Best-effort: creates calendar events for whichever of patient/doctor has connected
// their Google Calendar. Failures are logged and swallowed — calendar sync never blocks
// the appointment flow.
async function createCalendarEvents(appointment, patientUser, doctorUser, doctorProfile) {
  const startISO = toISO(appointment.date, appointment.startTime);
  const endISO = toISO(appointment.date, appointment.endTime);

  if (patientUser.googleCalendarConnected && patientUser.googleCalendarRefreshToken) {
    try {
      appointment.googleCalendarEventId_patient = await calendarService.createEvent(
        patientUser.googleCalendarRefreshToken,
        { summary: `Appointment with Dr. ${doctorUser.name}`, description: `Specialisation: ${doctorProfile.specialisation}`, startISO, endISO }
      );
    } catch (err) {
      console.error('[calendar] failed to create patient event:', err.message);
    }
  }

  if (doctorUser.googleCalendarConnected && doctorUser.googleCalendarRefreshToken) {
    try {
      appointment.googleCalendarEventId_doctor = await calendarService.createEvent(
        doctorUser.googleCalendarRefreshToken,
        { summary: `Appointment with ${patientUser.name}`, description: `Patient: ${patientUser.name}`, startISO, endISO }
      );
    } catch (err) {
      console.error('[calendar] failed to create doctor event:', err.message);
    }
  }
}

async function deleteCalendarEvents(appointment, patientUser, doctorUser) {
  if (appointment.googleCalendarEventId_patient && patientUser?.googleCalendarRefreshToken) {
    try {
      await calendarService.deleteEvent(patientUser.googleCalendarRefreshToken, appointment.googleCalendarEventId_patient);
    } catch (err) {
      console.error('[calendar] failed to delete patient event:', err.message);
    }
  }
  if (appointment.googleCalendarEventId_doctor && doctorUser?.googleCalendarRefreshToken) {
    try {
      await calendarService.deleteEvent(doctorUser.googleCalendarRefreshToken, appointment.googleCalendarEventId_doctor);
    } catch (err) {
      console.error('[calendar] failed to delete doctor event:', err.message);
    }
  }
}

async function updateCalendarEvents(appointment, patientUser, doctorUser, doctorProfile) {
  const startISO = toISO(appointment.date, appointment.startTime);
  const endISO = toISO(appointment.date, appointment.endTime);

  if (appointment.googleCalendarEventId_patient && patientUser?.googleCalendarRefreshToken) {
    try {
      await calendarService.updateEvent(patientUser.googleCalendarRefreshToken, appointment.googleCalendarEventId_patient, {
        summary: `Appointment with Dr. ${doctorUser.name}`,
        description: `Specialisation: ${doctorProfile.specialisation}`,
        startISO,
        endISO,
      });
    } catch (err) {
      console.error('[calendar] failed to update patient event:', err.message);
    }
  }
  if (appointment.googleCalendarEventId_doctor && doctorUser?.googleCalendarRefreshToken) {
    try {
      await calendarService.updateEvent(doctorUser.googleCalendarRefreshToken, appointment.googleCalendarEventId_doctor, {
        summary: `Appointment with ${patientUser.name}`,
        description: `Patient: ${patientUser.name}`,
        startISO,
        endISO,
      });
    } catch (err) {
      console.error('[calendar] failed to update doctor event:', err.message);
    }
  }
}

module.exports = {
  notifyBookingConfirmation,
  notifyCancellation,
  createCalendarEvents,
  deleteCalendarEvents,
  updateCalendarEvents,
};
