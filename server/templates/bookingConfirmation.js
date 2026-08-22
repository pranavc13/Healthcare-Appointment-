const { renderEmail } = require('./base');

function fmtDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// recipientRole: 'patient' | 'doctor' — the wording differs slightly for each side.
function bookingConfirmationTemplate({ recipientRole, patientName, doctorName, specialisation, date, startTime, endTime }) {
  const subject =
    recipientRole === 'doctor'
      ? `New appointment confirmed — ${patientName} on ${fmtDate(date)}`
      : `Appointment confirmed with Dr. ${doctorName}`;

  const bodyHtml =
    recipientRole === 'doctor'
      ? `<p>You have a new confirmed appointment.</p>
         <p><strong>Patient:</strong> ${patientName}<br/>
         <strong>Date:</strong> ${fmtDate(date)}<br/>
         <strong>Time:</strong> ${startTime} – ${endTime}</p>`
      : `<p>Your appointment is confirmed.</p>
         <p><strong>Doctor:</strong> Dr. ${doctorName} (${specialisation})<br/>
         <strong>Date:</strong> ${fmtDate(date)}<br/>
         <strong>Time:</strong> ${startTime} – ${endTime}</p>
         <p>We'll send you a reminder 24 hours before your visit.</p>`;

  return { subject, html: renderEmail({ heading: 'Appointment Confirmed', bodyHtml }) };
}

module.exports = { bookingConfirmationTemplate, fmtDate };
