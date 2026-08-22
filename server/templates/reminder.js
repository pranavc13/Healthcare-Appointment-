const { renderEmail } = require('./base');
const { fmtDate } = require('./bookingConfirmation');

function reminderTemplate({ doctorName, specialisation, date, startTime }) {
  const bodyHtml = `<p>This is a friendly reminder about your upcoming appointment.</p>
    <p><strong>Doctor:</strong> Dr. ${doctorName} (${specialisation})<br/>
    <strong>Date:</strong> ${fmtDate(date)}<br/>
    <strong>Time:</strong> ${startTime}</p>
    <p>Please arrive a few minutes early. If you need to reschedule or cancel, please do so from your dashboard.</p>`;

  return { subject: `Reminder: appointment with Dr. ${doctorName} tomorrow`, html: renderEmail({ heading: 'Upcoming Appointment', bodyHtml }) };
}

module.exports = { reminderTemplate };
