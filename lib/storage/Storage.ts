import { Election, VoteOption } from '../voting';

export interface StoredElection {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface RegisteredVoter {
  email: string;
  electionId: string;
  registeredAt: number;
  verified: boolean;
}

export class Storage {
  private static ELECTIONS_KEY = 'vote_b_elections';
  private static VOTERS_KEY = 'vote_b_voters';
  private static CURRENT_ELECTION_KEY = 'vote_b_current_election';

  // Election storage
  static saveElection(election: Election): void {
    if (typeof window === 'undefined') return;

    const stored: StoredElection = {
      id: election.id,
      title: election.title,
      description: election.description,
      options: election.options,
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

  static getAllElections(): StoredElection[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(this.ELECTIONS_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
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

  // Voter storage
  static registerVoter(email: string, electionId: string): boolean {
    if (typeof window === 'undefined') return false;

    if (this.isVoterRegistered(email, electionId)) {
      return false; // Already registered
    }

    const voter: RegisteredVoter = {
      email: email.toLowerCase().trim(),
      electionId,
      registeredAt: Date.now(),
      verified: false, // In production, would require email verification
    };

    const voters = this.getAllVoters();
    voters.push(voter);
    localStorage.setItem(this.VOTERS_KEY, JSON.stringify(voters));

    return true;
  }

  static getAllVoters(): RegisteredVoter[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(this.VOTERS_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static getElectionVoters(electionId: string): RegisteredVoter[] {
    return this.getAllVoters().filter(v => v.electionId === electionId);
  }

  static isVoterRegistered(email: string, electionId: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    return this.getAllVoters().some(
      v => v.email === normalizedEmail && v.electionId === electionId
    );
  }

  static verifyVoter(email: string, electionId: string): void {
    if (typeof window === 'undefined') return;

    const voters = this.getAllVoters();
    const voter = voters.find(
      v => v.email === email.toLowerCase().trim() && v.electionId === electionId
    );

    if (voter) {
      voter.verified = true;
      localStorage.setItem(this.VOTERS_KEY, JSON.stringify(voters));
    }
  }

  static isVoterVerified(email: string, electionId: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    const voter = this.getAllVoters().find(
      v => v.email === normalizedEmail && v.electionId === electionId
    );

    return voter?.verified ?? false;
  }

  // Clear all data (useful for testing)
  static clearAll(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.ELECTIONS_KEY);
    localStorage.removeItem(this.VOTERS_KEY);
    localStorage.removeItem(this.CURRENT_ELECTION_KEY);
  }
}
