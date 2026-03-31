const nodemailer = require('nodemailer');

// ── Email ──────────────────────────────────────────────────────────────────────

let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

async function sendEmail(to, subject, text) {
  const t = getTransporter();
  if (!t) {
    console.log(`[notify] Email skipped (no SMTP config) → ${to}: ${subject}`);
    return;
  }
  try {
    await t.sendMail({ from: process.env.FROM_EMAIL || process.env.SMTP_USER, to, subject, text });
    console.log(`[notify] Email sent → ${to}`);
  } catch (err) {
    console.error('[notify] Email error:', err.message);
  }
}

// ── SMS via Africa's Talking ───────────────────────────────────────────────────

async function sendSMS(to, message) {
  if (!process.env.AFRICASTALKING_API_KEY || !process.env.AFRICASTALKING_USERNAME) {
    console.log(`[notify] SMS skipped (no AT config) → ${to}: ${message}`);
    return;
  }
  try {
    const AfricasTalking = require('africastalking');
    const at = AfricasTalking({
      apiKey: process.env.AFRICASTALKING_API_KEY,
      username: process.env.AFRICASTALKING_USERNAME,
    });
    await at.SMS.send({ to: [to], message, from: process.env.AT_SENDER_ID || undefined });
    console.log(`[notify] SMS sent → ${to}`);
  } catch (err) {
    console.error('[notify] SMS error:', err.message);
  }
}

// ── Router: email vs SMS ───────────────────────────────────────────────────────

function isPhone(contact) {
  return /^\+?\d{7,15}$/.test((contact || '').trim().replace(/[\s\-()]/g, ''));
}

async function notify(contact, subject, message) {
  if (!contact) return;
  if (isPhone(contact)) {
    await sendSMS(contact.trim(), message);
  } else {
    await sendEmail(contact.trim(), subject, message);
  }
}

// ── Convenience helpers ────────────────────────────────────────────────────────

async function notifyAdmin(subject, message) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE;
  if (adminPhone) await sendSMS(adminPhone, message);
  if (adminEmail) await sendEmail(adminEmail, subject, message);
  if (!adminEmail && !adminPhone) {
    console.log(`[notify] Admin notification skipped (no ADMIN_EMAIL/ADMIN_PHONE): ${subject}`);
  }
}

// ── In-app (database) notifications ───────────────────────────────────────────

async function inAppNotify(prisma, userId, type, title, message) {
  try {
    await prisma.notification.create({ data: { userId, type, title, message } });
  } catch (err) {
    console.error('[notify] In-app notification error:', err.message);
  }
}

async function inAppNotifyAdmins(prisma, type, title, message) {
  try {
    const admins = await prisma.user.findMany({ where: { isAdmin: true }, select: { id: true } });
    await Promise.all(admins.map(admin => inAppNotify(prisma, admin.id, type, title, message)));
  } catch (err) {
    console.error('[notify] In-app admin notification error:', err.message);
  }
}

module.exports = { notify, notifyAdmin, sendEmail, sendSMS, inAppNotify, inAppNotifyAdmins };
