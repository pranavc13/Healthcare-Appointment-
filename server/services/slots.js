const Appointment = require('../models/Appointment');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(mins) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Normalizes any Date/string into a UTC-midnight Date representing just the calendar day.
// All appointment "date" values are stored this way so equality comparisons are exact.
function normalizeDateOnly(dateInput) {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isOnLeave(doctor, dateOnly) {
  return (doctor.leaveDays || []).some((leave) => {
    const l = normalizeDateOnly(leave);
    return l.getTime() === dateOnly.getTime();
  });
}

// Returns the list of available "HH:MM" start times for a doctor on a given date,
// derived from workingHours/slotDuration, minus slots that are booked, currently held,
// or fall on a leave day.
async function getAvailableSlots(doctor, dateInput) {
  const dateOnly = normalizeDateOnly(dateInput);

  if (isOnLeave(doctor, dateOnly)) {
    return [];
  }

  const dayName = DAY_NAMES[dateOnly.getUTCDay()];
  const hoursForDay = (doctor.workingHours || []).filter((wh) => wh.day === dayName);
  if (hoursForDay.length === 0) {
    return [];
  }

  const slotDuration = doctor.slotDuration || 30;
  const allSlots = [];
  for (const range of hoursForDay) {
    const start = toMinutes(range.startTime);
    const end = toMinutes(range.endTime);
    for (let t = start; t + slotDuration <= end; t += slotDuration) {
      allSlots.push(toHHMM(t));
    }
  }

  const now = new Date();
  const nextDay = new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000);
  const occupied = await Appointment.find({
    doctorId: doctor._id,
    date: { $gte: dateOnly, $lt: nextDay },
    $or: [{ status: 'confirmed' }, { status: 'pending', heldUntil: { $gt: now } }],
  }).select('startTime');

  const occupiedTimes = new Set(occupied.map((a) => a.startTime));
  return allSlots.filter((slot) => !occupiedTimes.has(slot));
}

function addMinutesToTime(hhmm, minutes) {
  return toHHMM(toMinutes(hhmm) + minutes);
}

module.exports = { getAvailableSlots, normalizeDateOnly, addMinutesToTime, DAY_NAMES };
