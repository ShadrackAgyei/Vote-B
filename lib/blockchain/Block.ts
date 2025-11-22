import CryptoJS from 'crypto-js';

export interface Transaction {
  voterId: string;
  vote: string;
  timestamp: number;
}

export class Block {
  public timestamp: number;
  public transactions: Transaction[];
  public previousHash: string;
  public hash: string;
  public nonce: number;

  constructor(timestamp: number, transactions: Transaction[], previousHash: string = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash(): string {
    return CryptoJS.SHA256(
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.nonce
    ).toString();
  }

  mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join('0');
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  hasValidTransactions(): boolean {
    for (const tx of this.transactions) {
      if (!tx.voterId || !tx.vote || !tx.timestamp) {
        return false;
      }
    }
    return true;
  }
}
