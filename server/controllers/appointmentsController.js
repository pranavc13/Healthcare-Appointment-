const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { normalizeDateOnly, addMinutesToTime } = require('../services/slots');
const { generatePreVisitSummary } = require('../services/llm');
const { notifyBookingConfirmation, notifyCancellation, createCalendarEvents, deleteCalendarEvents, updateCalendarEvents } = require('../services/appointmentEvents');

const HOLD_MINUTES = 5;

// POST /api/appointments/hold — atomic slot hold. See SYSTEM_DESIGN.md for the
// double-booking-prevention rationale behind this exact findOneAndUpdate shape.
const holdSlot = asyncHandler(async (req, res) => {
  const { doctorId, date, startTime } = req.body;
  if (!doctorId || !date || !startTime) {
    return res.status(400).json({ message: 'doctorId, date and startTime are required' });
  }

  const doctor = await DoctorProfile.findOne({ _id: doctorId, isActive: true });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const dateOnly = normalizeDateOnly(date);
  const endTime = addMinutesToTime(startTime, doctor.slotDuration || 30);
  const now = new Date();
  const heldUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

  let appointment;
  try {
    appointment = await Appointment.findOneAndUpdate(
      {
        doctorId,
        date: dateOnly,
        startTime,
        $or: [
          { status: { $in: ['cancelled', 'completed', 'rescheduled'] } },
          { status: 'pending', heldUntil: { $lte: now } },
        ],
      },
      {
        $set: {
          doctorId,
          date: dateOnly,
          startTime,
          endTime,
          patientId: req.user._id,
          status: 'pending',
          heldUntil,
          symptoms: '',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This slot was just taken. Please choose another.' });
    }
    throw err;
  }

  res.status(200).json({ appointmentId: appointment._id, heldUntil: appointment.heldUntil });
});

// POST /api/appointments/confirm
const confirmAppointment = asyncHandler(async (req, res) => {
  const { appointmentId, symptoms } = req.body;
  if (!appointmentId) {
    return res.status(400).json({ message: 'appointmentId is required' });
  }

  const appointment = await Appointment.findOne({ _id: appointmentId, patientId: req.user._id });
  if (!appointment) {
    return res.status(404).json({ message: 'Held appointment not found' });
  }
  if (appointment.status !== 'pending') {
    return res.status(400).json({ message: 'This appointment is not in a holdable state' });
  }
  if (!appointment.heldUntil || appointment.heldUntil <= new Date()) {
    return res.status(410).json({ message: 'Your hold on this slot expired. Please pick a slot again.' });
  }

  appointment.symptoms = symptoms || '';
  appointment.status = 'confirmed';
  appointment.heldUntil = null;
  await appointment.save();

  const [doctorProfile, doctorUser, patientUser] = await Promise.all([
    DoctorProfile.findById(appointment.doctorId),
    DoctorProfile.findById(appointment.doctorId).then((d) => (d ? User.findById(d.userId) : null)),
    User.findById(appointment.patientId),
  ]);

  // Fire-and-forget: don't make the patient wait on Gemini before their booking confirms.
  if (appointment.symptoms) {
    generatePreVisitSummary(appointment.symptoms)
      .then(async (summary) => {
        await Appointment.updateOne({ _id: appointment._id }, { $set: { preVisitSummary: summary } });
      })
      .catch(async (err) => {
        console.error('[llm] pre-visit summary failed:', err.message);
        await Appointment.updateOne(
          { _id: appointment._id },
          { $set: { 'preVisitSummary.llmFailed': true, 'preVisitSummary.llmError': err.message } }
        );
      });
  }

  if (doctorUser && patientUser && doctorProfile) {
    await notifyBookingConfirmation(appointment, patientUser, doctorUser, doctorProfile);
    await createCalendarEvents(appointment, patientUser, doctorUser, doctorProfile);
    await appointment.save();
  }

  res.json(appointment);
});

// GET /api/appointments/my
const myAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patientId: req.user._id })
    .sort({ date: -1, startTime: -1 })
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } });
  res.json(appointments);
});

// PUT /api/appointments/:id/cancel
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, patientId: req.user._id });
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  if (!['pending', 'confirmed'].includes(appointment.status)) {
    return res.status(400).json({ message: 'This appointment cannot be cancelled' });
  }

  const doctorProfile = await DoctorProfile.findById(appointment.doctorId);
  const doctorUser = doctorProfile ? await User.findById(doctorProfile.userId) : null;
  const patientUser = await User.findById(appointment.patientId);

  appointment.status = 'cancelled';
  await appointment.save();

  if (doctorUser && patientUser) {
    await notifyCancellation(appointment, patientUser, doctorUser);
    await deleteCalendarEvents(appointment, patientUser, doctorUser);
  }

  res.json(appointment);
});

// PUT /api/appointments/:id/reschedule
const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { date, startTime } = req.body;
  if (!date || !startTime) {
    return res.status(400).json({ message: 'date and startTime are required' });
  }

  const oldAppointment = await Appointment.findOne({ _id: req.params.id, patientId: req.user._id });
  if (!oldAppointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  if (!['pending', 'confirmed'].includes(oldAppointment.status)) {
    return res.status(400).json({ message: 'This appointment cannot be rescheduled' });
  }

  const doctor = await DoctorProfile.findOne({ _id: oldAppointment.doctorId, isActive: true });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const dateOnly = normalizeDateOnly(date);
  const endTime = addMinutesToTime(startTime, doctor.slotDuration || 30);
  const now = new Date();

  let newAppointment;
  try {
    newAppointment = await Appointment.findOneAndUpdate(
      {
        doctorId: doctor._id,
        date: dateOnly,
        startTime,
        $or: [
          { status: { $in: ['cancelled', 'completed', 'rescheduled'] } },
          { status: 'pending', heldUntil: { $lte: now } },
        ],
      },
      {
        $set: {
          doctorId: doctor._id,
          date: dateOnly,
          startTime,
          endTime,
          patientId: req.user._id,
          status: 'confirmed',
          heldUntil: null,
          symptoms: oldAppointment.symptoms,
          preVisitSummary: oldAppointment.preVisitSummary,
          googleCalendarEventId_patient: oldAppointment.googleCalendarEventId_patient,
          googleCalendarEventId_doctor: oldAppointment.googleCalendarEventId_doctor,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This slot was just taken. Please choose another.' });
    }
    throw err;
  }

  oldAppointment.status = 'rescheduled';
  oldAppointment.googleCalendarEventId_patient = undefined;
  oldAppointment.googleCalendarEventId_doctor = undefined;
  await oldAppointment.save();

  const doctorUser = await User.findById(doctor.userId);
  const patientUser = await User.findById(req.user._id);
  if (doctorUser && patientUser) {
    await updateCalendarEvents(newAppointment, patientUser, doctorUser, doctor);
    await notifyBookingConfirmation(newAppointment, patientUser, doctorUser, doctor);
  }

  res.json(newAppointment);
});

module.exports = { holdSlot, confirmAppointment, myAppointments, cancelAppointment, rescheduleAppointment };
