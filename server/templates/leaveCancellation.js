const { renderEmail } = require('./base');
const { fmtDate } = require('./bookingConfirmation');

function leaveCancellationTemplate({ doctorName, date, startTime }) {
  const bodyHtml = `<p>We're sorry for the inconvenience. Dr. ${doctorName} is on leave on ${fmtDate(date)}, so your appointment scheduled for <strong>${startTime}</strong> has been cancelled.</p>
    <p>Please book a new appointment at a convenient time — availability has been updated on your dashboard.</p>`;

  return { subject: `Your appointment on ${fmtDate(date)} was cancelled (doctor on leave)`, html: renderEmail({ heading: 'Appointment Cancelled — Doctor on Leave', bodyHtml }) };
}

module.exports = { leaveCancellationTemplate };
