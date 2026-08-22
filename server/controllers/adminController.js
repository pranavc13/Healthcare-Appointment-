const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const { normalizeDateOnly } = require('../services/slots');
const { notifyCancellation, deleteCalendarEvents } = require('../services/appointmentEvents');

// GET /api/admin/doctors
const listDoctors = asyncHandler(async (req, res) => {
  const doctors = await DoctorProfile.find().populate('userId', 'name email phone');
  res.json(doctors);
});

// POST /api/admin/doctors — creates the User (role=doctor) and DoctorProfile together.
const createDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, phone, specialisation, qualifications, bio, slotDuration, workingHours } = req.body;
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
      qualifications,
      bio,
      slotDuration: slotDuration || 30,
      workingHours: workingHours || [],
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

  const { specialisation, qualifications, bio, profileImage, slotDuration, workingHours, isActive } = req.body;
  if (specialisation !== undefined) doctor.specialisation = specialisation;
  if (qualifications !== undefined) doctor.qualifications = qualifications;
  if (bio !== undefined) doctor.bio = bio;
  if (profileImage !== undefined) doctor.profileImage = profileImage;
  if (slotDuration !== undefined) doctor.slotDuration = slotDuration;
  if (workingHours !== undefined) doctor.workingHours = workingHours;
  if (isActive !== undefined) doctor.isActive = isActive;
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
