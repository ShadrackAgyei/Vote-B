import * as React from 'react';

interface VerificationEmailProps {
  verificationCode: string;
  electionTitle?: string;
}

export const VerificationEmailTemplate: React.FC<VerificationEmailProps> = ({
  verificationCode,
  electionTitle = 'Vote-B Election',
}) => (
  <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#007AFF', fontSize: '32px', margin: '0 0 10px 0' }}>Vote-B</h1>
        <p style={{ color: '#8E8E93', fontSize: '14px', margin: '0' }}>Secure Blockchain Voting</p>
      </div>

      <div style={{
        backgroundColor: '#F5F5F7',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '24px'
      }}>
        <h2 style={{ color: '#1D1D1F', fontSize: '24px', margin: '0 0 16px 0' }}>
          Verify Your Email
        </h2>
        <p style={{ color: '#424245', fontSize: '16px', lineHeight: '24px', margin: '0 0 24px 0' }}>
          You&apos;ve registered to vote in <strong>{electionTitle}</strong>.
          Please use the verification code below to complete your registration:
        </p>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #007AFF',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: '600',
            color: '#007AFF',
            letterSpacing: '8px',
            fontFamily: 'monospace'
          }}>
            {verificationCode}
          </div>
        </div>

        <p style={{ color: '#8E8E93', fontSize: '14px', lineHeight: '20px', margin: '0' }}>
          This code will expire in 15 minutes. If you didn&apos;t request this code, please ignore this email.
        </p>
      </div>

      <div style={{
        borderTop: '1px solid #E5E5E7',
        paddingTop: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#8E8E93', fontSize: '12px', lineHeight: '18px', margin: '0' }}>
          This is an automated email from Vote-B. Please do not reply to this message.
        </p>
        <p style={{ color: '#8E8E93', fontSize: '12px', lineHeight: '18px', margin: '8px 0 0 0' }}>
          Your vote is secured by blockchain technology and is completely anonymous.
        </p>
      </div>
    </div>
  </div>
);

// Plain text version for email clients that don't support HTML
export function getVerificationEmailText(
  verificationCode: string,
  electionTitle: string = 'Vote-B Election'
): string {
  return `
Vote-B - Secure Blockchain Voting

Verify Your Email

You've registered to vote in ${electionTitle}.

Your verification code is: ${verificationCode}

This code will expire in 15 minutes. If you didn't request this code, please ignore this email.

---
This is an automated email from Vote-B. Please do not reply to this message.
Your vote is secured by blockchain technology and is completely anonymous.
  `.trim();
}
