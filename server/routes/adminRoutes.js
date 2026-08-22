const express = require('express');
const { listDoctors, createDoctor, updateDoctor, deactivateDoctor, markLeave } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.get('/doctors', listDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deactivateDoctor);
router.put('/doctors/:id/leave', markLeave);

module.exports = router;
