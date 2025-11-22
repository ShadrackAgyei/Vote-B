'use client';

import { useEffect, useState } from 'react';
import { VotingSystem } from '@/lib/voting';
import { Wallet } from '@/lib/utils/wallet';
import VotingInterface from '@/components/VotingInterface';
import Results from '@/components/Results';
import WalletSetup from '@/components/WalletSetup';
import Header from '@/components/Header';
import { VoteOption } from '@/lib/voting';

export default function Home() {
  const [votingSystem] = useState(() => new VotingSystem());
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Initialize wallet
    const savedWallet = Wallet.load();
    if (savedWallet) {
      setWallet(savedWallet);
      setHasVoted(votingSystem.hasVoted(savedWallet.getAddress()));
    } else {
      // Create new wallet for demo
      const newWallet = new Wallet();
      newWallet.save();
      setWallet(newWallet);
    }

    // Create a sample election
    const options: VoteOption[] = [
      { id: 'option1', label: 'Yes', description: 'Vote in favor' },
      { id: 'option2', label: 'No', description: 'Vote against' },
      { id: 'option3', label: 'Abstain', description: 'Neutral position' },
    ];

    votingSystem.createElection(
      'election-1',
      'Proposal 2025',
      'Should we implement the new feature proposal?',
      options,
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    );
  }, [votingSystem]);

  const handleVote = (optionId: string): boolean => {
    if (!wallet) return false;
    
    const success = votingSystem.castVote(wallet.getAddress(), optionId);
    if (success) {
      setHasVoted(true);
      setShowResults(true);
    }
    return success;
  };

  const createNewWallet = () => {
    const newWallet = new Wallet();
    newWallet.save();
    setWallet(newWallet);
    setHasVoted(false);
    setShowResults(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Header 
          wallet={wallet}
          onNewWallet={createNewWallet}
          blockCount={votingSystem.getBlockCount()}
        />

        {wallet ? (
          <>
            {!hasVoted ? (
              <VotingInterface
                election={votingSystem.getCurrentElection()}
                onVote={handleVote}
              />
            ) : (
              <div className="space-y-6">
                <div className="card text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Vote Cast Successfully</h2>
                  <p className="text-muted mb-6">
                    Your vote has been recorded on the blockchain and is immutable.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowResults(!showResults)}
                      className="btn btn-primary"
                    >
                      {showResults ? 'Hide Results' : 'View Results'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showResults && (
              <Results
                election={votingSystem.getCurrentElection()}
                results={votingSystem.getResults()}
                totalVotes={votingSystem.getTotalVotes()}
                isChainValid={votingSystem.isChainValid()}
              />
            )}
          </>
        ) : (
          <WalletSetup onWalletCreated={(w) => setWallet(w)} />
        )}
      </div>
    </main>
  );
}
