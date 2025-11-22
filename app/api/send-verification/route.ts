import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { VerificationEmailTemplate, getVerificationEmailText } from '@/lib/utils/emailTemplates';
import { isValidEmail, normalizeEmail } from '@/lib/utils/email';

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, electionId, verificationCode, electionTitle } = body;

    // Validate inputs
    if (!email || !electionId || !verificationCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    // If RESEND_API_KEY is not set, return success (development mode)
    if (!process.env.RESEND_API_KEY || !resend) {
      console.log(`[DEMO] Verification email would be sent to ${normalizedEmail}`);
      console.log(`[DEMO] Verification code: ${verificationCode}`);
      return NextResponse.json({
        success: true,
        message: 'Development mode: Email logged to console',
      });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [normalizedEmail],
      subject: `Your Vote-B Verification Code: ${verificationCode}`,
      react: VerificationEmailTemplate({
        verificationCode,
        electionTitle,
      }),
      text: getVerificationEmailText(verificationCode, electionTitle),
    });

    if (error) {
      console.error('[Email Error]', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    console.log('[Email Sent]', data);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
