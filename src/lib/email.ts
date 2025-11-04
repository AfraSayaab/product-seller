// src/lib/email.ts
import nodemailer from "nodemailer";

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const transporter = createTransporter();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("SMTP credentials not configured");
      throw new Error("Email service not configured");
    }

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Dazzle & Bloom"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || subject,
      html,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

interface PasswordResetEmailData {
  email: string;
  resetToken: string;
  resetUrl: string;
  username: string;
}

export function generatePasswordResetEmail({ email, resetToken, resetUrl, username }: PasswordResetEmailData): { subject: string; html: string; text: string } {
  const subject = "Reset Your Password - Dazzle & Bloom";
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #6366f1;
          margin-bottom: 10px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background-color: #6366f1;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #4f46e5;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .token {
          background-color: #f3f4f6;
          padding: 12px;
          border-radius: 4px;
          font-family: monospace;
          word-break: break-all;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✨ Dazzle & Bloom</div>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
          
          <p>Hello <strong>${username}</strong>,</p>
          
          <p>We received a request to reset your password for your Dazzle & Bloom account. If you didn't make this request, you can safely ignore this email.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
          <div class="token">${resetUrl}</div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. For your security, please do not share this link with anyone.
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            If you're having trouble clicking the button, copy and paste the URL above into your web browser.
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>If you didn't request a password reset, please contact our support team.</p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} Dazzle & Bloom. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reset Your Password - Dazzle & Bloom

Hello ${username},

We received a request to reset your password for your Dazzle & Bloom account. If you didn't make this request, you can safely ignore this email.

Click the following link to reset your password:
${resetUrl}

This link will expire in 1 hour. For your security, please do not share this link with anyone.

If you're having trouble, copy and paste the URL above into your web browser.

This is an automated email. Please do not reply to this message.
If you didn't request a password reset, please contact our support team.

© ${new Date().getFullYear()} Dazzle & Bloom. All rights reserved.
  `;

  return { subject, html, text };
}

