# Email Service Setup Guide

This guide explains how to set up email verification using Resend for Vote-B.

## Overview

Vote-B uses [Resend](https://resend.com) to send verification emails to voters. The system:
- Generates a 6-digit verification code
- Sends a beautifully formatted email with the code
- Codes expire after 15 minutes
- Falls back to localStorage for development/testing

## Quick Start

### 1. Get Your Resend API Key

1. Sign up for a free account at [resend.com](https://resend.com)
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Copy your API key (starts with `re_`)

### 2. Configure Environment Variables

Open `.env.local` and add your Resend API key:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes:**
- For testing, use `onboarding@resend.dev` as the sender
- For production, you need to verify your own domain in Resend
- Never commit `.env.local` to git (it's already in `.gitignore`)

### 3. Restart Your Development Server

```bash
npm run dev
```

## Development vs Production

### Development Mode
When `RESEND_API_KEY` is not set:
- Verification codes are still generated and stored in localStorage
- Email sending is logged to console only
- The app works normally for testing

### Production Mode
When `RESEND_API_KEY` is set:
- Real emails are sent via Resend
- Verification codes are stored in localStorage (until database migration)
- Email delivery status is logged

## Email Template

The verification email includes:
- Vote-B branding
- Election title
- 6-digit verification code in a prominent box
- Expiration notice (15 minutes)
- Clean, Apple-inspired design

Template location: `lib/utils/emailTemplates.tsx`

## Custom Domain Setup (Production)

For production, you should use your own domain:

1. **Add Domain in Resend:**
   - Go to Resend dashboard → **Domains**
   - Click **Add Domain**
   - Enter your domain (e.g., `yourdomain.com`)

2. **Verify DNS Records:**
   - Add the provided DNS records to your domain
   - Wait for verification (usually a few minutes)

3. **Update Environment Variables:**
   ```env
   EMAIL_FROM=noreply@yourdomain.com
   ```

## API Endpoint

The email sending logic is in:
- **API Route:** `app/api/send-verification/route.ts`
- **Client Function:** `lib/utils/email.ts`

### API Request Format

```typescript
POST /api/send-verification
{
  "email": "voter@example.com",
  "electionId": "election-123",
  "verificationCode": "123456",
  "electionTitle": "Student Council Election"
}
```

### API Response

Success:
```json
{
  "success": true,
  "message": "Verification email sent",
  "emailId": "abc123"
}
```

Error:
```json
{
  "error": "Failed to send email",
  "details": {...}
}
```

## Troubleshooting

### Emails Not Sending

1. **Check API Key:**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Check Console:**
   - Look for `[Email Sent]` or `[Email Error]` logs
   - Check browser console and server console

3. **Verify Domain:**
   - Ensure domain is verified in Resend dashboard
   - Use `onboarding@resend.dev` for testing

### Code Expiration Issues

Verification codes expire after 15 minutes. If users report expired codes:
- Check the expiration logic in `lib/utils/email.ts`
- Consider increasing the expiration time
- Add a "Resend Code" button in the UI

### Rate Limits

Resend free tier includes:
- 100 emails per day
- 3,000 emails per month

For higher volume, upgrade your Resend plan.

## Testing

To test email sending:

1. **Local Testing:**
   ```bash
   # Set your API key
   echo "RESEND_API_KEY=re_your_key" >> .env.local

   # Restart server
   npm run dev
   ```

2. **Register a Voter:**
   - Go to http://localhost:3000
   - Enter your email address
   - Check your inbox for the verification code

3. **Check Logs:**
   - Server console: Email sending status
   - Browser console: API response
   - Resend dashboard: Delivery status

## Next Steps

After email integration:
1. **Database Migration:** Move verification codes from localStorage to database
2. **Email Domain Restrictions:** Enforce school email domains
3. **Rate Limiting:** Prevent spam/abuse
4. **Email Templates:** Add more email types (welcome, vote confirmation, etc.)

## Security Considerations

- ✅ Verification codes expire after 15 minutes
- ✅ Codes are single-use (cleared after verification)
- ✅ Email addresses are normalized (lowercase, trimmed)
- ⚠️ TODO: Add rate limiting to prevent abuse
- ⚠️ TODO: Move codes from localStorage to secure database
- ⚠️ TODO: Add CAPTCHA to registration form

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend React Email](https://react.email/docs/introduction)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
