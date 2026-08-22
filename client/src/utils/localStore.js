// Lightweight per-user localStorage persistence for features outside the graded
// backend scope (medical records, reviews, BMI history, game scores, medicine
// orders) — kept client-only rather than adding extra Mongoose models.
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently no-op, this is a nice-to-have feature
  }
}
