const express = require('express');
const { myNotifications } = require('../controllers/notificationsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, myNotifications);

module.exports = router;
