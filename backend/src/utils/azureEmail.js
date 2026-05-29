/**
 * Azure Communication Services — Email
 * Sends transactional emails for:
 *   - Welcome on registration
 *   - Enrollment confirmation
 *   - Booking confirmation
 *
 * SETUP: Add AZURE_COMM_CONNECTION_STRING and AZURE_COMM_SENDER_EMAIL to .env
 * Azure Portal → Communication Services → Email → Add a sender domain
 */

const { EmailClient } = require('@azure/communication-email');

let emailClient = null;

function getEmailClient() {
  if (emailClient) return emailClient;
  const connStr = process.env.AZURE_COMM_CONNECTION_STRING;
  if (!connStr) {
    console.warn('[AzureEmail] Connection string not configured — emails disabled.');
    return null;
  }
  emailClient = new EmailClient(connStr);
  return emailClient;
}

const SENDER = process.env.AZURE_COMM_SENDER_EMAIL || 'DoNotReply@skillsphere.com';
const APP_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Core send helper — fire-and-forget (non-blocking).
 */
async function sendEmail({ to, subject, html, text }) {
  const client = getEmailClient();
  if (!client) return;

  try {
    const message = {
      senderAddress: SENDER,
      recipients: { to: [{ address: to }] },
      content: { subject, html, plainText: text || subject },
    };
    const poller = await client.beginSend(message);
    await poller.pollUntilDone();
    console.log(`[AzureEmail] ✅ Email sent to ${to} — "${subject}"`);
  } catch (err) {
    console.error(`[AzureEmail] ❌ Failed to send email to ${to}:`, err.message);
  }
}

/* ─── Email Templates ─────────────────────────────────────── */

/**
 * Welcome email sent when a new user registers.
 */
async function sendWelcomeEmail({ name, email }) {
  await sendEmail({
    to: email,
    subject: `Welcome to SkillSphere, ${name}! 🎓`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0f0f12;color:#e4e4e7;padding:40px;border-radius:12px;">
        <h1 style="color:#7c3aed;margin-bottom:8px;">Welcome to SkillSphere 🎓</h1>
        <p style="color:#a1a1aa;margin-top:0;">Your learning journey starts now.</p>
        <hr style="border:1px solid #27272a;margin:24px 0;"/>
        <p>Hi <strong>${name}</strong>,</p>
        <p>You've successfully created your SkillSphere account. You can now:</p>
        <ul style="padding-left:20px;line-height:1.8;">
          <li>Browse and enroll in expert-taught video courses</li>
          <li>Book mentorship sessions with top instructors</li>
          <li>Publish your own skills and earn as a mentor</li>
        </ul>
        <a href="${APP_URL}/courses"
           style="display:inline-block;margin-top:24px;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Explore Courses →
        </a>
        <hr style="border:1px solid #27272a;margin:32px 0;"/>
        <p style="color:#52525b;font-size:12px;">SkillSphere — Learn, Teach &amp; Grow | Powered by Microsoft Azure</p>
      </div>
    `,
  });
}

/**
 * Enrollment confirmation email sent when a user enrolls in a course.
 */
async function sendEnrollmentEmail({ userName, userEmail, courseTitle, coursePrice, instructorName }) {
  await sendEmail({
    to: userEmail,
    subject: `You're enrolled in "${courseTitle}"! 🎉`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0f0f12;color:#e4e4e7;padding:40px;border-radius:12px;">
        <h1 style="color:#7c3aed;margin-bottom:8px;">Enrollment Confirmed 🎉</h1>
        <p style="color:#a1a1aa;margin-top:0;">Get ready to start learning!</p>
        <hr style="border:1px solid #27272a;margin:24px 0;"/>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>You've successfully enrolled in:</p>
        <div style="background:#18181b;border:1px solid #3f3f46;border-radius:8px;padding:20px;margin:16px 0;">
          <h2 style="color:#a78bfa;margin:0 0 8px 0;">${courseTitle}</h2>
          <p style="margin:4px 0;color:#a1a1aa;">Instructor: <strong style="color:#e4e4e7;">${instructorName}</strong></p>
          <p style="margin:4px 0;color:#a1a1aa;">Price: <strong style="color:#e4e4e7;">$${coursePrice}</strong></p>
        </div>
        <a href="${APP_URL}/courses"
           style="display:inline-block;margin-top:16px;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Start Learning →
        </a>
        <hr style="border:1px solid #27272a;margin:32px 0;"/>
        <p style="color:#52525b;font-size:12px;">SkillSphere — Powered by Microsoft Azure Communication Services</p>
      </div>
    `,
  });
}

/**
 * Booking confirmation email sent to the mentee when a booking is created.
 */
async function sendBookingEmail({ userName, userEmail, skillTitle, mentorName, date }) {
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
  await sendEmail({
    to: userEmail,
    subject: `Booking Request Sent for "${skillTitle}" 📅`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0f0f12;color:#e4e4e7;padding:40px;border-radius:12px;">
        <h1 style="color:#7c3aed;margin-bottom:8px;">Booking Request Sent 📅</h1>
        <p style="color:#a1a1aa;margin-top:0;">Your mentor will confirm shortly.</p>
        <hr style="border:1px solid #27272a;margin:24px 0;"/>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your session request has been sent to your mentor:</p>
        <div style="background:#18181b;border:1px solid #3f3f46;border-radius:8px;padding:20px;margin:16px 0;">
          <h2 style="color:#a78bfa;margin:0 0 8px 0;">${skillTitle}</h2>
          <p style="margin:4px 0;color:#a1a1aa;">Mentor: <strong style="color:#e4e4e7;">${mentorName}</strong></p>
          <p style="margin:4px 0;color:#a1a1aa;">Requested Date: <strong style="color:#e4e4e7;">${formattedDate}</strong></p>
          <p style="margin:8px 0 0 0;"><span style="background:#78350f;color:#fbbf24;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">PENDING CONFIRMATION</span></p>
        </div>
        <a href="${APP_URL}/dashboard"
           style="display:inline-block;margin-top:16px;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
          View My Bookings →
        </a>
        <hr style="border:1px solid #27272a;margin:32px 0;"/>
        <p style="color:#52525b;font-size:12px;">SkillSphere — Powered by Microsoft Azure Communication Services</p>
      </div>
    `,
  });
}

module.exports = { sendWelcomeEmail, sendEnrollmentEmail, sendBookingEmail };
