/**
 * One-time pivot: shrinks the practitioner directory down from the full 17k-row
 * dataset import to a two-doctor dental clinic, and replaces the demo patient
 * account with the real user's identity.
 *
 * Keeps two named dataset doctors (by _id, picked for a senior/junior dentist
 * pairing), unifies their city/locality to a single clinic address, deletes
 * every other dataset-sourced doctor (User + DoctorProfile), and replaces the
 * demo patient "Riya Mehta" with "Pranav Chaturvedi".
 *
 *   node scripts/trimToClinic.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

const KEEP_IDS = [
  '6a8b40d53cf1c64e9c0de9f8', // Dr. Rohith Rajashekhar — Dentist, Cosmetic/Aesthetic Dentist
  '6a8b40d73cf1c64e9c0df0b4', // Dr. Shanmukha B S — Dentist
];

const CLINIC_CITY = 'Bangalore';
const CLINIC_LOCALITY = 'Indiranagar';

const OLD_DEMO_EMAIL = 'riya.demo@jeevanchakra.test';
const NEW_DEMO_EMAIL = 'pranav.chaturvedi@docconnect.test';
const NEW_DEMO_NAME = 'Pranav Chaturvedi';

async function run() {
  await connectDB();

  const kept = await DoctorProfile.find({ _id: { $in: KEEP_IDS } }).populate('userId', 'name email');
  if (kept.length !== KEEP_IDS.length) {
    console.error(`Expected ${KEEP_IDS.length} doctors to keep, found ${kept.length}. Aborting — nothing changed.`);
    process.exit(1);
  }

  for (const doc of kept) {
    doc.city = CLINIC_CITY;
    doc.locality = CLINIC_LOCALITY;
    doc.isActive = true;
    await doc.save();
  }
  console.log('Kept doctors, now sharing one clinic address:');
  for (const doc of kept) {
    console.log(`  ${doc.userId.name} — ${doc.specialisation} (${doc.userId.email})`);
  }

  const toRemove = await DoctorProfile.find({
    source: 'dataset',
    _id: { $nin: KEEP_IDS },
  }).select('userId');
  const removeUserIds = toRemove.map((d) => d.userId);

  const profileResult = await DoctorProfile.deleteMany({ source: 'dataset', _id: { $nin: KEEP_IDS } });
  const userResult = await User.deleteMany({ _id: { $in: removeUserIds } });
  console.log(`\nRemoved ${profileResult.deletedCount} doctor profiles and ${userResult.deletedCount} user accounts.`);

  const remaining = await DoctorProfile.countDocuments({ isActive: true });
  console.log(`Directory now holds ${remaining} active doctor(s).`);

  // Demo patient: rename in place if it exists, otherwise leave patient
  // creation to registration — this script only fixes the placeholder identity.
  const demo = await User.findOne({ email: OLD_DEMO_EMAIL });
  if (demo) {
    demo.name = NEW_DEMO_NAME;
    demo.email = NEW_DEMO_EMAIL;
    await demo.save();
    console.log(`\nRenamed demo patient: ${NEW_DEMO_NAME} <${NEW_DEMO_EMAIL}> (password unchanged).`);
  } else {
    console.log(`\nNo demo patient found at ${OLD_DEMO_EMAIL} — nothing to rename.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('\ntrimToClinic failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
