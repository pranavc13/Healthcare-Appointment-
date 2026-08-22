const Appointment = require('../models/Appointment');
const { generatePreVisitSummary, generatePostVisitSummary } = require('../services/llm');

const MAX_RETRIES = 3;

// Every 15 minutes: re-attempts Gemini generation for appointments where the initial
// call failed (llmFailed:true), up to 3 tries. Regenerates the summary field in place
// for the UI to pick up — does not re-send any email that already went out with a
// fallback message.
async function llmRetry() {
  const pending = await Appointment.find({
    $or: [
      { 'preVisitSummary.llmFailed': true, 'preVisitSummary.llmRetryCount': { $lt: MAX_RETRIES } },
      { 'postVisitSummary.llmFailed': true, 'postVisitSummary.llmRetryCount': { $lt: MAX_RETRIES } },
    ],
  });

  let recovered = 0;
  for (const appointment of pending) {
    if (appointment.preVisitSummary?.llmFailed && appointment.preVisitSummary.llmRetryCount < MAX_RETRIES) {
      try {
        appointment.preVisitSummary = await generatePreVisitSummary(appointment.symptoms);
        recovered += 1;
      } catch (err) {
        appointment.preVisitSummary.llmRetryCount += 1;
        appointment.preVisitSummary.llmError = err.message;
      }
    }

    if (appointment.postVisitSummary?.llmFailed && appointment.postVisitSummary.llmRetryCount < MAX_RETRIES) {
      try {
        appointment.postVisitSummary = await generatePostVisitSummary(appointment.doctorNotes, appointment.prescription);
        recovered += 1;
      } catch (err) {
        appointment.postVisitSummary.llmRetryCount += 1;
        appointment.postVisitSummary.llmError = err.message;
      }
    }

    await appointment.save();
  }

  if (pending.length > 0) {
    console.log(`[jobs:llmRetry] processed ${pending.length} appointment(s), recovered ${recovered} summaries`);
  }
}

module.exports = llmRetry;
