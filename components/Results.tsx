'use client';

import { Election } from '@/lib/voting';

interface ResultsProps {
  election: Election | null;
  results: Record<string, Record<string, number>>; // positionId -> candidateId -> votes
  totalVotes: number;
  isChainValid: boolean;
}

export default function Results({ election, results, totalVotes, isChainValid }: ResultsProps) {
  if (!election) return null;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-2">Election Results</h2>
        <p className="text-muted mb-6">{election.title}</p>

        <div className="space-y-8">
          {election.positions.map((position) => {
            const positionResults = results[position.id] || {};
            const positionVotes = Object.values(positionResults).reduce((sum, votes) => sum + votes, 0);
            const maxVotes = Math.max(...Object.values(positionResults), 1);

            return (
              <div key={position.id} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-1">{position.title}</h3>
                  {position.description && (
                    <p className="text-sm text-muted">{position.description}</p>
                  )}
                  <div className="text-sm text-muted mt-2">
                    {positionVotes} {positionVotes === 1 ? 'vote' : 'votes'} cast for this position
                  </div>
                </div>

                <div className="space-y-4">
                  {position.candidates.map((candidate) => {
                    const votes = positionResults[candidate.id] || 0;
                    const percentage = positionVotes > 0 ? (votes / positionVotes) * 100 : 0;
                    const barWidth = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;

                    return (
                      <div key={candidate.id} className="space-y-2">
                        <div className="flex items-center gap-4">
                          {/* Candidate Picture */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden">
                              {candidate.picture ? (
                                <img
                                  src={candidate.picture}
                                  alt={candidate.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Candidate Info & Results */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-lg">{candidate.name}</div>
                                {candidate.description && (
                                  <div className="text-sm text-muted line-clamp-1">{candidate.description}</div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-bold text-xl">{votes}</div>
                                <div className="text-sm text-muted">{percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 mt-6 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Total Votes Cast</span>
            <span className="font-semibold text-lg">{totalVotes}</span>
          </div>
        </div>
      </div>

      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isChainValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="flex-1">
            <div className="font-semibold text-sm mb-1">
              Blockchain Status: {isChainValid ? 'Valid' : 'Invalid'}
            </div>
            <div className="text-xs text-muted">
              {isChainValid
                ? 'All blocks are valid and the chain integrity is maintained.'
                : 'Warning: Chain integrity check failed.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}