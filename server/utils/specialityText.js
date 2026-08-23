/**
 * The practitioner dataset stores specialities as one packed string, and several
 * rows have category prefixes glued straight onto the speciality with no
 * separator ("AYUSHHomoeopath", "TherapistPhysiotherapist", "Nephrologist/Renal
 * Specialist"). These helpers produce a readable display string and a list of
 * individually searchable tags.
 */

const GLUED_PREFIXES = ['AYUSH', 'Therapist', 'Dietitian', 'Counsellor'];

function unglue(raw) {
  let out = String(raw || '').trim();
  for (const prefix of GLUED_PREFIXES) {
    // "AYUSHHomoeopath" -> "AYUSH Homoeopath"; leaves a bare "AYUSH" alone.
    out = out.replace(new RegExp(`\\b${prefix}(?=[A-Z][a-z])`, 'g'), `${prefix} `);
  }
  // A lowercase letter followed by an uppercase one is another run-together
  // boundary ("SurgeonDentist"), but never inside an all-caps acronym.
  return out.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s{2,}/g, ' ').trim();
}

/** Human-readable label shown on cards, filters and profile headers. */
function displaySpeciality(raw) {
  const cleaned = unglue(raw);
  return cleaned || 'General Physician';
}

/** Individually searchable tags split out of the packed string. */
function specialityTags(raw) {
  const cleaned = unglue(raw).replace(/\//g, ', ');
  return [...new Set(cleaned.split(',').map((s) => s.trim()).filter((s) => s.length > 2))];
}

module.exports = { displaySpeciality, specialityTags };
