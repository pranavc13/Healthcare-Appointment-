const { renderEmail } = require('./base');

function postVisitSummaryTemplate({ doctorName, summary, fallback }) {
  const bodyHtml = fallback
    ? `<p>Thank you for visiting Dr. ${doctorName}. Here is a summary of your visit:</p>
       <p style="white-space:pre-wrap;">${fallback}</p>
       <p style="color:#94a3b8;font-size:12px;">A friendlier AI-generated summary is being prepared and will appear on your appointment page shortly.</p>`
    : `<p>Thank you for visiting Dr. ${doctorName}. Here's a summary of your visit:</p>
       <p>${summary.patientFriendlySummary}</p>
       <p><strong>Medication schedule:</strong><br/>${summary.medicationSchedule}</p>
       <p><strong>Follow-up steps:</strong><br/>${summary.followUpSteps}</p>`;

  return { subject: `Your visit summary from Dr. ${doctorName}`, html: renderEmail({ heading: 'Visit Summary', bodyHtml }) };
}

module.exports = { postVisitSummaryTemplate };
