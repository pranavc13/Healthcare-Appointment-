const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { getAvailableSlots } = require('../services/slots');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  rating: { rating: -1, reviewCount: -1 },
  experience: { experienceYears: -1, rating: -1 },
  fee_asc: { consultationFee: 1, rating: -1 },
  fee_desc: { consultationFee: -1, rating: -1 },
};

// GET /api/doctors — public directory with filtering, sorting and pagination.
// Query: specialisation, city, search, minFee, maxFee, minExperience, sort, page, limit
const listDoctors = asyncHandler(async (req, res) => {
  const { specialisation, city, search, minFee, maxFee, minExperience, sort } = req.query;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 60);

  const filter = { isActive: true };
  if (specialisation) filter.specialisation = new RegExp(escapeRegex(specialisation), 'i');
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
  if (minExperience) filter.experienceYears = { $gte: Number(minExperience) };
  if (minFee || maxFee) {
    filter.consultationFee = {};
    if (minFee) filter.consultationFee.$gte = Number(minFee);
    if (maxFee) filter.consultationFee.$lte = Number(maxFee);
  }

  // The name lives on the User document, so a name search resolves to ids first.
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const matchedUsers = await User.find({ role: 'doctor', name: rx }).select('_id').limit(400).lean();
    filter.$or = [
      { userId: { $in: matchedUsers.map((u) => u._id) } },
      { specialisation: rx },
      { qualifications: rx },
      { locality: rx },
    ];
  }

  const [doctors, total] = await Promise.all([
    DoctorProfile.find(filter)
      .populate('userId', 'name email phone')
      .sort(SORTS[sort] || SORTS.rating)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    DoctorProfile.countDocuments(filter),
  ]);

  res.json({
    doctors: doctors.filter((d) => d.userId),
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  });
});

// GET /api/doctors/facets — filter options + headline counts for the directory UI.
const getFacets = asyncHandler(async (req, res) => {
  const [cities, specialities, stats] = await Promise.all([
    DoctorProfile.aggregate([
      { $match: { isActive: true, city: { $nin: [null, ''] } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 40 },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ]),
    DoctorProfile.aggregate([
      { $match: { isActive: true, specialisation: { $nin: [null, ''] } } },
      { $group: { _id: '$specialisation', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 40 },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ]),
    DoctorProfile.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalDoctors: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          maxFee: { $max: '$consultationFee' },
          cities: { $addToSet: '$city' },
        },
      },
    ]),
  ]);

  const s = stats[0] || {};
  res.json({
    cities,
    specialities,
    stats: {
      totalDoctors: s.totalDoctors || 0,
      totalCities: (s.cities || []).filter(Boolean).length,
      avgRating: Math.round((s.avgRating || 0) * 10) / 10,
      maxFee: s.maxFee || 0,
    },
  });
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

module.exports = { listDoctors, getFacets, getDoctor, getSlots };
