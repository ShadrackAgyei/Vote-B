import CryptoJS from 'crypto-js';

const ADMIN_SESSION_KEY = 'vote_b_admin_session';
const ADMIN_PASSWORD_KEY = 'vote_b_admin_password';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export class AdminAuth {
  // Generate a hash of the password for secure comparison
  private static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  // Initialize admin password (should be done once or from env)
  static initializePassword(password?: string): string {
    if (typeof window === 'undefined') return '';

    const storedHash = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (storedHash) {
      return storedHash; // Already initialized
    }

    // Use provided password or generate default
    const adminPassword = password || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    const hashed = this.hashPassword(adminPassword);
    
    localStorage.setItem(ADMIN_PASSWORD_KEY, hashed);
    return hashed;
  }

  // Authenticate with password
  static authenticate(password: string): boolean {
    if (typeof window === 'undefined') return false;

    // Initialize if not already done
    this.initializePassword();

    const storedHash = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (!storedHash) {
      return false;
    }

    const inputHash = this.hashPassword(password);
    const isValid = storedHash === inputHash;

    if (isValid) {
      // Create session
      const session = {
        authenticated: true,
        timestamp: Date.now(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    }

    return isValid;
  }

  // Check if admin is authenticated
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionStr) {
      return false;
    }

    try {
      const session = JSON.parse(sessionStr);
      const now = Date.now();
      const sessionAge = now - session.timestamp;

      // Check if session is still valid
      if (sessionAge > SESSION_DURATION) {
        this.logout();
        return false;
      }

      return session.authenticated === true;
    } catch {
      return false;
    }
  }

  // Logout admin
  static logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  // Extend session (call periodically while admin is active)
  static extendSession(): void {
    if (typeof window === 'undefined') return;

    if (this.isAuthenticated()) {
      const session = {
        authenticated: true,
        timestamp: Date.now(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    }
  }

  // Change admin password
  static changePassword(oldPassword: string, newPassword: string): boolean {
    if (typeof window === 'undefined') return false;

    if (!this.authenticate(oldPassword)) {
      return false; // Old password incorrect
    }

    const newHash = this.hashPassword(newPassword);
    localStorage.setItem(ADMIN_PASSWORD_KEY, newHash);
    
    // Re-authenticate with new password
    return this.authenticate(newPassword);
  }

  // Reset admin password (requires secret key - for emergency reset)
  static resetPassword(secretKey: string, newPassword: string): boolean {
    if (typeof window === 'undefined') return false;

    // In production, this would check against a secure secret
    // For now, using a simple check
    const validSecret = secretKey === process.env.NEXT_PUBLIC_ADMIN_SECRET || 'vote-b-reset-2025';
    
    if (!validSecret) {
      return false;
    }

    const newHash = this.hashPassword(newPassword);
    localStorage.setItem(ADMIN_PASSWORD_KEY, newHash);
    this.logout(); // Force re-login with new password
    
    return true;
  }
}
