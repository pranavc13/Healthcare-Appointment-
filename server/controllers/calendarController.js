const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const calendarService = require('../services/calendar');

// GET /api/calendar/auth-url — protected, any authenticated role.
const getAuthUrl = asyncHandler(async (req, res) => {
  const url = calendarService.getAuthUrl(req.user);
  res.json({ url });
});

// GET /api/calendar/callback — public; Google redirects here directly (no auth header),
// so the requesting user's identity travels in the signed `state` JWT instead.
const callback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (error || !code || !state) {
    return res.redirect(`${clientUrl}/calendar-connect?connected=0`);
  }

  let decoded;
  try {
    decoded = calendarService.verifyState(state);
  } catch (err) {
    return res.redirect(`${clientUrl}/calendar-connect?connected=0`);
  }

  try {
    const refreshToken = await calendarService.exchangeCodeForRefreshToken(code);
    const encrypted = calendarService.encryptToken(refreshToken);

    await User.findByIdAndUpdate(decoded.id, {
      googleCalendarRefreshToken: encrypted,
      googleCalendarConnected: true,
    });

    const path = decoded.role === 'doctor' ? '/doctor/calendar-connect' : '/patient/calendar-connect';
    return res.redirect(`${clientUrl}${path}?connected=1`);
  } catch (err) {
    console.error('[calendar] OAuth callback failed:', err.message);
    const path = decoded.role === 'doctor' ? '/doctor/calendar-connect' : '/patient/calendar-connect';
    return res.redirect(`${clientUrl}${path}?connected=0`);
  }
});

module.exports = { getAuthUrl, callback };
