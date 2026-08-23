const express = require('express');
const { listDoctors, getFacets, getDoctor, getSlots } = require('../controllers/doctorsController');

const router = express.Router();

router.get('/', listDoctors);
router.get('/facets', getFacets); // must precede /:id so "facets" isn't read as an id
router.get('/:id', getDoctor);
router.get('/:id/slots', getSlots);

module.exports = router;
