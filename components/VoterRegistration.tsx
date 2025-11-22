'use client';

import { useState } from 'react';
import { Storage } from '@/lib/storage';
import { isValidEmail, normalizeEmail, generateVerificationCode, sendVerificationEmail, verifyEmailCode, clearVerificationCode } from '@/lib/utils/email';

interface VoterRegistrationProps {
  electionId: string;
  onRegistered: (email: string) => void;
}

export default function VoterRegistration({ electionId, onRegistered }: VoterRegistrationProps) {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate email
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    // Check if already registered
    if (Storage.isVoterRegistered(normalizedEmail, electionId)) {
      // Check if already verified
      if (Storage.isVoterVerified(normalizedEmail, electionId)) {
        setError('This email is already registered and verified. You can now vote.');
        setLoading(false);
        setTimeout(() => {
          onRegistered(normalizedEmail);
        }, 2000);
        return;
      } else {
        // Resend verification code
        const code = generateVerificationCode();
        await sendVerificationEmail(normalizedEmail, electionId, code);
        setStep('verify');
        setLoading(false);
        return;
      }
    }

    // Register voter
    const registered = Storage.registerVoter(normalizedEmail, electionId);
    
    if (!registered) {
      setError('Failed to register. Please try again.');
      setLoading(false);
      return;
    }

    // Generate and send verification code
    const code = generateVerificationCode();
    const sent = await sendVerificationEmail(normalizedEmail, electionId, code);

    if (sent) {
      setStep('verify');
      setSuccess(true);
    } else {
      setError('Failed to send verification email. Please try again.');
    }

    setLoading(false);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedEmail = normalizeEmail(email);
    const isValid = verifyEmailCode(normalizedEmail, electionId, verificationCode);

    if (isValid) {
      // Mark voter as verified
      Storage.verifyVoter(normalizedEmail, electionId);
      clearVerificationCode(normalizedEmail, electionId);
      setSuccess(true);
      setLoading(false);
      
      setTimeout(() => {
        onRegistered(normalizedEmail);
      }, 1000);
    } else {
      setError('Invalid verification code. Please check and try again.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setLoading(true);

    const normalizedEmail = normalizeEmail(email);
    const code = generateVerificationCode();
    const sent = await sendVerificationEmail(normalizedEmail, electionId, code);

    if (sent) {
      setError(null);
      setSuccess(true);
    } else {
      setError('Failed to resend code. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          {step === 'email' ? 'Register to Vote' : 'Verify Your Email'}
        </h2>
        <p className="text-muted">
          {step === 'email'
            ? 'Enter your school email address to register for this election'
            : 'Enter the verification code sent to your email'}
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="input"
              placeholder="student@school.edu"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted mt-1">
              Use your school email address
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              Verification code sent! Check your email.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 mb-4">
            <p className="text-sm text-blue-900">
              A verification code has been sent to <strong>{email}</strong>. 
              Please check your email and enter the code below.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              <strong>Note:</strong> In production, this would be sent via email. 
              For now, check the browser console for the demo code.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Verification Code *</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              className="input text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
              maxLength={6}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setVerificationCode('');
                setError(null);
                setSuccess(false);
              }}
              className="btn btn-ghost flex-1"
              disabled={loading}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify'
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="btn btn-ghost w-full text-sm"
          >
            Resend Code
          </button>
        </form>
      )}
    </div>
  );
}
