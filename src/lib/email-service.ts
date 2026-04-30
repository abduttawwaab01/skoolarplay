import { Resend } from 'resend';

export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string,
  baseUrl: string = process.env.NEXTAUTH_URL || 'http://localhost:3000'
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(apiKey);
  const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

  const data = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@skoolar.org',
    to: toEmail,
    subject: 'Reset Your SkoolarPlay Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #008751;">Password Reset Request</h2>
        <p>You requested to reset your password for SkoolarPlay. Click the button below to set a new password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #008751; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #888; font-size: 12px;">
          SkoolarPlay Team<br>
          ${baseUrl}
        </p>
      </div>
    `,
    text: `
Password Reset Request

You requested to reset your password for SkoolarPlay.
Click the link below to set a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

---
SkoolarPlay Team
${baseUrl}
    `,
  });

  return data;
}

export async function sendEmailVerification(
  toEmail: string,
  verificationToken: string,
  baseUrl: string = process.env.NEXTAUTH_URL || 'http://localhost:3000'
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(apiKey);
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

  const data = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@skoolar.org',
    to: toEmail,
    subject: 'Verify Your SkoolarPlay Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #008751;">Welcome to SkoolarPlay!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background-color: #008751; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Verify Email Address
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #008751; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This link will expire in 24 hours.</p>
        <p style="color: #666; font-size: 12px;">If you didn't create an account on SkoolarPlay, please ignore this email.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #888; font-size: 12px;">
          <strong>SkoolarPlay Team</strong><br>
          Learn. Achieve. Succeed.
        </p>
      </div>
    `,
    text: `
Welcome to SkoolarPlay!

Please verify your email address by clicking the link below:

${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account on SkoolarPlay, please ignore this email.

---
SkoolarPlay Team
Learn. Achieve. Succeed.
    `,
  });

  return data;
}
