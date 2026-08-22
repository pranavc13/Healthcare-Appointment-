const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html });
}

// Sends an email and always logs the attempt as a Notification (sent or failed).
// Callers never need their own try/catch — a send failure here doesn't throw, it just
// leaves a status:'failed' row for the retry cron to pick up later.
async function sendAndLog({ userId, appointmentId, type, to, subject, html }) {
  const notification = await Notification.create({
    userId,
    appointmentId,
    type,
    channel: 'email',
    status: 'pending',
    subject,
    message: html,
    scheduledAt: new Date(),
  });

  try {
    await sendEmail({ to, subject, html });
    notification.status = 'sent';
    notification.sentAt = new Date();
    await notification.save();
  } catch (err) {
    notification.status = 'failed';
    notification.lastError = err.message;
    await notification.save();
    console.error(`[email] failed to send "${subject}" to ${to}:`, err.message);
  }

  return notification;
}

module.exports = { sendEmail, sendAndLog };
