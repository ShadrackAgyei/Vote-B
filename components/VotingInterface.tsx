'use client';

import { useState } from 'react';
import { Election } from '@/lib/voting';

interface VotingInterfaceProps {
  election: Election | null;
  onVote: (optionId: string) => boolean;
}

export default function VotingInterface({ election, onVote }: VotingInterfaceProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!election) {
    return (
      <div className="card text-center">
        <p className="text-muted">No active election found.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedOption) {
      setError('Please select an option before voting.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = onVote(selectedOption);
    
    if (!success) {
      setError('Failed to cast vote. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-3xl font-bold mb-2">{election.title}</h2>
        <p className="text-muted mb-6">{election.description}</p>

        <div className="space-y-3 mb-6">
          {election.options.map((option) => (
            <label
              key={option.id}
              className={`
                block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${selectedOption === option.id
                  ? 'border-primary bg-primary/5 shadow-apple'
                  : 'border-border hover:border-primary/50 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="vote"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    setError(null);
                  }}
                  className="mt-1 w-5 h-5 text-primary focus:ring-primary focus:ring-2"
                />
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-muted">{option.description}</div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Recording to blockchain...
            </span>
          ) : (
            'Cast Vote'
          )}
        </button>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <strong>Security Note:</strong> Your vote will be recorded immutably on the blockchain. Once cast, it cannot be changed or deleted.
          </div>
        </div>
      </div>
    </div>
  );
}
