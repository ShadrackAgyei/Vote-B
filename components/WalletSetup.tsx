'use client';

import { useState } from 'react';
import { Wallet } from '@/lib/utils/wallet';

interface WalletSetupProps {
  onWalletCreated: (wallet: Wallet) => void;
}

export default function WalletSetup({ onWalletCreated }: WalletSetupProps) {
  const [loading, setLoading] = useState(false);

  const createWallet = () => {
    setLoading(true);
    const wallet = new Wallet();
    wallet.save();
    
    // Small delay for UX
    setTimeout(() => {
      onWalletCreated(wallet);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="card text-center max-w-md mx-auto">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Welcome to Vote-B</h2>
        <p className="text-muted">
          Create a secure wallet to start voting on the blockchain
        </p>
      </div>

      <button
        onClick={createWallet}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </span>
        ) : (
          'Create Wallet'
        )}
      </button>

      <p className="text-xs text-muted mt-6">
        Your wallet is stored securely in your browser. Only you have access to it.
      </p>
    </div>
  );
}
