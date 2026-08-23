const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const { normalizeDateOnly } = require('../services/slots');
const { notifyCancellation, deleteCalendarEvents } = require('../services/appointmentEvents');

// GET /api/admin/doctors?search=&page=&limit= — paginated because the directory
// holds tens of thousands of profiles once the dataset is imported.
const listDoctors = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const { search } = req.query;

  const filter = {};
  if (search) {
    const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const matchedUsers = await User.find({ role: 'doctor', name: rx }).select('_id').limit(400).lean();
    filter.$or = [
      { userId: { $in: matchedUsers.map((u) => u._id) } },
      { specialisation: rx },
      { city: rx },
    ];
  }

  const [doctors, total] = await Promise.all([
    DoctorProfile.find(filter)
      .populate('userId', 'name email phone')
      .sort({ isActive: -1, rating: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    DoctorProfile.countDocuments(filter),
  ]);

  res.json({ doctors, page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) });
});

// POST /api/admin/doctors — creates the User (role=doctor) and DoctorProfile together.
const createDoctor = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone, specialisation, qualifications, bio, slotDuration, workingHours,
    city, locality, consultationFee, experienceYears,
  } = req.body;
  if (!name || !email || !password || !specialisation) {
    return res.status(400).json({ message: 'name, email, password and specialisation are required' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, phone, role: 'doctor' });

  let profile;
  try {
    profile = await DoctorProfile.create({
      userId: user._id,
      specialisation,
      specialities: specialisation.split(',').map((s) => s.trim()).filter(Boolean),
      qualifications,
      bio,
      slotDuration: slotDuration || 30,
      workingHours: workingHours || [],
      city,
      locality,
      consultationFee: consultationFee || 0,
      experienceYears: experienceYears || 0,
    });
  } catch (err) {
    // Roll back the just-created user so we don't leave an orphaned account behind.
    await User.deleteOne({ _id: user._id });
    throw err;
  }

  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, profile });
});

// PUT /api/admin/doctors/:id — updates the DoctorProfile (id = DoctorProfile _id).
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const {
    specialisation, qualifications, bio, profileImage, slotDuration, workingHours, isActive,
    city, locality, consultationFee, experienceYears,
  } = req.body;
  if (specialisation !== undefined) {
    doctor.specialisation = specialisation;
    doctor.specialities = specialisation.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (qualifications !== undefined) doctor.qualifications = qualifications;
  if (bio !== undefined) doctor.bio = bio;
  if (profileImage !== undefined) doctor.profileImage = profileImage;
  if (slotDuration !== undefined) doctor.slotDuration = slotDuration;
  if (workingHours !== undefined) doctor.workingHours = workingHours;
  if (isActive !== undefined) doctor.isActive = isActive;
  if (city !== undefined) doctor.city = city;
  if (locality !== undefined) doctor.locality = locality;
  if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
  if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
  await doctor.save();

  res.json(doctor);
});

// DELETE /api/admin/doctors/:id — soft delete (deactivate), never a hard delete.
const deactivateDoctor = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }
  doctor.isActive = false;
  await doctor.save();
  res.json({ message: 'Doctor deactivated', doctor });
});

// PUT /api/admin/doctors/:id/leave — body: { date } or { dates: [] }.
// Adds the day(s) to leaveDays, then batch-cancels every confirmed appointment on
// those dates, emailing each affected patient and deleting their calendar events.
const markLeave = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const rawDates = req.body.dates || (req.body.date ? [req.body.date] : []);
  if (rawDates.length === 0) {
    return res.status(400).json({ message: 'date or dates is required' });
  }
  const dateOnlyList = rawDates.map(normalizeDateOnly);

  const existingKeys = new Set((doctor.leaveDays || []).map((d) => normalizeDateOnly(d).getTime()));
  for (const d of dateOnlyList) {
    if (!existingKeys.has(d.getTime())) {
      doctor.leaveDays.push(d);
      existingKeys.add(d.getTime());
    }
  }
  await doctor.save();

  const doctorUser = await User.findById(doctor.userId).select('+googleCalendarRefreshToken');
  const affected = await Appointment.find({
    doctorId: doctor._id,
    date: { $in: dateOnlyList },
    status: 'confirmed',
  }).populate('patientId', 'name email googleCalendarRefreshToken googleCalendarConnected');

  let cancelledCount = 0;
  for (const appointment of affected) {
    appointment.status = 'cancelled';
    await appointment.save();
    cancelledCount += 1;

    const patientUser = appointment.patientId;
    if (patientUser) {
      await notifyCancellation(appointment, patientUser, doctorUser, { leaveTriggered: true });
      await deleteCalendarEvents(appointment, patientUser, doctorUser);
    }
  }

  res.json({ doctor, cancelledAppointments: cancelledCount });
});

module.exports = { listDoctors, createDoctor, updateDoctor, deactivateDoctor, markLeave };
