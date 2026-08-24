/**
 * Static facts about the clinic, used across the landing page, About, auth
 * screens and footer so the marketing copy can't drift out of sync with
 * reality the way "17,613 specialists across 30 cities" once did.
 *
 * Doctor counts / ratings still come live from GET /api/doctors/facets — this
 * file only holds numbers that aren't tracked in the database (combined years
 * of experience, address, contact details).
 */
export const CLINIC_NAME = 'DocConnect';
export const CLINIC_TAGLINE = 'Dental Care, Done Right';
export const CLINIC_CITY = 'Bangalore';
export const CLINIC_LOCALITY = 'Indiranagar';
export const CLINIC_ADDRESS = '100 Feet Road, Indiranagar, Bangalore 560038';
export const CLINIC_PHONE_DISPLAY = '+91 80 4123 4567';
export const CLINIC_PHONE_TEL = '+918041234567';
export const CLINIC_EMAIL = 'care@docconnect.health';
export const COMBINED_YEARS_EXPERIENCE = 24; // 6 (Dr. Rajashekhar) + 18 (Dr. B S)
export const PATIENTS_TREATED = 600; // rounded from combined dataset review counts
export const CLINIC_HOURS = 'Tue–Sat, by appointment';
