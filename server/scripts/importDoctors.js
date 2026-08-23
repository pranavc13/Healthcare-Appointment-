/**
 * Imports the practitioner directory (server/data/doctors.jsonl, ~17.6k rows) into
 * MongoDB as real, bookable doctors: one User (role=doctor) + one DoctorProfile each.
 *
 *   node scripts/importDoctors.js               # import everything
 *   node scripts/importDoctors.js --limit 500   # import the first 500 rows
 *   node scripts/importDoctors.js --fresh       # wipe dataset-sourced doctors first
 *
 * Re-running is safe: rows already imported (matched by generated email) are skipped.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

const DATA_FILE = path.join(__dirname, '..', 'data', 'doctors.jsonl');
const EMAIL_DOMAIN = 'doctors.jeevanchakra.health';
const BATCH_SIZE = 500;

const args = process.argv.slice(2);
const FRESH = args.includes('--fresh');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i !== -1 && args[i + 1] ? parseInt(args[i + 1], 10) : Infinity;
})();
const DEFAULT_PASSWORD = process.env.DATASET_DOCTOR_PASSWORD || 'Doctor@123';

/* ── Field parsers ─────────────────────────────────────────────────── */

const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/^dr\.?\s*/, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 40) || 'doctor';

// A stable per-row integer, so every derived value (schedule, phone, fallback
// rating) stays identical across re-imports instead of drifting each run.
const seedOf = (key) => parseInt(crypto.createHash('md5').update(key).digest('hex').slice(0, 8), 16);

const parseFee = (raw) => {
  const digits = String(raw ?? '').replace(/[^\d]/g, '');
  return digits ? Math.min(parseInt(digits, 10), 100000) : 0;
};

