import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "second2brains@gmail.com",
    pass: process.env.SMTP_PASS || "wkel bxdd kvyl skcv",
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"Second Brain" <${process.env.SMTP_USER || "second2brains@gmail.com"}>`,
    to,
    subject: "Verify your Email - Second Brain",
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
