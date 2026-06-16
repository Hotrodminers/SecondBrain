import nodemailer from "nodemailer";

// Provider-agnostic SMTP. Set these env vars to use a transactional email
// service (recommended for production — personal Gmail gets rate-limited and
// banned for sending OTPs):
//   SMTP_HOST  e.g. smtp-relay.brevo.com  |  smtp.sendgrid.net
//   SMTP_PORT  587 (TLS) or 465 (SSL)
//   SMTP_USER  provider username (SendGrid: literally "apikey")
//   SMTP_PASS  provider SMTP key / API key
//   MAIL_FROM  verified sender, e.g. "Second Brain <no-reply@yourdomain.com>"
// If SMTP_HOST is not set, it falls back to Gmail (dev/testing only).
const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);

const transporter = host
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587 (STARTTLS)
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

const FROM =
  process.env.MAIL_FROM ||
  `"Second Brain" <${process.env.SMTP_USER || "no-reply@secondbrain.app"}>`;

export async function sendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: FROM,
    to,
    subject: "Verify your Email - Second Brain",
    // A plain-text part alongside the HTML improves deliverability (HTML-only
    // messages are more likely to be flagged as spam).
    text: `Your Second Brain verification code is ${otp}. It is valid for 10 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5; padding: 40px 20px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #2a2a2a;">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #2d5a3f; margin-right: 8px; box-shadow: 0 0 8px #2d5a3f;"></span>
          <span style="font-size: 20px; font-weight: bold; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">Second Brain</span>
        </div>
        <h2 style="color: #ffffff; text-align: center; font-size: 22px; margin-bottom: 10px;">Verify your email address</h2>
        <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          Use the verification code below to gain access to your visual second brain.
        </p>
        <div style="background-color: #0f0f0f; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
          <span style="font-size: 32px; font-weight: bold; color: #14b8a6; letter-spacing: 6px; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #666666; font-size: 12px; line-height: 1.5; text-align: center;">
          This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
