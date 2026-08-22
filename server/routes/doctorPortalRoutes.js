const express = require('express');
const {
  myAppointments,
  getAppointment,
  completeAppointment,
  getProfile,
  updateProfile,
} = require('../controllers/doctorPortalController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect, requireRole('doctor'));

router.get('/appointments', myAppointments);
router.get('/appointments/:id', getAppointment);
router.put('/appointments/:id/complete', completeAppointment);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
