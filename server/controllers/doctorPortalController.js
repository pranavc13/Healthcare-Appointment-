const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generatePostVisitSummary } = require('../services/llm');
const { sendAndLog } = require('../services/email');
const { postVisitSummaryTemplate } = require('../templates/postVisitSummary');

async function resolveOwnDoctorProfile(req, res) {
  const doctor = await DoctorProfile.findOne({ userId: req.user._id });
  if (!doctor) {
    res.status(404).json({ message: 'Doctor profile not found for this account' });
    return null;
  }
  return doctor;
}

// GET /api/doctor/appointments
const myAppointments = asyncHandler(async (req, res) => {
  const doctor = await resolveOwnDoctorProfile(req, res);
  if (!doctor) return;

  const appointments = await Appointment.find({ doctorId: doctor._id, status: { $ne: 'pending' } })
    .sort({ date: -1, startTime: -1 })
    .populate('patientId', 'name email phone');
  res.json(appointments);
});

// GET /api/doctor/appointments/:id
const getAppointment = asyncHandler(async (req, res) => {
  const doctor = await resolveOwnDoctorProfile(req, res);
  if (!doctor) return;

  const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: doctor._id }).populate(
    'patientId',
    'name email phone'
  );
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  res.json(appointment);
});

// PUT /api/doctor/appointments/:id/complete
const completeAppointment = asyncHandler(async (req, res) => {
  const doctor = await resolveOwnDoctorProfile(req, res);
  if (!doctor) return;

  const { notes, prescription } = req.body;
  if (!notes) {
    return res.status(400).json({ message: 'notes is required' });
  }

  const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: doctor._id }).populate(
    'patientId',
    'name email'
  );
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  if (appointment.status !== 'confirmed') {
    return res.status(400).json({ message: 'Only confirmed appointments can be completed' });
  }

  appointment.doctorNotes = notes;
  appointment.prescription = Array.isArray(prescription) ? prescription : [];
  appointment.status = 'completed';

  // Post-visit summary is awaited (unlike pre-visit) because the confirmation email
  // needs its content; on failure we fall back to a plain rendering of the raw notes
  // so the patient still gets something useful right away, while the 15-min LLM retry
  // cron fills in the polished AI version afterwards.
  let emailFallback = null;
  try {
    appointment.postVisitSummary = await generatePostVisitSummary(notes, appointment.prescription);
  } catch (err) {
    console.error('[llm] post-visit summary failed:', err.message);
    appointment.postVisitSummary = { llmFailed: true, llmError: err.message, llmRetryCount: 0 };
    emailFallback = `Doctor's notes: ${notes}\n\nPrescription: ${appointment.prescription
      .map((p) => `${p.medication} — ${p.dosage}, ${p.frequency}, for ${p.duration}`)
      .join('; ') || 'None'}`;
  }

  await appointment.save();

  const doctorUser = req.user;
  const patientUser = appointment.patientId;
  if (patientUser?.email) {
    const template = postVisitSummaryTemplate({
      doctorName: doctorUser.name,
      summary: appointment.postVisitSummary,
      fallback: emailFallback,
    });
    await sendAndLog({
      userId: patientUser._id,
      appointmentId: appointment._id,
      type: 'post_visit_summary',
      to: patientUser.email,
      subject: template.subject,
      html: template.html,
    });
  }

  res.json(appointment);
});

// GET /api/doctor/profile
const getProfile = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found for this account' });
  }
  res.json(doctor);
});

// PUT /api/doctor/profile — self-service bio/qualifications only.
const updateProfile = asyncHandler(async (req, res) => {
  const doctor = await DoctorProfile.findOne({ userId: req.user._id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor profile not found for this account' });
  }

  const { bio, qualifications, profileImage } = req.body;
  if (bio !== undefined) doctor.bio = bio;
  if (qualifications !== undefined) doctor.qualifications = qualifications;
  if (profileImage !== undefined) doctor.profileImage = profileImage;
  await doctor.save();

  res.json(doctor);
});

module.exports = { myAppointments, getAppointment, completeAppointment, getProfile, updateProfile };
