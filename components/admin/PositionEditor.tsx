'use client';

import { useState } from 'react';
import { Position, Candidate } from '@/lib/voting';
import { convertFileToBase64, validateImageFile, compressImage } from '@/lib/utils/image';

interface PositionEditorProps {
  position: Position;
  onChange: (position: Position) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function PositionEditor({ position, onChange, onRemove, canRemove }: PositionEditorProps) {
  const handlePositionChange = (field: 'title' | 'description', value: string) => {
    onChange({
      ...position,
      [field]: value,
    });
  };

  const addCandidate = () => {
    onChange({
      ...position,
      candidates: [
        ...position.candidates,
        {
          id: `candidate-${Date.now()}`,
          name: '',
          description: '',
        },
      ],
    });
  };

  const removeCandidate = (candidateId: string) => {
    onChange({
      ...position,
      candidates: position.candidates.filter(c => c.id !== candidateId),
    });
  };

  const updateCandidate = (candidateId: string, field: 'name' | 'description', value: string) => {
    onChange({
      ...position,
      candidates: position.candidates.map(c =>
        c.id === candidateId ? { ...c, [field]: value } : c
      ),
    });
  };

  const handleImageUpload = async (candidateId: string, file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Convert to base64
      let base64 = await convertFileToBase64(file);
      
      // Compress image
      base64 = await compressImage(base64, 400, 0.8);

      // Update candidate with picture
      onChange({
        ...position,
        candidates: position.candidates.map(c =>
          c.id === candidateId ? { ...c, picture: base64 } : c
        ),
      });
    } catch (error) {
      alert('Failed to upload image. Please try again.');
      console.error(error);
    }
  };

  const removeImage = (candidateId: string) => {
    onChange({
      ...position,
      candidates: position.candidates.map(c =>
        c.id === candidateId ? { ...c, picture: undefined } : c
      ),
    });
  };

  return (
    <div className="card border-2 border-dashed border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Position Title *
            </label>
            <input
              type="text"
              value={position.title}
              onChange={(e) => handlePositionChange('title', e.target.value)}
              className="input"
              placeholder="e.g., ASC President, JEC Chairperson"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Position Description (optional)
            </label>
            <textarea
              value={position.description || ''}
              onChange={(e) => handlePositionChange('description', e.target.value)}
              className="input min-h-[60px] resize-none"
              placeholder="Describe the position..."
            />
          </div>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="ml-4 text-red-500 hover:text-red-700 p-2"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">Candidates *</label>
          <button
            type="button"
            onClick={addCandidate}
            className="text-sm btn btn-ghost"
          >
            + Add Candidate
          </button>
        </div>

        <div className="space-y-4">
          {position.candidates.map((candidate, index) => (
            <div key={candidate.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex items-start gap-4">
                {/* Candidate Picture */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center">
                    {candidate.picture ? (
                      <div className="relative w-full h-full">
                        <img
                          src={candidate.picture}
                          alt={candidate.name || 'Candidate'}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(candidate.id)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-2">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <label className="mt-2 block">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(candidate.id, file);
                        }
                      }}
                      className="hidden"
                    />
                    <span className="text-xs btn btn-ghost w-full cursor-pointer">
                      Upload Photo
                    </span>
                  </label>
                </div>

                {/* Candidate Info */}
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Candidate Name *</label>
                    <input
                      type="text"
                      value={candidate.name}
                      onChange={(e) => updateCandidate(candidate.id, 'name', e.target.value)}
                      className="input text-sm"
                      placeholder="Enter candidate name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Description (optional)</label>
                    <input
                      type="text"
                      value={candidate.description || ''}
                      onChange={(e) => updateCandidate(candidate.id, 'description', e.target.value)}
                      className="input text-sm"
                      placeholder="Brief description or slogan"
                    />
                  </div>
                </div>

                {/* Remove Candidate */}
                {position.candidates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCandidate(candidate.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {position.candidates.length === 0 && (
            <div className="text-center py-6 text-muted text-sm">
              No candidates added. Add at least one candidate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
