'use client';

import { Election } from '@/lib/voting';

interface ResultsProps {
  election: Election | null;
  results: Record<string, number>;
  totalVotes: number;
  isChainValid: boolean;
}

export default function Results({ election, results, totalVotes, isChainValid }: ResultsProps) {
  if (!election) return null;

  const maxVotes = Math.max(...Object.values(results), 1);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-2">Election Results</h2>
        <p className="text-muted mb-6">{election.title}</p>

        <div className="space-y-6 mb-6">
          {election.options.map((option) => {
            const votes = results[option.id] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const barWidth = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-muted">{option.description}</div>
                    )}
                  </div>
                  <div className="text-right">
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
            );
          })}
        </div>

        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Total Votes</span>
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
