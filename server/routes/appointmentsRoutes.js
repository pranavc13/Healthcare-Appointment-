const express = require('express');
const {
  holdSlot,
  confirmAppointment,
  myAppointments,
  cancelAppointment,
  rescheduleAppointment,
} = require('../controllers/appointmentsController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect, requireRole('patient'));

router.post('/hold', holdSlot);
router.post('/confirm', confirmAppointment);
router.get('/my', myAppointments);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', rescheduleAppointment);

module.exports = router;
