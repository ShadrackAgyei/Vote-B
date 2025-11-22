'use client';

import { useState, useEffect } from 'react';
import { SchoolManager } from '@/lib/schools';
import type { School } from '@/lib/schools';

interface SchoolSelectorProps {
  onSchoolSelect: (school: School | null) => void;
  selectedSchoolId?: string;
}

export default function SchoolSelector({ onSchoolSelect, selectedSchoolId }: SchoolSelectorProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolDomain, setSchoolDomain] = useState('');

  useEffect(() => {
    loadSchools();
    
    // Check for current school
    const currentSchool = SchoolManager.getCurrentSchool();
    if (currentSchool) {
      onSchoolSelect(currentSchool);
    }
  }, []);

  const loadSchools = () => {
    const allSchools = SchoolManager.getAllSchools();
    setSchools(allSchools);
  };

  const handleCreateSchool = () => {
    if (!schoolName.trim()) {
      alert('Please enter a school name');
      return;
    }

    const school = SchoolManager.createSchool(
      schoolName.trim(),
      schoolCode.trim() || undefined,
      schoolDomain.trim() || undefined
    );

    loadSchools();
    setShowCreateForm(false);
    setSchoolName('');
    setSchoolCode('');
    setSchoolDomain('');
    
    // Auto-select the new school
    SchoolManager.setCurrentSchool(school.id);
    onSchoolSelect(school);
  };

  const handleSchoolSelect = (schoolId: string) => {
    const school = SchoolManager.getSchool(schoolId);
    if (school) {
      SchoolManager.setCurrentSchool(schoolId);
      onSchoolSelect(school);
    }
  };

  const currentSchool = SchoolManager.getCurrentSchool();

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">School/Organization</h3>
          <p className="text-sm text-muted">
            Select or create a school to organize elections
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-ghost text-sm"
          type="button"
        >
          {showCreateForm ? 'Cancel' : '+ New School'}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">School Name *</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="input text-sm"
              placeholder="e.g., University of Technology"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">School Code (optional)</label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="input text-sm"
                placeholder="e.g., UOT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Domain (optional)</label>
              <input
                type="text"
                value={schoolDomain}
                onChange={(e) => setSchoolDomain(e.target.value)}
                className="input text-sm"
                placeholder="e.g., uot.edu"
              />
            </div>
          </div>
          <button
            onClick={handleCreateSchool}
            className="btn btn-primary text-sm w-full"
            type="button"
          >
            Create School
          </button>
        </div>
      )}

      {schools.length > 0 && (
        <div className="space-y-2">
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => handleSchoolSelect(school.id)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                currentSchool?.id === school.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              type="button"
            >
              <div className="font-semibold">{school.name}</div>
              {school.code && (
                <div className="text-xs text-muted">Code: {school.code}</div>
              )}
              {school.domain && (
                <div className="text-xs text-muted">Domain: @{school.domain}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {currentSchool && (
        <div className="mt-4 p-3 bg-primary/10 rounded-xl">
          <div className="text-sm font-medium text-primary mb-1">Currently Selected</div>
          <div className="font-semibold">{currentSchool.name}</div>
        </div>
      )}
    </div>
  );
}
