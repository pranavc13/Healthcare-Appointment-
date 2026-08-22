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
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
