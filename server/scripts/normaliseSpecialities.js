/**
 * One-off repair pass: rewrites `specialisation` / `specialities` on existing
 * doctor profiles through the shared normaliser, so rows imported before the
 * un-gluing fix ("AYUSHHomoeopath") display correctly.
 *
 *   node scripts/normaliseSpecialities.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const DoctorProfile = require('../models/DoctorProfile');
const { displaySpeciality, specialityTags } = require('../utils/specialityText');

async function run() {
  await connectDB();

  const cursor = DoctorProfile.find({}, 'specialisation specialities bio').cursor();
  let scanned = 0;
  let updated = 0;
  let ops = [];

  const flush = async () => {
    if (!ops.length) return;
    await DoctorProfile.bulkWrite(ops, { ordered: false });
    ops = [];
  };

  for await (const doc of cursor) {
    scanned += 1;
    const nextName = displaySpeciality(doc.specialisation);
    const nextTags = specialityTags(doc.specialisation);

    const nameChanged = nextName !== doc.specialisation;
    const tagsChanged = JSON.stringify(nextTags) !== JSON.stringify(doc.specialities || []);
    if (!nameChanged && !tagsChanged) continue;

    const update = { specialisation: nextName, specialities: nextTags };
    // The generated bio embeds the old label, so keep the two in step.
    if (nameChanged && doc.bio) {
      update.bio = doc.bio.split(doc.specialisation).join(nextName);
    }

    ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: update } } });
    updated += 1;
    if (ops.length >= 500) {
      await flush();
      process.stdout.write(`\r  updated ${updated} / scanned ${scanned}   `);
    }
  }
  await flush();

  console.log(`\nDone. Scanned ${scanned}, updated ${updated}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('\nNormalisation failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
