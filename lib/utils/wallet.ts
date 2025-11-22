import CryptoJS from 'crypto-js';

export class Wallet {
  private address: string;
  private privateKey: string;

  constructor(privateKey?: string) {
    if (privateKey) {
      this.privateKey = privateKey;
      this.address = this.generateAddress(privateKey);
    } else {
      this.privateKey = this.generatePrivateKey();
      this.address = this.generateAddress(this.privateKey);
    }
  }

  private generatePrivateKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  private generateAddress(privateKey: string): string {
    return CryptoJS.SHA256(privateKey).toString().substring(0, 16);
  }

  getAddress(): string {
    return this.address;
  }

  getPrivateKey(): string {
    return this.privateKey;
  }

  // Save wallet to localStorage
  save(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet_private_key', this.privateKey);
      localStorage.setItem('wallet_address', this.address);
    }
  }

  // Load wallet from localStorage
  static load(): Wallet | null {
    if (typeof window !== 'undefined') {
      const privateKey = localStorage.getItem('wallet_private_key');
      if (privateKey) {
        return new Wallet(privateKey);
      }
    }
    return null;
  }

  // Clear wallet from localStorage
  static clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wallet_private_key');
      localStorage.removeItem('wallet_address');
    }
  }
}
