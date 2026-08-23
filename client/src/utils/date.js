// Formats a Date's LOCAL calendar day as YYYY-MM-DD.
// Never use date.toISOString().slice(0, 10) for this — that converts to UTC first,
// which silently shifts the day backward in any positive-UTC-offset timezone (e.g. IST).
export function formatDateOnly(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
