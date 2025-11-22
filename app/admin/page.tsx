'use client';

import { useState, useEffect } from 'react';
import { VotingSystem } from '@/lib/voting';
import { Storage } from '@/lib/storage';
import type { StoredElection } from '@/lib/storage';
import { Election, VoteOption } from '@/lib/voting';
import Link from 'next/link';

export default function AdminPage() {
  const [votingSystem] = useState(() => new VotingSystem());
  const [elections, setElections] = useState<StoredElection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<VoteOption[]>([
    { id: 'option1', label: '', description: '' },
  ]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = () => {
    const stored = Storage.getAllElections();
    setElections(stored);

    // Load elections into voting system
    stored.forEach(storedElection => {
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

    // Set current election if exists
    const currentId = Storage.getCurrentElectionId();
    if (currentId) {
      votingSystem.setCurrentElection(currentId);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOptions([{ id: 'option1', label: '', description: '' }]);
    setStartDate('');
    setEndDate('');
    setShowForm(false);
    setIsEditing(null);
  };

  const addOption = () => {
    setOptions([
      ...options,
      { id: `option${Date.now()}`, label: '', description: '' },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: 'label' | 'description', value: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert('Please enter an election title');
      return;
    }

    if (options.length < 2) {
      alert('Please add at least 2 voting options');
      return;
    }

    if (options.some(opt => !opt.label.trim())) {
      alert('All options must have a label');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please set start and end dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert('End date must be after start date');
      return;
    }

    const electionId = isEditing || `election-${Date.now()}`;
    
    const election: Election = {
      id: electionId,
      title: title.trim(),
      description: description.trim(),
      options: options.map(opt => ({
        ...opt,
        label: opt.label.trim(),
        description: opt.description?.trim() || undefined,
      })),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: new Date() >= new Date(startDate) && new Date() <= new Date(endDate),
    };

    // Save to storage
    Storage.saveElection(election);
    
    // Add to voting system
    votingSystem.createElection(
      election.id,
      election.title,
      election.description,
      election.options,
      election.startDate,
      election.endDate
    );

    // Set as current if it's the first one
    if (!Storage.getCurrentElectionId()) {
      Storage.setCurrentElection(electionId);
      votingSystem.setCurrentElection(electionId);
    }

    loadElections();
    resetForm();
  };

  const handleEdit = (election: StoredElection) => {
    setTitle(election.title);
    setDescription(election.description);
    setOptions(election.options);
    setStartDate(new Date(election.startDate).toISOString().slice(0, 16));
    setEndDate(new Date(election.endDate).toISOString().slice(0, 16));
    setIsEditing(election.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this election? This cannot be undone.')) {
      Storage.deleteElection(id);
      loadElections();
    }
  };

  const handleSetCurrent = (id: string) => {
    Storage.setCurrentElection(id);
    votingSystem.setCurrentElection(id);
    loadElections();
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted">Manage elections and voter registration</p>
          </div>
          <Link href="/" className="btn btn-ghost">
            ← Back to Voting
          </Link>
        </div>

        <div className="mb-6">
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Create New Election'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 space-y-6">
            <h2 className="text-2xl font-semibold">
              {isEditing ? 'Edit Election' : 'Create New Election'}
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">Election Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g., Student Council President 2025"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="Describe the election..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Voting Options *</label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm btn btn-ghost"
                >
                  + Add Option
                </button>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.id} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        className="input"
                        placeholder="Option label"
                        required
                      />
                      <input
                        type="text"
                        value={option.description || ''}
                        onChange={(e) => updateOption(index, 'description', e.target.value)}
                        className="input"
                        placeholder="Option description (optional)"
                      />
                    </div>
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              {isEditing ? 'Update Election' : 'Create Election'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Existing Elections</h2>
          {elections.length === 0 ? (
            <div className="card text-center py-12 text-muted">
              No elections created yet. Create your first election above.
            </div>
          ) : (
            elections.map((election) => {
              const isActive = new Date() >= new Date(election.startDate) && 
                              new Date() <= new Date(election.endDate);
              const isCurrent = Storage.getCurrentElectionId() === election.id;
              const voterCount = Storage.getElectionVoters(election.id).length;

              return (
                <div
                  key={election.id}
                  className={`card ${isCurrent ? 'border-2 border-primary' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{election.title}</h3>
                        {isCurrent && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            Active
                          </span>
                        )}
                        {isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-muted mb-3">{election.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted">
                        <span>
                          {election.options.length} {election.options.length === 1 ? 'option' : 'options'}
                        </span>
                        <span>{voterCount} registered {voterCount === 1 ? 'voter' : 'voters'}</span>
                        <span>
                          {new Date(election.startDate).toLocaleDateString()} -{' '}
                          {new Date(election.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!isCurrent && (
                        <button
                          onClick={() => handleSetCurrent(election.id)}
                          className="btn btn-ghost text-sm"
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(election)}
                        className="btn btn-ghost text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(election.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
