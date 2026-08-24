/**
 * Smoke-tests the three external integrations against the current .env, so a
 * misconfigured key surfaces here rather than as a silently-failed booking.
 *
 *   node scripts/checkIntegrations.js
 *   node scripts/checkIntegrations.js --email you@example.com   # also send a real test email
 *
 * Exits non-zero if any configured integration fails. Integrations left blank in
 * .env are reported as SKIPPED, not failures.
 */
require('dotenv').config();

const args = process.argv.slice(2);
const emailTarget = (() => {
  const i = args.indexOf('--email');
  return i !== -1 ? args[i + 1] : null;
})();

const results = [];
const record = (name, status, detail) => {
  results.push({ name, status, detail });
  const icon = { ok: 'PASS', fail: 'FAIL', skip: 'SKIP' }[status];
  console.log(`[${icon}] ${name}${detail ? ` — ${detail}` : ''}`);
};

/* ── 1. Gemini ─────────────────────────────────────────────────────── */
async function checkGemini() {
  if (!process.env.GEMINI_API_KEY) {
    return record('Gemini', 'skip', 'GEMINI_API_KEY is empty');
  }

  // The v1beta models-list endpoint is not a reliable predictor of what a given
  // key can actually call — it has listed models as generateContent-capable that
  // then 404 at call time as "no longer available to new users". So skip the
  // list-based pre-check entirely and just attempt the real round-trip; Google's
  // 404 message itself usually names the model to switch to, which we surface.
  const configured = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  try {
    const { generatePreVisitSummary } = require('../services/llm');
    const summary = await generatePreVisitSummary(
      'Chest tightness on exertion for four days, mild breathlessness climbing stairs.'
    );
    record('Gemini', 'ok', `${configured} → urgency "${summary.urgencyLevel}", ${summary.suggestedQuestions.length} questions`);
  } catch (err) {
    const suggestion = /models\/([\w.-]+)/.exec(err.message)?.[1];
    record(
      'Gemini',
      'fail',
      suggestion ? `${err.message} — try GEMINI_MODEL=${suggestion}` : err.message
    );
  }
}

/* ── 2. SMTP ───────────────────────────────────────────────────────── */
async function checkSmtp() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return record('SMTP', 'skip', 'SMTP_HOST/SMTP_USER are empty');
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  try {
    await transporter.verify();
  } catch (err) {
    return record('SMTP', 'fail', `${err.message} (Gmail needs a 16-char App Password, not your login password)`);
  }

  if (!emailTarget) {
    return record('SMTP', 'ok', 'credentials accepted (pass --email <you@example.com> to send a real test)');
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: emailTarget,
      subject: 'DocConnect — integration test',
      html: '<p>If you are reading this, Nodemailer is wired up correctly.</p>',
    });
    record('SMTP', 'ok', `test email delivered to ${emailTarget}`);
  } catch (err) {
    record('SMTP', 'fail', `verify passed but send failed: ${err.message}`);
  }
}

/* ── 3. Google Calendar OAuth ──────────────────────────────────────── */
async function checkCalendar() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return record('Google Calendar', 'skip', 'GOOGLE_CLIENT_ID/SECRET are empty');
  }
  if (!GOOGLE_REDIRECT_URI) {
    return record('Google Calendar', 'fail', 'GOOGLE_REDIRECT_URI is not set');
  }

  // A full OAuth round-trip needs a human at a browser, so verify what can be
  // checked without one: credential shape, and that Google accepts the client.
  if (!/\.apps\.googleusercontent\.com$/.test(GOOGLE_CLIENT_ID)) {
    return record('Google Calendar', 'fail', 'GOOGLE_CLIENT_ID should end in .apps.googleusercontent.com');
  }

  try {
    // Deliberately exchange a bogus code: "invalid_grant" proves the client id and
    // secret were accepted, whereas "invalid_client" means they were rejected.
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: 'integration-check-not-a-real-code',
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const body = await res.json();

    if (body.error === 'invalid_client') {
      return record('Google Calendar', 'fail', 'Google rejected the client id/secret pair');
    }
    if (body.error === 'invalid_grant' || body.error === 'invalid_request') {
      const { google } = require('googleapis');
      const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
      const url = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
      });
      return record('Google Calendar', 'ok', `credentials accepted; consent URL builds (${url.slice(0, 60)}…)`);
    }
    record('Google Calendar', 'fail', `unexpected response: ${JSON.stringify(body).slice(0, 160)}`);
  } catch (err) {
    record('Google Calendar', 'fail', err.message);
  }
}

/* ── 4. Secrets sanity ─────────────────────────────────────────────── */
function checkSecrets() {
  const weak = [];
  for (const key of ['JWT_SECRET', 'ENCRYPTION_KEY']) {
    const v = process.env[key] || '';
    if (!v) weak.push(`${key} is empty`);
    else if (v.length < 32 || /dev|change|secret|placeholder/i.test(v)) weak.push(`${key} looks like a placeholder`);
  }
  if (weak.length) record('Secrets', 'fail', weak.join('; '));
  else record('Secrets', 'ok', 'JWT_SECRET and ENCRYPTION_KEY look strong');
}

(async () => {
  console.log('Checking integrations against server/.env\n');
  checkSecrets();
  await checkGemini();
  await checkSmtp();
  await checkCalendar();

  const failed = results.filter((r) => r.status === 'fail');
  const skipped = results.filter((r) => r.status === 'skip');
  console.log(`\n${results.length - failed.length - skipped.length} passed, ${failed.length} failed, ${skipped.length} skipped.`);
  // Setting exitCode (rather than calling exit()) lets Node finish tearing down
  // any pending sockets on its own instead of racing a hard exit against them.
  process.exitCode = failed.length ? 1 : 0;
})();
