'use client';

import { useState, useEffect } from 'react';
import { VotingSystem } from '@/lib/voting';
import { Storage } from '@/lib/storage';
import { AdminAuth } from '@/lib/auth';
import { SchoolManager } from '@/lib/schools';
import type { StoredElection } from '@/lib/storage';
import type { Election, Position } from '@/lib/voting';
import type { School } from '@/lib/schools';
import Link from 'next/link';
import AdminLogin from '@/components/AdminLogin';
import PositionEditor from '@/components/admin/PositionEditor';
import SchoolSelector from '@/components/admin/SchoolSelector';

function AdminDashboard() {
  const [votingSystem] = useState(() => new VotingSystem());
  const [elections, setElections] = useState<StoredElection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [positions, setPositions] = useState<Position[]>([
    {
      id: 'position-1',
      title: '',
      description: '',
      candidates: [{ id: 'candidate-1', name: '', description: '' }],
    },
  ]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const currentSchool = SchoolManager.getCurrentSchool();
    setSelectedSchool(currentSchool);
    loadElections(currentSchool?.id);
  }, []);

  const loadElections = (schoolId?: string) => {
    const stored = Storage.getAllElections(schoolId);
    setElections(stored);

    // Load elections into voting system
    stored.forEach(storedElection => {
      // Migrate legacy elections if needed
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

    // Set current election if exists
    const currentId = Storage.getCurrentElectionId();
    if (currentId) {
      votingSystem.setCurrentElection(currentId);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPositions([
      {
        id: 'position-1',
        title: '',
        description: '',
        candidates: [{ id: 'candidate-1', name: '', description: '' }],
      },
    ]);
    setStartDate('');
    setEndDate('');
    setShowForm(false);
    setIsEditing(null);
  };

  const addPosition = () => {
    setPositions([
      ...positions,
      {
        id: `position-${Date.now()}`,
        title: '',
        description: '',
        candidates: [{ id: `candidate-${Date.now()}`, name: '', description: '' }],
      },
    ]);
  };

  const removePosition = (positionId: string) => {
    if (positions.length > 1) {
      setPositions(positions.filter(p => p.id !== positionId));
    }
  };

  const updatePosition = (positionId: string, updatedPosition: Position) => {
    setPositions(positions.map(p => (p.id === positionId ? updatedPosition : p)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert('Please enter an election title');
      return;
    }

    if (!selectedSchool) {
      alert('Please select a school first');
      return;
    }

    if (positions.length === 0) {
      alert('Please add at least one position');
      return;
    }

    // Validate positions and candidates
    for (const position of positions) {
      if (!position.title.trim()) {
        alert(`Please enter a title for all positions`);
        return;
      }

      if (position.candidates.length < 1) {
        alert(`Position "${position.title}" must have at least one candidate`);
        return;
      }

      for (const candidate of position.candidates) {
        if (!candidate.name.trim()) {
          alert(`Please enter a name for all candidates in "${position.title}"`);
          return;
        }
      }
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
      positions: positions.map(p => ({
        ...p,
        title: p.title.trim(),
        description: p.description?.trim() || undefined,
        candidates: p.candidates.map(c => ({
          ...c,
          name: c.name.trim(),
          description: c.description?.trim() || undefined,
        })),
      })),
      schoolId: selectedSchool.id,
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
      election.positions,
      election.startDate,
      election.endDate,
      election.schoolId
    );

    // Set as current if it's the first one
    if (!Storage.getCurrentElectionId()) {
      Storage.setCurrentElection(electionId);
      votingSystem.setCurrentElection(electionId);
    }

    loadElections(selectedSchool.id);
    resetForm();
  };

  const handleEdit = (election: StoredElection) => {
    const migrated = Storage.migrateLegacyElection(election);
    
    setTitle(migrated.title);
    setDescription(migrated.description);
    setPositions(migrated.positions || []);
    setStartDate(new Date(migrated.startDate).toISOString().slice(0, 16));
    setEndDate(new Date(migrated.endDate).toISOString().slice(0, 16));
    setIsEditing(migrated.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this election? This cannot be undone.')) {
      Storage.deleteElection(id);
      loadElections(selectedSchool?.id);
    }
  };

  const handleSetCurrent = (id: string) => {
    Storage.setCurrentElection(id);
    votingSystem.setCurrentElection(id);
    loadElections(selectedSchool?.id);
  };

  const handleLogout = () => {
    AdminAuth.logout();
    window.location.reload();
  };

  const handleSchoolSelect = (school: School | null) => {
    setSelectedSchool(school);
    loadElections(school?.id);
    if (!school && showForm) {
      setShowForm(false);
      resetForm();
    }
  };

  // Extend session on activity
  useEffect(() => {
    const interval = setInterval(() => {
      AdminAuth.extendSession();
    }, 60 * 1000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const currentSchoolId = selectedSchool?.id;
  const filteredElections = elections.filter(e => !currentSchoolId || e.schoolId === currentSchoolId);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted">Manage elections and voter registration</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="btn btn-ghost">
              ← Back to Voting
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-ghost text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <SchoolSelector 
          onSchoolSelect={handleSchoolSelect}
          selectedSchoolId={currentSchoolId}
        />

        {!selectedSchool ? (
          <div className="card text-center py-12 text-muted">
            Please select or create a school to manage elections
          </div>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className="btn btn-primary"
                disabled={!selectedSchool}
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
                    placeholder="e.g., Student Council Elections 2025"
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
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium">Positions & Candidates *</label>
                    <button
                      type="button"
                      onClick={addPosition}
                      className="text-sm btn btn-ghost"
                    >
                      + Add Position
                    </button>
                  </div>
                  <div className="space-y-6">
                    {positions.map((position, index) => (
                      <PositionEditor
                        key={position.id}
                        position={position}
                        onChange={(updated) => updatePosition(position.id, updated)}
                        onRemove={() => removePosition(position.id)}
                        canRemove={positions.length > 1}
                      />
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
              <h2 className="text-2xl font-semibold mb-4">
                Elections for {selectedSchool.name}
              </h2>
              {filteredElections.length === 0 ? (
                <div className="card text-center py-12 text-muted">
                  No elections created yet. Create your first election above.
                </div>
              ) : (
                filteredElections.map((election) => {
                  const migrated = Storage.migrateLegacyElection(election);
                  const isActive = new Date() >= new Date(election.startDate) && 
                                  new Date() <= new Date(election.endDate);
                  const isCurrent = Storage.getCurrentElectionId() === election.id;
                  const voterCount = Storage.getElectionVoters(election.id, currentSchoolId).length;
                  const totalPositions = migrated.positions?.length || 0;
                  const totalCandidates = migrated.positions?.reduce((sum, p) => sum + p.candidates.length, 0) || 0;

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
                              {totalPositions} {totalPositions === 1 ? 'position' : 'positions'}
                            </span>
                            <span>
                              {totalCandidates} {totalCandidates === 1 ? 'candidate' : 'candidates'}
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
          </>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize admin password
    AdminAuth.initializePassword();
    
    // Check authentication
    const checkAuth = () => {
      const authenticated = AdminAuth.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsInitializing(false);
    };

    checkAuth();

    // Check authentication periodically
    const interval = setInterval(checkAuth, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (isInitializing) {
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

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}