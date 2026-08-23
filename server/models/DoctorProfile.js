const mongoose = require('mongoose');

const workingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: { type: String, required: true }, // "HH:MM" 24h
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialisation: { type: String, required: true, trim: true },
  qualifications: { type: String, trim: true },
  workingHours: { type: [workingHourSchema], default: [] },
  slotDuration: { type: Number, default: 30 }, // minutes
  leaveDays: { type: [Date], default: [] },
  bio: { type: String, trim: true },
  profileImage: { type: String, trim: true },
  isActive: { type: Boolean, default: true },

  /* ── Directory fields (populated from the practitioner dataset) ── */
  // `specialities` holds the specialisation split into individually searchable
  // tags, because the source data packs several into one comma-joined string.
  specialities: { type: [String], default: [], index: true },
  city: { type: String, trim: true, index: true },
  locality: { type: String, trim: true },
  consultationFee: { type: Number, default: 0, index: true },
  experienceYears: { type: Number, default: 0, index: true },
  rating: { type: Number, default: 0 },       // 0–5, derived from the dataset's recommendation %
  reviewCount: { type: Number, default: 0 },
  source: { type: String, enum: ['manual', 'dataset'], default: 'manual' },
});

// Powers the free-text search box on the doctor directory.
doctorProfileSchema.index({ specialisation: 'text', qualifications: 'text', city: 'text', locality: 'text' });
// Default directory sort: highest rated first, then most experienced.
doctorProfileSchema.index({ isActive: 1, rating: -1, experienceYears: -1 });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
