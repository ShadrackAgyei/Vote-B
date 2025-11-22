'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VotingSystem } from '@/lib/voting';
import { Storage } from '@/lib/storage';
import { SchoolManager } from '@/lib/schools';
import VotingInterface from '@/components/VotingInterface';
import Results from '@/components/Results';
import VoterRegistration from '@/components/VoterRegistration';
import Header from '@/components/Header';
import { Election } from '@/lib/voting';
import { normalizeEmail } from '@/lib/utils/email';
import type { School } from '@/lib/schools';

export default function Home() {
  const [votingSystem] = useState(() => new VotingSystem());
  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  const [voterEmail, setVoterEmail] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedPositions, setVotedPositions] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);

  useEffect(() => {
    loadElectionData();
  }, []);

  const loadElectionData = async () => {
    setLoading(true);

    // Get current school
    const school = SchoolManager.getCurrentSchool();
    setCurrentSchool(school);

    // Load elections from storage (filtered by school)
    const storedElections = await Storage.getAllElections(school?.id);

    if (storedElections.length === 0) {
      setLoading(false);
      return;
    }

    // Load elections into voting system
    storedElections.forEach(storedElection => {
      // Migrate legacy elections
      const migrated = Storage.migrateLegacyElection(storedElection);

      const election: Election = {
        id: migrated.id,
        title: migrated.title,
        description: migrated.description,
        positions: migrated.positions || [],
        schoolId: migrated.schoolId,
        startDate: new Date(migrated.startDate),
        endDate: new Date(migrated.endDate),
        isActive: new Date() >= new Date(migrated.startDate) &&
                  new Date() <= new Date(migrated.endDate),
      };

      votingSystem.createElection(
        election.id,
        election.title,
        election.description,
        election.positions,
        election.startDate,
        election.endDate,
        election.schoolId
      );
    });

    // Set current election
    const currentId = await Storage.getCurrentElectionId();
    if (currentId) {
      votingSystem.setCurrentElection(currentId);
      const election = votingSystem.getElection(currentId);
      setCurrentElection(election || null);

      // Check for saved voter email
      const savedEmail = localStorage.getItem('vote_b_current_voter_email');
      if (savedEmail && election) {
        const normalizedEmail = normalizeEmail(savedEmail);
        const schoolId = school?.id;

        if (await Storage.isVoterVerified(normalizedEmail, currentId, school?.id)) {
          setVoterEmail(normalizedEmail);
          
          // Check which positions the voter has voted for
          const hasVotedAny = votingSystem.hasVoted(normalizedEmail);
          setHasVoted(hasVotedAny);
          
          // Get voted positions
          const voted = new Set<string>();
          if (hasVotedAny && election.positions) {
            election.positions.forEach(position => {
              if (votingSystem.hasVotedInPosition(normalizedEmail, position.id)) {
                voted.add(position.id);
              }
            });
          }
          setVotedPositions(voted);
          
          // If voted for all positions, show results
          if (voted.size === election.positions.length) {
            setShowResults(true);
          }
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

  const handleVote = async (positionId: string, candidateId: string): Promise<boolean> => {
    if (!voterEmail || !currentElection) return false;

    const normalizedEmail = normalizeEmail(voterEmail);
    const schoolId = currentSchool?.id;

    // Double-check voter is verified
    if (!(await Storage.isVoterVerified(normalizedEmail, currentElection.id, schoolId))) {
      alert('Please complete email verification first.');
      return false;
    }
    
    // Check if already voted for this position
    if (votedPositions.has(positionId) || votingSystem.hasVotedInPosition(normalizedEmail, positionId)) {
      alert('You have already voted for this position.');
      return false;
    }
    
    const success = votingSystem.castVote(normalizedEmail, positionId, candidateId);
    
    if (success) {
      setVotedPositions(prev => new Set([...prev, positionId]));
      
      // Check if all positions have been voted
      const allVoted = currentElection.positions.every(p =>
        new Set([...votedPositions, positionId]).has(p.id)
      );
      
      if (allVoted) {
        setHasVoted(true);
        setShowResults(true);
      }
    } else {
      alert('Failed to cast vote. Please try again.');
    }
    
    return success;
  };

  const hasVotedInPosition = (positionId: string): boolean => {
    if (!voterEmail) return false;
    return votedPositions.has(positionId) || 
           votingSystem.hasVotedInPosition(normalizeEmail(voterEmail), positionId);
  };

  const handleLogout = () => {
    setVoterEmail(null);
    setHasVoted(false);
    setVotedPositions(new Set());
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

  const allPositionsVoted = currentElection.positions.every(p => 
    votedPositions.has(p.id) || hasVotedInPosition(p.id)
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Header
          voterEmail={voterEmail}
          onLogout={handleLogout}
          blockCount={votingSystem.getBlockCount()}
        />

        {currentSchool && (
          <div className="mb-6 card bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="text-sm text-muted mb-1">School/Organization</div>
            <div className="font-semibold">{currentSchool.name}</div>
          </div>
        )}

        {!voterEmail ? (
          <VoterRegistration
            electionId={currentElection.id}
            schoolId={currentSchool?.id}
            onRegistered={handleRegistered}
          />
        ) : !allPositionsVoted ? (
          <VotingInterface
            election={currentElection}
            onVote={handleVote}
            hasVotedInPosition={hasVotedInPosition}
          />
        ) : (
          <div className="space-y-6">
            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">All Votes Cast Successfully</h2>
              <p className="text-muted mb-6">
                Your votes for all positions have been recorded on the blockchain and are immutable.
              </p>
            </div>
          </div>
        )}

        {/* Results section - Always visible to everyone */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Live Results</h2>
            <button
              onClick={() => setShowResults(!showResults)}
              className="btn btn-secondary"
            >
              {showResults ? 'Hide Results' : 'Show Results'}
            </button>
          </div>

          {showResults && (
            <Results
              election={currentElection}
              results={votingSystem.getResults(currentElection.id)}
              totalVotes={votingSystem.getTotalVotes()}
              isChainValid={votingSystem.isChainValid()}
            />
          )}
        </div>
      </div>
    </main>
  );
}