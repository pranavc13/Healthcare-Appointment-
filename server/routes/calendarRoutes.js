const express = require('express');
const { getAuthUrl, callback } = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/auth-url', protect, getAuthUrl);
router.get('/callback', callback); // public — Google redirects here directly

module.exports = router;
