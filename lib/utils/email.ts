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

// For production, this would integrate with an email service
export async function sendVerificationEmail(
  email: string,
  electionId: string,
  verificationCode: string
): Promise<boolean> {
  // In production, this would send an actual email via a service like:
  // - SendGrid, Resend, AWS SES, etc.
  
  // For now, we'll simulate it and store the code
  if (typeof window !== 'undefined') {
    // Store verification code (in production, this would be in a database)
    const key = `vote_b_verification_${normalizeEmail(email)}_${electionId}`;
    localStorage.setItem(key, verificationCode);
    
    // Log for demo purposes (remove in production)
    console.log(`[DEMO] Verification email sent to ${email}`);
    console.log(`[DEMO] Verification code: ${verificationCode}`);
    
    return true;
  }
  
  return false;
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
  
  return storedCode === code;
}

export function clearVerificationCode(email: string, electionId: string): void {
  if (typeof window === 'undefined') return;

  const key = `vote_b_verification_${normalizeEmail(email)}_${electionId}`;
  localStorage.removeItem(key);
}
