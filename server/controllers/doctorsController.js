const DoctorProfile = require('../models/DoctorProfile');
const asyncHandler = require('../utils/asyncHandler');
const { getAvailableSlots } = require('../services/slots');

// GET /api/doctors?specialisation=&search= — public listing.
const listDoctors = asyncHandler(async (req, res) => {
  const { specialisation, search } = req.query;
  const filter = { isActive: true };
  if (specialisation) {
    filter.specialisation = new RegExp(specialisation, 'i');
  }

  let query = DoctorProfile.find(filter).populate('userId', 'name email phone');

  const doctors = await query;
  const filtered = search
    ? doctors.filter((d) => d.userId && new RegExp(search, 'i').test(d.userId.name))
    : doctors;

  res.json(filtered);
});

// GET /api/doctors/:id — public detail.
const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findOne({ _id: req.params.id, isActive: true }).populate(
    'userId',
    'name email phone'
  );
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }
  res.json(doctor);
});

// GET /api/doctors/:id/slots?date=YYYY-MM-DD — public availability for one day.
const getSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ message: 'date query param (YYYY-MM-DD) is required' });
  }

  const doctor = await DoctorProfile.findOne({ _id: req.params.id, isActive: true });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const slots = await getAvailableSlots(doctor, date);
  res.json({ date, slotDuration: doctor.slotDuration, slots });
});

module.exports = { listDoctors, getDoctor, getSlots };
