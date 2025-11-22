export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function isSchoolEmail(email: string): boolean {
  // Check for common school email patterns
  const normalized = normalizeEmail(email);
  const schoolDomains = ['.edu', '.ac.', '.school'];
  return schoolDomains.some(domain => normalized.includes(domain));
}

export async function sendVerificationEmail(
  email: string,
  electionId: string,
  verificationCode: string,
  electionTitle?: string
): Promise<boolean> {
  try {
    const normalizedEmail = normalizeEmail(email);

    // Store in localStorage for client-side verification
    if (typeof window !== 'undefined') {
      const key = `vote_b_verification_${normalizedEmail}_${electionId}`;
      localStorage.setItem(key, verificationCode);

      // Store expiration time (15 minutes from now)
      const expirationKey = `${key}_expiration`;
      const expirationTime = Date.now() + 15 * 60 * 1000; // 15 minutes
      localStorage.setItem(expirationKey, expirationTime.toString());

      // Call API route to send email
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          electionId,
          verificationCode,
          electionTitle,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[Email Error]', result.error);
        // Still return true since we stored the code in localStorage
        // This allows the app to work even if email sending fails
        return true;
      }

      console.log('[Email API Response]', result.message);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Email Error]', error);
    // Return true anyway since code is stored in localStorage
    return true;
  }
}

export function generateVerificationCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function verifyEmailCode(
  email: string,
  electionId: string,
  code: string
): boolean {
  if (typeof window === 'undefined') return false;

  const key = `vote_b_verification_${normalizeEmail(email)}_${electionId}`;
  const storedCode = localStorage.getItem(key);

  // Check if code exists
  if (!storedCode || storedCode !== code) {
    return false;
  }

  // Check if code has expired
  const expirationKey = `${key}_expiration`;
  const expirationTimeStr = localStorage.getItem(expirationKey);

  if (expirationTimeStr) {
    const expirationTime = parseInt(expirationTimeStr, 10);
    if (Date.now() > expirationTime) {
      // Code has expired, clean it up
      localStorage.removeItem(key);
      localStorage.removeItem(expirationKey);
      return false;
    }
  }

  return true;
}

export function clearVerificationCode(email: string, electionId: string): void {
  if (typeof window === 'undefined') return;

  const key = `vote_b_verification_${normalizeEmail(email)}_${electionId}`;
  const expirationKey = `${key}_expiration`;

  localStorage.removeItem(key);
  localStorage.removeItem(expirationKey);
}
