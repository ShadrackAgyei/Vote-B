import { Election, Position, Candidate, VoteOption } from '../voting';

// Lazy load DatabaseStorage only on server-side to avoid client-side bundling issues
let DatabaseStorage: any = null;

// Only import on server-side
if (typeof window === 'undefined') {
  import('./DatabaseStorage').then((mod) => {
    DatabaseStorage = mod.DatabaseStorage;
  });
}

// Updated storage interface for new structure
export interface StoredElection {
  id: string;
  title: string;
  description: string;
  positions: Position[]; // New structure
  options?: VoteOption[]; // Legacy support
  schoolId?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface RegisteredVoter {
  email: string;
  electionId: string;
  schoolId?: string; // For multi-tenant support
  registeredAt: number;
  verified: boolean;
}

/**
 * Dual-mode storage: Saves to both localStorage AND database
 * Reads from database first, falls back to localStorage
 */
export class Storage {
  private static ELECTIONS_KEY = 'vote_b_elections';
  private static VOTERS_KEY = 'vote_b_voters';
  private static CURRENT_ELECTION_KEY = 'vote_b_current_election';

  // Election storage with new structure (DUAL-MODE)
  static async saveElection(election: Election): Promise<void> {
    // Save to localStorage (synchronous, always works)
    this.saveElectionToLocalStorage(election);

    // Save to database
    if (typeof window === 'undefined') {
      // Server-side: Use DatabaseStorage directly
      if (DatabaseStorage) {
        try {
          await DatabaseStorage.saveElection(election);
          console.log(`[Storage] Saved to database: ${election.title}`);
        } catch (error) {
          console.warn('[Storage] Database save failed, using localStorage only:', error);
        }
      }
    } else {
      // Client-side: Call API route
      try {
        const response = await fetch('/api/elections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(election),
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();
        console.log(`[Storage] Saved to database via API: ${election.title}`);
      } catch (error) {
        console.warn('[Storage] API save failed, using localStorage only:', error);
      }
    }
  }

  // Helper: Save only to localStorage
  private static saveElectionToLocalStorage(election: Election): void {
    if (typeof window === 'undefined') return;

    const stored: StoredElection = {
      id: election.id,
      title: election.title,
      description: election.description,
      positions: election.positions,
      schoolId: election.schoolId,
      startDate: election.startDate.toISOString(),
      endDate: election.endDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    const elections = this.getElectionsFromLocalStorage();
    const existingIndex = elections.findIndex(e => e.id === election.id);

    if (existingIndex >= 0) {
      elections[existingIndex] = stored;
    } else {
      elections.push(stored);
    }

    localStorage.setItem(this.ELECTIONS_KEY, JSON.stringify(elections));
  }

  // Helper: Get elections from localStorage only
  private static getElectionsFromLocalStorage(schoolId?: string): StoredElection[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(this.ELECTIONS_KEY);
    if (!stored) return [];

    try {
      const elections = JSON.parse(stored);

      // Filter by school if provided
      if (schoolId) {
        return elections.filter((e: StoredElection) => e.schoolId === schoolId);
      }

      return elections;
    } catch {
      return [];
    }
  }

  // Read from database first, fallback to localStorage (DUAL-MODE)
  static async getAllElections(schoolId?: string): Promise<StoredElection[]> {
    if (DatabaseStorage && typeof window === 'undefined') {
      try {
        const dbElections = await DatabaseStorage.getAllElections(schoolId);
        if (dbElections.length > 0) {
          console.log(`[Storage] Loaded ${dbElections.length} elections from database`);
          return dbElections;
        }
      } catch (error) {
        console.warn('[Storage] Database read failed, using localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.getElectionsFromLocalStorage(schoolId);
  }

  static async getElection(id: string): Promise<StoredElection | null> {
    if (DatabaseStorage && typeof window === 'undefined') {
      try {
        const dbElection = await DatabaseStorage.getElection(id);
        if (dbElection) {
          return dbElection;
        }
      } catch (error) {
        console.warn('[Storage] Database read failed, using localStorage:', error);
      }
    }

    // Fallback to localStorage
    const elections = this.getElectionsFromLocalStorage();
    return elections.find(e => e.id === id) || null;
  }

  static async deleteElection(id: string): Promise<void> {
    // Delete from localStorage
    if (typeof window !== 'undefined') {
      const elections = this.getElectionsFromLocalStorage().filter(e => e.id !== id);
      localStorage.setItem(this.ELECTIONS_KEY, JSON.stringify(elections));

      // Clear current election if it was deleted
      const currentId = await this.getCurrentElectionId();
      if (currentId === id) {
        localStorage.removeItem(this.CURRENT_ELECTION_KEY);
      }
    }

    // Delete from database
    if (typeof window === 'undefined') {
      // Server-side: Use DatabaseStorage directly
      if (DatabaseStorage) {
        try {
          await DatabaseStorage.deleteElection(id);
          console.log(`[Storage] Deleted from database: ${id}`);
        } catch (error) {
          console.warn('[Storage] Database delete failed:', error);
        }
      }
    } else {
      // Client-side: Call API route
      try {
        const response = await fetch(`/api/elections?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        console.log(`[Storage] Deleted from database via API: ${id}`);
      } catch (error) {
        console.warn('[Storage] API delete failed:', error);
      }
    }
  }

  static async setCurrentElection(id: string | null): Promise<void> {
    if (DatabaseStorage && typeof window === 'undefined') {
      await DatabaseStorage.setCurrentElection(id);
    } else if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem(this.CURRENT_ELECTION_KEY, id);
      } else {
        localStorage.removeItem(this.CURRENT_ELECTION_KEY);
      }
    }
  }

  static async getCurrentElectionId(): Promise<string | null> {
    if (DatabaseStorage && typeof window === 'undefined') {
      return await DatabaseStorage.getCurrentElectionId();
    } else if (typeof window !== 'undefined') {
      return localStorage.getItem(this.CURRENT_ELECTION_KEY);
    }
    return null;
  }

  // Voter storage with school support (DUAL-MODE)
  static async registerVoter(email: string, electionId: string, schoolId?: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    // Register in localStorage
    let localSuccess = false;
    if (typeof window !== 'undefined') {
      const voters = this.getVotersFromLocalStorage(schoolId);

      if (!voters.some(v => v.email === normalizedEmail && v.electionId === electionId)) {
        const voter: RegisteredVoter = {
          email: normalizedEmail,
          electionId,
          schoolId,
          registeredAt: Date.now(),
          verified: false,
        };

        voters.push(voter);
        localStorage.setItem(this.VOTERS_KEY, JSON.stringify(voters));
        localSuccess = true;
      }
    }

    // Register in database
    if (DatabaseStorage && typeof window === 'undefined') {
      try {
        const dbSuccess = await DatabaseStorage.registerVoter(normalizedEmail, electionId, schoolId);
        console.log(`[Storage] Registered voter in database: ${normalizedEmail}`);
        return dbSuccess || localSuccess;
      } catch (error) {
        console.warn('[Storage] Database register failed, using localStorage only:', error);
        return localSuccess;
      }
    }

    return localSuccess;
  }

  // Helper: Get voters from localStorage only
  private static getVotersFromLocalStorage(schoolId?: string): RegisteredVoter[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(this.VOTERS_KEY);
    if (!stored) return [];

    try {
      const voters = JSON.parse(stored);

      // Filter by school if provided
      if (schoolId) {
        return voters.filter((v: RegisteredVoter) => v.schoolId === schoolId);
      }

      return voters;
    } catch {
      return [];
    }
  }

  static async getAllVoters(schoolId?: string): Promise<RegisteredVoter[]> {
    if (DatabaseStorage && typeof window === 'undefined') {
      try {
        const dbVoters = await DatabaseStorage.getAllVoters(schoolId);
        if (dbVoters.length > 0) {
          return dbVoters;
        }
      } catch (error) {
        console.warn('[Storage] Database read failed, using localStorage:', error);
      }
    }

    return this.getVotersFromLocalStorage(schoolId);
  }

  static async getElectionVoters(electionId: string, schoolId?: string): Promise<RegisteredVoter[]> {
    if (DatabaseStorage && typeof window === 'undefined') {
      try {
        const dbVoters = await DatabaseStorage.getElectionVoters(electionId, schoolId);
        if (dbVoters.length > 0) {
          return dbVoters;
        }
      } catch (error) {
        console.warn('[Storage] Database read failed, using localStorage:', error);
      }
    }

    const voters = this.getVotersFromLocalStorage(schoolId);
    return voters.filter(v => v.electionId === electionId);
  }

  static async isVoterRegistered(email: string, electionId: string, schoolId?: string): Promise<boolean> {
    if (DatabaseStorage && typeof window === 'undefined') {
      try {
        const dbRegistered = await DatabaseStorage.isVoterRegistered(email, electionId, schoolId);
        if (dbRegistered) return true;
      } catch (error) {
        console.warn('[Storage] Database check failed, using localStorage:', error);
      }
    }

    const normalizedEmail = email.toLowerCase().trim();
    const voters = this.getVotersFromLocalStorage(schoolId);

    return voters.some(
      v => v.email === normalizedEmail && v.electionId === electionId
    );
  }

  static async verifyVoter(email: string, electionId: string, schoolId?: string): Promise<void> {
    // Verify in localStorage
    if (typeof window !== 'undefined') {
      const voters = this.getVotersFromLocalStorage(schoolId);
      const voter = voters.find(
        v => v.email === email.toLowerCase().trim() &&
             v.electionId === electionId &&
             (!schoolId || v.schoolId === schoolId)
      );

      if (voter) {
        voter.verified = true;
        localStorage.setItem(this.VOTERS_KEY, JSON.stringify(voters));
      }
    }

    // Verify in database
    if (DatabaseStorage && typeof window === 'undefined') {
      try {
        await DatabaseStorage.verifyVoter(email, electionId, schoolId);
        console.log(`[Storage] Verified voter in database: ${email}`);
      } catch (error) {
        console.warn('[Storage] Database verify failed:', error);
      }
    }
  }

  static async isVoterVerified(email: string, electionId: string, schoolId?: string): Promise<boolean> {
    if (DatabaseStorage && typeof window === 'undefined') {
      try {
        const dbVerified = await DatabaseStorage.isVoterVerified(email, electionId, schoolId);
        if (dbVerified) return true;
      } catch (error) {
        console.warn('[Storage] Database check failed, using localStorage:', error);
      }
    }

    const normalizedEmail = email.toLowerCase().trim();
    const voters = this.getVotersFromLocalStorage(schoolId);
    const voter = voters.find(
      v => v.email === normalizedEmail &&
           v.electionId === electionId &&
           (!schoolId || v.schoolId === schoolId)
    );

    return voter?.verified ?? false;
  }

  // Convert legacy election format to new format
  static migrateLegacyElection(stored: StoredElection): StoredElection {
    if (stored.positions && stored.positions.length > 0) {
      return stored; // Already in new format
    }

    // Convert legacy options to positions
    if (stored.options && stored.options.length > 0) {
      stored.positions = [
        {
          id: 'position-1',
          title: 'Vote',
          candidates: stored.options.map(opt => ({
            id: opt.id,
            name: opt.label,
            description: opt.description,
          })),
        },
      ];
      delete stored.options;
    }

    return stored;
  }

  // Clear all data (useful for testing)
  static clearAll(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.ELECTIONS_KEY);
    localStorage.removeItem(this.VOTERS_KEY);
    localStorage.removeItem(this.CURRENT_ELECTION_KEY);
  }
}