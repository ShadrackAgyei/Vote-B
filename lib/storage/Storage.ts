import { Election, Position, Candidate, VoteOption } from '../voting';

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

export class Storage {
  private static ELECTIONS_KEY = 'vote_b_elections';
  private static VOTERS_KEY = 'vote_b_voters';
  private static CURRENT_ELECTION_KEY = 'vote_b_current_election';

  // Election storage with new structure
  static saveElection(election: Election): void {
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

    const elections = this.getAllElections();
    const existingIndex = elections.findIndex(e => e.id === election.id);
    
    if (existingIndex >= 0) {
      elections[existingIndex] = stored;
    } else {
      elections.push(stored);
    }

    localStorage.setItem(this.ELECTIONS_KEY, JSON.stringify(elections));
  }

  static getAllElections(schoolId?: string): StoredElection[] {
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

  static getElection(id: string): StoredElection | null {
    const elections = this.getAllElections();
    return elections.find(e => e.id === id) || null;
  }

  static deleteElection(id: string): void {
    if (typeof window === 'undefined') return;

    const elections = this.getAllElections().filter(e => e.id !== id);
    localStorage.setItem(this.ELECTIONS_KEY, JSON.stringify(elections));

    // Clear current election if it was deleted
    const currentId = this.getCurrentElectionId();
    if (currentId === id) {
      localStorage.removeItem(this.CURRENT_ELECTION_KEY);
    }
  }

  static setCurrentElection(id: string | null): void {
    if (typeof window === 'undefined') return;

    if (id) {
      localStorage.setItem(this.CURRENT_ELECTION_KEY, id);
    } else {
      localStorage.removeItem(this.CURRENT_ELECTION_KEY);
    }
  }

  static getCurrentElectionId(): string | null {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem(this.CURRENT_ELECTION_KEY);
  }

  // Voter storage with school support
  static registerVoter(email: string, electionId: string, schoolId?: string): boolean {
    if (typeof window === 'undefined') return false;

    if (this.isVoterRegistered(email, electionId, schoolId)) {
      return false; // Already registered
    }

    const voter: RegisteredVoter = {
      email: email.toLowerCase().trim(),
      electionId,
      schoolId,
      registeredAt: Date.now(),
      verified: false,
    };

    const voters = this.getAllVoters();
    voters.push(voter);
    localStorage.setItem(this.VOTERS_KEY, JSON.stringify(voters));

    return true;
  }

  static getAllVoters(schoolId?: string): RegisteredVoter[] {
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

  static getElectionVoters(electionId: string, schoolId?: string): RegisteredVoter[] {
    const voters = this.getAllVoters(schoolId);
    return voters.filter(v => v.electionId === electionId);
  }

  static isVoterRegistered(email: string, electionId: string, schoolId?: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    const voters = this.getAllVoters(schoolId);
    
    return voters.some(
      v => v.email === normalizedEmail && v.electionId === electionId
    );
  }

  static verifyVoter(email: string, electionId: string, schoolId?: string): void {
    if (typeof window === 'undefined') return;

    const voters = this.getAllVoters(schoolId);
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

  static isVoterVerified(email: string, electionId: string, schoolId?: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    const voters = this.getAllVoters(schoolId);
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