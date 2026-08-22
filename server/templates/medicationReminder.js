const { renderEmail } = require('./base');

function medicationReminderTemplate({ medication, dosage, instructions }) {
  const bodyHtml = `<p>It's time to take your medication:</p>
    <p><strong>${medication}</strong>${dosage ? ` — ${dosage}` : ''}</p>
    ${instructions ? `<p>${instructions}</p>` : ''}`;

  return { subject: `Medication reminder: ${medication}`, html: renderEmail({ heading: 'Medication Reminder', bodyHtml }) };
}

module.exports = { medicationReminderTemplate };
