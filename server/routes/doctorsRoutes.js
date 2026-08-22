const express = require('express');
const { listDoctors, getDoctor, getSlots } = require('../controllers/doctorsController');

const router = express.Router();

router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.get('/:id/slots', getSlots);

module.exports = router;
