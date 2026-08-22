require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Existing user ${email} promoted to admin.`);
    } else {
      console.log(`Admin ${email} already exists — nothing to do.`);
    }
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      name: 'Admin',
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
    });
    console.log(`Admin account created: ${email}`);
  }

  await require('mongoose').disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
