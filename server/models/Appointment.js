const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema(
  {
    medication: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    duration: { type: String, trim: true },
    instructions: { type: String, trim: true },
  },
  { _id: false }
);

const preVisitSummarySchema = new mongoose.Schema(
  {
    urgencyLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    chiefComplaint: { type: String },
    suggestedQuestions: { type: [String], default: [] },
    generatedAt: { type: Date },
    llmFailed: { type: Boolean, default: false },
    llmError: { type: String },
    llmRetryCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const postVisitSummarySchema = new mongoose.Schema(
  {
    patientFriendlySummary: { type: String },
    medicationSchedule: { type: String },
    followUpSteps: { type: String },
    generatedAt: { type: Date },
    llmFailed: { type: Boolean, default: false },
    llmError: { type: String },
    llmRetryCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
    date: { type: Date, required: true }, // stored at UTC midnight representing the calendar day
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending',
    },
    symptoms: { type: String, default: '' },
    preVisitSummary: { type: preVisitSummarySchema, default: () => ({}) },
    postVisitSummary: { type: postVisitSummarySchema, default: () => ({}) },
    doctorNotes: { type: String },
    prescription: { type: [prescriptionItemSchema], default: [] },
    googleCalendarEventId_patient: { type: String },
    googleCalendarEventId_doctor: { type: String },
    heldUntil: { type: Date },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Double-booking prevention: unique per (doctor, date, startTime) but ONLY while the
// appointment is actively occupying that slot (pending hold or confirmed booking).
// Cancelled / completed / rescheduled documents don't block the slot key from reuse.
appointmentSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
  }
);

// Cron sweeps expired holds frequently; index keeps that query cheap.
appointmentSchema.index({ heldUntil: 1 });

// Fast lookups for each portal's "my appointments" views.
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
