import { Blockchain, Transaction } from '../blockchain';

export interface VoteOption {
  id: string;
  label: string;
  description?: string;
}

export interface Election {
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
    options: VoteOption[],
    startDate: Date,
    endDate: Date
  ): Election {
    const election: Election = {
      id,
      title,
      description,
      options,
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

  setCurrentElection(id: string): boolean {
    if (this.elections.has(id)) {
      this.currentElectionId = id;
      return true;
    }
    return false;
  }

  castVote(voterId: string, optionId: string): boolean {
    const election = this.getCurrentElection();
    if (!election || !election.isActive) {
      return false;
    }

    // Validate option exists
    const option = election.options.find(opt => opt.id === optionId);
    if (!option) {
      return false;
    }

    // Register voter if not already registered
    if (!this.blockchain.isVoterRegistered(voterId)) {
      this.blockchain.registerVoter(voterId);
    }

    // Create transaction
    const transaction: Transaction = {
      voterId,
      vote: optionId,
      timestamp: Date.now(),
    };

    // Add transaction to blockchain
    const success = this.blockchain.addTransaction(transaction);
    
    if (success) {
      // Mine the block immediately for demo purposes (in production, this would be different)
      this.blockchain.minePendingTransactions('miner');
    }

    return success;
  }

  getResults(electionId?: string): Record<string, number> {
    const election = electionId 
      ? this.getElection(electionId)
      : this.getCurrentElection();

    if (!election) {
      return {};
    }

    const allCounts = this.blockchain.getVoteCounts();
    const results: Record<string, number> = {};

    // Filter counts to only include valid options for this election
    election.options.forEach(option => {
      results[option.id] = allCounts[option.id] || 0;
    });

    return results;
  }

  hasVoted(voterId: string): boolean {
    return this.blockchain.hasVoted(voterId);
  }

  getTotalVotes(): number {
    return this.blockchain.getAllVotes().length;
  }

  getBlockCount(): number {
    return this.blockchain.chain.length;
  }

  isChainValid(): boolean {
    return this.blockchain.isChainValid();
  }
}
