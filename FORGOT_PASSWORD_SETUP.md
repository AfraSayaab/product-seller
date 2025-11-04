# Forgot Password Feature Setup Guide

## Overview
A complete forgot password feature has been implemented with:
- Forgot password page (`/forgot-password`)
- Reset password page (`/reset-password`)
- Email service using Nodemailer
- Secure token-based password reset

## Prerequisites

### 1. Install Dependencies
Install `nodemailer` and its types:
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Database Migration
Run Prisma migration to add password reset fields to the User model:
```bash
npx prisma migrate dev --name add_password_reset_fields
```

Or if you prefer to generate the Prisma client:
```bash
npx prisma generate
```

### 3. Environment Variables
Add the following environment variables to your `.env` file:

```env
# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com          # Your SMTP host
SMTP_PORT=587                      # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                  # true for SSL (465), false for TLS (587)
SMTP_USER=your-email@gmail.com     # Your email address
SMTP_PASSWORD=your-app-password    # Your email password or app password
SMTP_FROM_NAME="Dazzle & Bloom"    # Display name for emails

# Application URL (for reset links)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Your app URL (change in production)
```

### 4. Gmail Setup (Example)
If using Gmail:
1. Enable 2-Step Verification
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASSWORD`

### 5. Other Email Providers
For other providers, adjust the SMTP settings:
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port 587
- **SendGrid**: Use their SMTP settings
- **Mailgun**: Use their SMTP settings
- **AWS SES**: Use their SMTP settings

## Features

### Security Features
- ✅ Rate limiting (5 requests per minute per IP)
- ✅ Secure token generation (32-byte random hex)
- ✅ Token expiration (1 hour)
- ✅ Email enumeration prevention (always returns success)
- ✅ Password validation (minimum 8 characters)
- ✅ Password confirmation matching

### User Experience
- ✅ Professional email templates with HTML styling
- ✅ Responsive UI matching login page design
- ✅ Loading states and error handling
- ✅ Success messages and redirects
- ✅ Clear instructions and feedback

## API Routes

### POST `/api/auth/forgot-password`
Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "If an account exists with this email, a password reset link has been sent."
  }
}
```

### POST `/api/auth/reset-password`
Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password has been reset successfully"
  }
}
```

## Pages

### `/forgot-password`
- User enters their email address
- Sends reset email
- Shows success message

### `/reset-password?token=...`
- User enters new password
- Validates token
- Resets password
- Redirects to login

## Testing

1. Navigate to `/forgot-password`
2. Enter a registered email address
3. Check email inbox for reset link
4. Click the link or copy the token
5. Enter new password on reset page
6. Verify password reset and login with new password

## Troubleshooting

### Email not sending
- Check SMTP credentials in `.env`
- Verify SMTP settings for your provider
- Check server logs for errors
- Ensure firewall allows SMTP connections

### Token not working
- Verify token hasn't expired (1 hour limit)
- Check database for reset token
- Ensure `NEXT_PUBLIC_APP_URL` is correct

### Database errors
- Run Prisma migrations: `npx prisma migrate dev`
- Regenerate Prisma client: `npx prisma generate`

## Notes

- The email service fails gracefully - if email fails to send, the API still returns success (for security)
- Reset tokens are single-use and expire after 1 hour
- All password reset tokens are cleared after successful reset
- Rate limiting prevents abuse (5 requests per minute per IP)

