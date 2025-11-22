// Candidate interface for positions
export interface Candidate {
  id: string;
  name: string;
  picture?: string; // Base64 encoded image or URL
  description?: string;
}

// Position/Role in an election
export interface Position {
  id: string;
  title: string; // e.g., "ASC President", "JEC Chairperson", "RA Chairperson"
  description?: string;
  candidates: Candidate[];
}

// Updated Election structure with positions
export interface Election {
  id: string;
  title: string;
  description: string;
  positions: Position[];
  schoolId?: string; // For multi-tenant support
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// Legacy VoteOption for backward compatibility
export interface VoteOption {
  id: string;
  label: string;
  description?: string;
}