const parseYears = (raw) => {
  const n = parseInt(String(raw ?? '').replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? Math.min(n, 70) : 0;
};

const parseReviewCount = (raw) => {
  const n = parseInt(String(raw ?? '').replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

// "97%" recommendation → a 5-point rating. Rows without a score fall back to a
// deterministic 4.1–4.6 band so the directory never shows a wall of empty stars.
const parseRating = (raw, seed) => {
  const pct = parseInt(String(raw ?? '').replace(/[^\d]/g, ''), 10);
  if (Number.isFinite(pct) && pct > 0) {
    return Math.round(Math.max(3, Math.min(5, (pct / 100) * 5)) * 10) / 10;
  }
  return Math.round((4.1 + ((seed >>> 3) % 6) / 10) * 10) / 10;
};

// Display name + searchable tags both come from the shared normaliser, which
// also un-glues run-together source values like "AYUSHHomoeopath".
const { displaySpeciality, specialityTags } = require('../utils/specialityText');

/* ── Derived doctor attributes ─────────────────────────────────────── */

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Four clinic templates, picked by seed, so different doctors genuinely have
// different availability rather than one identical schedule 17k times over.
const SCHEDULES = [
  { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], ranges: [['09:00', '13:00'], ['16:00', '19:00']] },
  { days: WEEK, ranges: [['10:00', '14:00']] },
  { days: ['Monday', 'Wednesday', 'Friday', 'Saturday'], ranges: [['08:30', '12:30'], ['17:00', '20:00']] },
  { days: ['Tuesday', 'Thursday', 'Saturday'], ranges: [['11:00', '15:00'], ['18:00', '21:00']] },
];

const SLOT_DURATIONS = [15, 20, 30, 45];

function buildWorkingHours(seed) {
  const tpl = SCHEDULES[seed % SCHEDULES.length];
  return tpl.days.flatMap((day) =>
    tpl.ranges.map(([startTime, endTime]) => ({ day, startTime, endTime }))
  );
}

function buildBio({ name, speciality, city, years }) {
  const who = name.replace(/^Dr\.?\s*/, '');
  const where = city ? ` practising in ${city}` : '';
  const exp = years ? ` with ${years} years of clinical experience` : '';
  return `Dr. ${who} is a ${speciality}${where}${exp}. Consultations cover diagnosis, treatment planning and structured follow-up care.`;
}

/* ── Row → documents ───────────────────────────────────────────────── */

function toRecords(row, index, passwordHash) {
  const name = String(row.Name || '').trim();
  if (!name) return null;

  const speciality = displaySpeciality(row.Speciality);
  const seed = seedOf(`${name}|${row.City}|${row.Location}|${index}`);
  const email = `${slug(name)}.${index}@${EMAIL_DOMAIN}`;
  const years = parseYears(row['Years of Experience']);

  const userId = new mongoose.Types.ObjectId();

  return {
    user: {
      _id: userId,
      name,
      email,
      passwordHash,
      role: 'doctor',
      phone: `+91 ${70000 + (seed % 29999)}${10000 + ((seed >>> 7) % 89999)}`,
      createdAt: new Date(),
    },
    profile: {
      userId,
      specialisation: speciality,
      specialities: specialityTags(row.Speciality),
      qualifications: String(row.Degree || '').trim(),
      city: String(row.City || '').trim(),
      locality: String(row.Location || '').trim(),
      consultationFee: parseFee(row['Consult Fee']),
      experienceYears: years,
      rating: parseRating(row['DP Score'], seed),
      reviewCount: parseReviewCount(row['NPV Value']),
      slotDuration: SLOT_DURATIONS[(seed >>> 5) % SLOT_DURATIONS.length],
      workingHours: buildWorkingHours(seed),
      bio: buildBio({ name, speciality, city: row.City, years }),
      isActive: true,
      source: 'dataset',
    },
  };
}

/* ── Main ──────────────────────────────────────────────────────────── */

async function run() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Dataset not found at ${DATA_FILE}`);
    process.exit(1);
  }

  await connectDB();
  console.log('Connected to MongoDB.');

  if (FRESH) {
    const stale = await DoctorProfile.find({ source: 'dataset' }).select('userId').lean();
    await DoctorProfile.deleteMany({ source: 'dataset' });
    await User.deleteMany({ _id: { $in: stale.map((d) => d.userId) } });
    console.log(`--fresh: removed ${stale.length} previously imported doctors.`);
  }

  const existingEmails = new Set(
    (await User.find({ email: new RegExp(`@${EMAIL_DOMAIN}$`) }).select('email').lean()).map((u) => u.email)
  );
  if (existingEmails.size) {
    console.log(`${existingEmails.size} dataset doctors already present — they will be skipped.`);
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const rl = readline.createInterface({
    input: fs.createReadStream(DATA_FILE, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let index = 0;
  let inserted = 0;
  let skipped = 0;
  let userBatch = [];
  let profileBatch = [];

  const flush = async () => {
    if (!userBatch.length) return;
    await User.insertMany(userBatch, { ordered: false });
    await DoctorProfile.insertMany(profileBatch, { ordered: false });
    inserted += userBatch.length;
    userBatch = [];
    profileBatch = [];
    process.stdout.write(`\r  imported ${inserted}  (skipped ${skipped})   `);
  };

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (index >= LIMIT) break;

    let row;
    try {
      row = JSON.parse(trimmed);
    } catch {
      skipped += 1;
      continue;
    }

    const records = toRecords(row, index, passwordHash);
    index += 1;
    if (!records || existingEmails.has(records.user.email)) {
      skipped += 1;
      continue;
    }

    userBatch.push(records.user);
    profileBatch.push(records.profile);
    if (userBatch.length >= BATCH_SIZE) await flush();
  }
  await flush();

  const total = await DoctorProfile.countDocuments({ isActive: true });
  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}. Directory now holds ${total} active doctors.`);
  console.log(`Dataset doctors sign in with their generated email and password "${DEFAULT_PASSWORD}".`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('\nImport failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
