import { Block, Transaction } from './Block';
import CryptoJS from 'crypto-js';

export class Blockchain {
  public chain: Block[];
  public pendingTransactions: Transaction[];
  public miningReward: number;
  public difficulty: number;
  public registeredVoters: Set<string>;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.difficulty = 2; // Reduced for faster mining in demo
    this.registeredVoters = new Set();
  }

  createGenesisBlock(): Block {
    return new Block(Date.now(), [], '0');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress: string): void {
    const rewardTx: Transaction = {
      voterId: 'system',
      vote: `Mining reward: ${this.miningReward}`,
      timestamp: Date.now(),
    };
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [];
  }

  addTransaction(transaction: Transaction): boolean {
    if (!transaction.voterId || !transaction.vote) {
      return false;
    }

    // Check if voter has already voted
    if (this.hasVoted(transaction.voterId)) {
      return false;
    }

    this.pendingTransactions.push(transaction);
    return true;
  }

  hasVoted(voterId: string): boolean {
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.voterId === voterId && tx.voterId !== 'system') {
          return true;
        }
      }
    }
    
    // Also check pending transactions
    for (const tx of this.pendingTransactions) {
      if (tx.voterId === voterId && tx.voterId !== 'system') {
        return true;
      }
    }
    
    return false;
  }

  registerVoter(voterId: string): void {
    this.registeredVoters.add(voterId);
  }

  isVoterRegistered(voterId: string): boolean {
    return this.registeredVoters.has(voterId);
  }

  getBalance(voterId: string): number {
    let balance = 0;
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.voterId === 'system' && tx.vote.includes('Mining reward')) {
          balance += this.miningReward;
        }
      }
    }
    return balance;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
    }
    return true;
  }

  getVoteCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.voterId !== 'system' && tx.vote) {
          counts[tx.vote] = (counts[tx.vote] || 0) + 1;
        }
      }
    }
    
    // Also count pending transactions
    for (const tx of this.pendingTransactions) {
      if (tx.voterId !== 'system' && tx.vote) {
        counts[tx.vote] = (counts[tx.vote] || 0) + 1;
      }
    }
    
    return counts;
  }

  getAllVotes(): Transaction[] {
    const votes: Transaction[] = [];
    
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.voterId !== 'system') {
          votes.push(tx);
        }
      }
    }
    
    // Also include pending transactions
    for (const tx of this.pendingTransactions) {
      if (tx.voterId !== 'system') {
        votes.push(tx);
      }
    }
    
    return votes;
  }
}
