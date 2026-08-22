const { GoogleGenerativeAI } = require('@google/generative-ai');

let client = null;
function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
}

// Gemini sometimes wraps JSON in ```json ... ``` fences despite instructions not to.
// Strip those defensively before parsing, and surface a clear error if it still isn't valid JSON.
function parseJsonResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`LLM did not return valid JSON: ${err.message}`);
  }
}

async function generatePreVisitSummary(symptoms) {
  const prompt = `You are a medical triage assistant. Analyse these patient-reported symptoms and return a JSON response with:
1. urgencyLevel: 'Low' | 'Medium' | 'High'
2. chiefComplaint: one-line summary of the main concern
3. suggestedQuestions: array of exactly 3 questions the doctor should ask during the visit

Patient symptoms: ${symptoms}

Respond ONLY with valid JSON, no markdown formatting.`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseJsonResponse(text);

  if (!parsed.urgencyLevel || !parsed.chiefComplaint || !Array.isArray(parsed.suggestedQuestions)) {
    throw new Error('LLM response missing required fields');
  }

  return {
    urgencyLevel: parsed.urgencyLevel,
    chiefComplaint: parsed.chiefComplaint,
    suggestedQuestions: parsed.suggestedQuestions,
    generatedAt: new Date(),
    llmFailed: false,
    llmError: undefined,
  };
}

async function generatePostVisitSummary(notes, prescription) {
  const prompt = `You are a patient communication specialist. Convert these clinical notes and prescription into a patient-friendly summary. Use simple language a non-medical person can understand. Include:
1. patientFriendlySummary: 2-3 paragraph explanation of the diagnosis and treatment plan
2. medicationSchedule: clear table/list of when to take each medication
3. followUpSteps: numbered list of what the patient should do next

Clinical notes: ${notes}
Prescription: ${JSON.stringify(prescription)}

Respond ONLY with valid JSON, no markdown formatting.`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseJsonResponse(text);

  if (!parsed.patientFriendlySummary || !parsed.medicationSchedule || !parsed.followUpSteps) {
    throw new Error('LLM response missing required fields');
  }

  return {
    patientFriendlySummary: parsed.patientFriendlySummary,
    medicationSchedule:
      typeof parsed.medicationSchedule === 'string'
        ? parsed.medicationSchedule
        : JSON.stringify(parsed.medicationSchedule),
    followUpSteps:
      typeof parsed.followUpSteps === 'string' ? parsed.followUpSteps : JSON.stringify(parsed.followUpSteps),
    generatedAt: new Date(),
    llmFailed: false,
    llmError: undefined,
  };
}

module.exports = { generatePreVisitSummary, generatePostVisitSummary };
