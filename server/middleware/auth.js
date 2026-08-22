const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the Bearer JWT and attaches the current user document to req.user.
// Re-fetches from the DB (rather than trusting the token payload alone) so a
// deactivated/deleted account can't keep using a still-valid token.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ message: 'Not authorized, user no longer exists' });
  }

  req.user = user;
  next();
});

module.exports = { protect };
