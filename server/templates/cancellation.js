const { renderEmail } = require('./base');
const { fmtDate } = require('./bookingConfirmation');

function cancellationTemplate({ recipientRole, patientName, doctorName, date, startTime }) {
  const subject =
    recipientRole === 'doctor'
      ? `Appointment cancelled — ${patientName} on ${fmtDate(date)}`
      : `Your appointment with Dr. ${doctorName} was cancelled`;

  const bodyHtml =
    recipientRole === 'doctor'
      ? `<p>The following appointment has been cancelled.</p>
         <p><strong>Patient:</strong> ${patientName}<br/>
         <strong>Date:</strong> ${fmtDate(date)}<br/>
         <strong>Time:</strong> ${startTime}</p>`
      : `<p>Your appointment has been cancelled.</p>
         <p><strong>Doctor:</strong> Dr. ${doctorName}<br/>
         <strong>Date:</strong> ${fmtDate(date)}<br/>
         <strong>Time:</strong> ${startTime}</p>
         <p>You can book a new appointment any time from your dashboard.</p>`;

  return { subject, html: renderEmail({ heading: 'Appointment Cancelled', bodyHtml }) };
}

module.exports = { cancellationTemplate };
