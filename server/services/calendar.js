const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('./crypto');

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// The OAuth callback is hit directly by Google (no Authorization header from our app),
// so we thread the requesting user's identity through as the `state` param, itself a
// short-lived signed JWT, rather than relying on a session cookie.
function getAuthUrl(user) {
  const client = getOAuthClient();
  const state = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state,
  });
}

function verifyState(state) {
  return jwt.verify(state, process.env.JWT_SECRET);
}

async function exchangeCodeForRefreshToken(code) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      'No refresh token returned by Google. Revoke prior access at https://myaccount.google.com/permissions and reconnect.'
    );
  }
  return tokens.refresh_token;
}

function clientFor(encryptedRefreshToken) {
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: decrypt(encryptedRefreshToken) });
  return google.calendar({ version: 'v3', auth: client });
}

// Every function below is called from best-effort call sites that catch and log
// failures without letting a calendar error break the appointment operation.

async function createEvent(encryptedRefreshToken, { summary, description, startISO, endISO }) {
  const calendar = clientFor(encryptedRefreshToken);
  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary,
      description,
      start: { dateTime: startISO },
      end: { dateTime: endISO },
    },
  });
  return data.id;
}

async function updateEvent(encryptedRefreshToken, eventId, { summary, description, startISO, endISO }) {
  const calendar = clientFor(encryptedRefreshToken);
  await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: {
      summary,
      description,
      start: { dateTime: startISO },
      end: { dateTime: endISO },
    },
  });
}

async function deleteEvent(encryptedRefreshToken, eventId) {
  const calendar = clientFor(encryptedRefreshToken);
  await calendar.events.delete({ calendarId: 'primary', eventId });
}

module.exports = {
  getAuthUrl,
  verifyState,
  exchangeCodeForRefreshToken,
  createEvent,
  updateEvent,
  deleteEvent,
  encryptToken: encrypt,
};
