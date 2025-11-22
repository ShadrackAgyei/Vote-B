'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VotingSystem } from '@/lib/voting';
import { Storage } from '@/lib/storage';
import VotingInterface from '@/components/VotingInterface';
import Results from '@/components/Results';
import VoterRegistration from '@/components/VoterRegistration';
import Header from '@/components/Header';
import { Election } from '@/lib/voting';
import { normalizeEmail } from '@/lib/utils/email';

export default function Home() {
  const [votingSystem] = useState(() => new VotingSystem());
  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  const [voterEmail, setVoterEmail] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadElectionData();
  }, []);

  const loadElectionData = () => {
    setLoading(true);
    
    // Load elections from storage
    const storedElections = Storage.getAllElections();
    
    if (storedElections.length === 0) {
      setLoading(false);
      return;
    }

    // Load elections into voting system
    storedElections.forEach(storedElection => {
      const election: Election = {
        id: storedElection.id,
        title: storedElection.title,
        description: storedElection.description,
        options: storedElection.options,
        startDate: new Date(storedElection.startDate),
        endDate: new Date(storedElection.endDate),
        isActive: new Date() >= new Date(storedElection.startDate) && 
                  new Date() <= new Date(storedElection.endDate),
      };
      
      votingSystem.createElection(
        election.id,
        election.title,
        election.description,
        election.options,
        election.startDate,
        election.endDate
      );
    });

    // Set current election
    const currentId = Storage.getCurrentElectionId();
    if (currentId) {
      votingSystem.setCurrentElection(currentId);
      const election = votingSystem.getElection(currentId);
      setCurrentElection(election || null);

      // Check for saved voter email
      const savedEmail = localStorage.getItem('vote_b_current_voter_email');
      if (savedEmail && election) {
        const normalizedEmail = normalizeEmail(savedEmail);
        if (Storage.isVoterVerified(normalizedEmail, currentId)) {
          setVoterEmail(normalizedEmail);
          setHasVoted(votingSystem.hasVoted(normalizedEmail));
        }
      }
    }

    setLoading(false);
  };

  const handleRegistered = (email: string) => {
    const normalizedEmail = normalizeEmail(email);
    setVoterEmail(normalizedEmail);
    
    // Save voter email
    if (typeof window !== 'undefined') {
      localStorage.setItem('vote_b_current_voter_email', normalizedEmail);
    }
  };

  const handleVote = (optionId: string): boolean => {
    if (!voterEmail || !currentElection) return false;
    
    const normalizedEmail = normalizeEmail(voterEmail);
    
    // Double-check voter is verified
    if (!Storage.isVoterVerified(normalizedEmail, currentElection.id)) {
      alert('Please complete email verification first.');
      return false;
    }
    
    const success = votingSystem.castVote(normalizedEmail, optionId);
    if (success) {
      setHasVoted(true);
      setShowResults(true);
    } else {
      alert('Failed to cast vote. You may have already voted.');
    }
    return success;
  };

  const handleLogout = () => {
    setVoterEmail(null);
    setHasVoted(false);
    setShowResults(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vote_b_current_voter_email');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-muted">Loading...</p>
        </div>
      </main>
    );
  }

  if (!currentElection) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Vote-B</h1>
            <p className="text-muted mb-8">
              No active election found. Please create an election first.
            </p>
            <Link href="/admin" className="btn btn-primary">
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Header 
          voterEmail={voterEmail}
          onLogout={handleLogout}
          blockCount={votingSystem.getBlockCount()}
        />

        {!voterEmail ? (
          <VoterRegistration
            electionId={currentElection.id}
            onRegistered={handleRegistered}
          />
        ) : (
          <>
            {!hasVoted ? (
              <VotingInterface
                election={currentElection}
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
                election={currentElection}
                results={votingSystem.getResults(currentElection.id)}
                totalVotes={votingSystem.getTotalVotes()}
                isChainValid={votingSystem.isChainValid()}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}