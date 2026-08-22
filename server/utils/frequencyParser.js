// Maps a doctor's free-text prescription "frequency" field to a list of "HH:MM"
// times-of-day. Frequency is entered as free text (e.g. "twice daily", "TID",
// "every 8 hours"), so this is a best-effort heuristic, not a medical parser —
// documented as such in README.md. Falls back to once/day when nothing matches.
const PATTERNS = [
  { re: /\b(once|1x|one time)\b.*\bday|daily\b|\bOD\b/i, times: ['09:00'] },
  { re: /\btwice\b|\b2x\b|\btwo times\b|\bBID\b/i, times: ['09:00', '21:00'] },
  { re: /\bthrice\b|\bthree times\b|\b3x\b|\bTID\b/i, times: ['09:00', '14:00', '21:00'] },
  { re: /\bfour times\b|\b4x\b|\bQID\b/i, times: ['09:00', '13:00', '17:00', '21:00'] },
];

function parseFrequency(frequency = '') {
  const text = frequency.trim();

  const everyNHours = text.match(/every\s+(\d+)\s*hours?/i);
  if (everyNHours) {
    const interval = Math.max(1, parseInt(everyNHours[1], 10));
    const times = [];
    for (let h = 8; h < 24; h += interval) {
      times.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return times.length > 0 ? times : ['09:00'];
  }

  for (const { re, times } of PATTERNS) {
    if (re.test(text)) return times;
  }

  return ['09:00']; // sensible default: once daily, morning
}

module.exports = { parseFrequency };
