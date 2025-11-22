import { Blockchain, Transaction } from '../blockchain';
import type { Election, Position, Candidate, VoteOption } from './types';

// Legacy interface for backward compatibility
export interface LegacyElection {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export class VotingSystem {
  private blockchain: Blockchain;
  private elections: Map<string, Election>;
  private currentElectionId: string | null;

  constructor() {
    this.blockchain = new Blockchain();
    this.elections = new Map();
    this.currentElectionId = null;
  }

  getBlockchain(): Blockchain {
    return this.blockchain;
  }

  createElection(
    id: string,
    title: string,
    description: string,
    positions: Position[],
    startDate: Date,
    endDate: Date,
    schoolId?: string
  ): Election {
    const election: Election = {
      id,
      title,
      description,
      positions,
      schoolId,
      startDate,
      endDate,
      isActive: new Date() >= startDate && new Date() <= endDate,
    };

    this.elections.set(id, election);
    if (!this.currentElectionId) {
      this.currentElectionId = id;
    }
    return election;
  }

  // Legacy method for backward compatibility
  createLegacyElection(
    id: string,
    title: string,
    description: string,
    options: VoteOption[],
    startDate: Date,
    endDate: Date
  ): Election {
    // Convert legacy options to positions
    const positions: Position[] = [
      {
        id: 'position-1',
        title: 'Vote',
        candidates: options.map(opt => ({
          id: opt.id,
          name: opt.label,
          description: opt.description,
        })),
      },
    ];

    return this.createElection(id, title, description, positions, startDate, endDate);
  }

  getElection(id: string): Election | undefined {
    return this.elections.get(id);
  }

  getCurrentElection(): Election | null {
    if (!this.currentElectionId) return null;
    return this.elections.get(this.currentElectionId) || null;
  }

  getAllElections(): Election[] {
    return Array.from(this.elections.values());
  }

  getElectionsBySchool(schoolId: string): Election[] {
    return this.getAllElections().filter(e => e.schoolId === schoolId);
  }

  setCurrentElection(id: string): boolean {
    if (this.elections.has(id)) {
      this.currentElectionId = id;
      return true;
    }
    return false;
  }

  // Vote for a candidate in a position
  castVote(voterId: string, positionId: string, candidateId: string): boolean {
    const election = this.getCurrentElection();
    if (!election || !election.isActive) {
      return false;
    }

    // Validate position exists
    const position = election.positions.find(p => p.id === positionId);
    if (!position) {
      return false;
    }

    // Validate candidate exists
    const candidate = position.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return false;
    }

    // Register voter if not already registered
    if (!this.blockchain.isVoterRegistered(voterId)) {
      this.blockchain.registerVoter(voterId);
    }

    // Create transaction with position and candidate info
    // Format: positionId:candidateId
    const voteOption = `${positionId}:${candidateId}`;
    
    const transaction: Transaction = {
      voterId,
      vote: voteOption,
      timestamp: Date.now(),
    };

    // Add transaction to blockchain
    const success = this.blockchain.addTransaction(transaction);
    
    if (success) {
      this.blockchain.minePendingTransactions('miner');
    }

    return success;
  }

  // Legacy vote method for backward compatibility
  castLegacyVote(voterId: string, optionId: string): boolean {
    const election = this.getCurrentElection();
    if (!election || !election.isActive) {
      return false;
    }

    // Try to find option in first position (legacy support)
    if (election.positions.length > 0) {
      const position = election.positions[0];
      const candidate = position.candidates.find(c => c.id === optionId);
      if (candidate) {
        return this.castVote(voterId, position.id, candidate.id);
      }
    }

    return false;
  }

  getResults(electionId?: string): Record<string, Record<string, number>> {
    const election = electionId 
      ? this.getElection(electionId)
      : this.getCurrentElection();

    if (!election) {
      return {};
    }

    const allCounts = this.blockchain.getVoteCounts();
    const results: Record<string, Record<string, number>> = {};

    // Process results per position
    election.positions.forEach(position => {
      results[position.id] = {};
      
      position.candidates.forEach(candidate => {
        // Count votes for this candidate in this position
        const voteOption = `${position.id}:${candidate.id}`;
        results[position.id][candidate.id] = allCounts[voteOption] || 0;
      });
    });

    return results;
  }

  // Legacy results method
  getLegacyResults(electionId?: string): Record<string, number> {
    const positionResults = this.getResults(electionId);
    
    // Convert to legacy format (first position only)
    const firstPosition = Object.keys(positionResults)[0];
    if (firstPosition) {
      return positionResults[firstPosition];
    }
    
    return {};
  }

  hasVoted(voterId: string): boolean {
    return this.blockchain.hasVoted(voterId);
  }

  hasVotedInPosition(voterId: string, positionId: string): boolean {
    const election = this.getCurrentElection();
    if (!election) return false;

    const votes = this.blockchain.getAllVotes();
    const positionVotePattern = `${positionId}:`;
    
    return votes.some(vote => 
      vote.voterId === voterId && vote.vote.startsWith(positionVotePattern)
    );
  }

  getTotalVotes(): number {
    return this.blockchain.getAllVotes().length;
  }

  getVotesForPosition(positionId: string): number {
    const votes = this.blockchain.getAllVotes();
    const positionVotePattern = `${positionId}:`;
    return votes.filter(vote => vote.vote.startsWith(positionVotePattern)).length;
  }

  getBlockCount(): number {
    return this.blockchain.chain.length;
  }

  isChainValid(): boolean {
    return this.blockchain.isChainValid();
  }
}

// Re-export types
export type { Election, Position, Candidate, VoteOption } from './types';