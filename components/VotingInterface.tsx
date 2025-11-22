'use client';

import { useState } from 'react';
import { Election } from '@/lib/voting';

interface VotingInterfaceProps {
  election: Election | null;
  onVote: (positionId: string, candidateId: string) => boolean;
  hasVotedInPosition?: (positionId: string) => boolean;
}

export default function VotingInterface({ 
  election, 
  onVote,
  hasVotedInPosition 
}: VotingInterfaceProps) {
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPositions, setSubmittedPositions] = useState<Set<string>>(new Set());

  if (!election) {
    return (
      <div className="card text-center">
        <p className="text-muted">No active election found.</p>
      </div>
    );
  }

  // Check if all positions have been voted on
  const allPositionsVoted = election.positions.every(
    position => submittedPositions.has(position.id) || hasVotedInPosition?.(position.id)
  );

  const handlePositionVote = async (positionId: string, candidateId: string) => {
    setError(null);
    
    // Add to selected votes
    setSelectedVotes(prev => ({
      ...prev,
      [positionId]: candidateId,
    }));
  };

  const handleSubmitPosition = async (positionId: string) => {
    const candidateId = selectedVotes[positionId];
    
    if (!candidateId) {
      setError('Please select a candidate before voting.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = onVote(positionId, candidateId);
    
    if (success) {
      setSubmittedPositions(prev => new Set([...prev, positionId]));
      // Remove from selected votes
      setSelectedVotes(prev => {
        const updated = { ...prev };
        delete updated[positionId];
        return updated;
      });
    } else {
      setError('Failed to cast vote. You may have already voted for this position.');
    }
    
    setIsSubmitting(false);
  };

  const handleSubmitAll = async () => {
    // Submit votes for all positions that haven't been voted on
    for (const position of election.positions) {
      if (!submittedPositions.has(position.id) && !hasVotedInPosition?.(position.id)) {
        const candidateId = selectedVotes[position.id];
        if (candidateId) {
          await handleSubmitPosition(position.id);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-3xl font-bold mb-2">{election.title}</h2>
        <p className="text-muted mb-6">{election.description}</p>

        <div className="space-y-8">
          {election.positions.map((position) => {
            const isVoted = submittedPositions.has(position.id) || hasVotedInPosition?.(position.id);
            const selectedCandidateId = selectedVotes[position.id];

            return (
              <div key={position.id} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold mb-1">{position.title}</h3>
                  {position.description && (
                    <p className="text-muted text-sm">{position.description}</p>
                  )}
                  {isVoted && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Voted
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {position.candidates.map((candidate) => (
                    <label
                      key={candidate.id}
                      className={`
                        relative block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${selectedCandidateId === candidate.id
                          ? 'border-primary bg-primary/5 shadow-apple scale-[1.02]'
                          : 'border-border hover:border-primary/50 hover:shadow-sm'
                        }
                        ${isVoted ? 'opacity-60 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="flex items-start gap-4">
                        {/* Candidate Picture */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden">
                            {candidate.picture ? (
                              <img
                                src={candidate.picture}
                                alt={candidate.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Candidate Info */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="radio"
                            name={`position-${position.id}`}
                            value={candidate.id}
                            checked={selectedCandidateId === candidate.id}
                            onChange={() => !isVoted && handlePositionVote(position.id, candidate.id)}
                            disabled={isVoted || isSubmitting}
                            className="sr-only"
                          />
                          <div className="font-semibold text-lg mb-1">{candidate.name}</div>
                          {candidate.description && (
                            <div className="text-sm text-muted line-clamp-2">{candidate.description}</div>
                          )}
                        </div>

                        {/* Radio indicator */}
                        <div className={`
                          flex-shrink-0 w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center
                          ${selectedCandidateId === candidate.id
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                          }
                          ${isVoted ? 'opacity-50' : ''}
                        `}>
                          {selectedCandidateId === candidate.id && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Submit button for this position */}
                {!isVoted && position.candidates.length > 0 && (
                  <button
                    onClick={() => handleSubmitPosition(position.id)}
                    disabled={!selectedCandidateId || isSubmitting}
                    className="btn btn-primary w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Recording...
                      </span>
                    ) : (
                      `Vote for ${position.title}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit all button - if multiple positions and some not voted */}
        {election.positions.length > 1 && !allPositionsVoted && (
          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting || Object.keys(selectedVotes).length === 0}
              className="btn btn-primary w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recording Votes...
                </span>
              ) : (
                `Cast All Votes (${Object.keys(selectedVotes).length} selected)`
              )}
            </button>
          </div>
        )}
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <strong>Voting Instructions:</strong> Select a candidate for each position and click &quot;Vote&quot; for that position.
            Your votes will be recorded immutably on the blockchain. Once cast, they cannot be changed.
          </div>
        </div>
      </div>
    </div>
  );
}