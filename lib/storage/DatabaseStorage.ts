import { prisma, isDatabaseConfigured } from '../db';
import { StoredElection, RegisteredVoter } from './Storage';
import { Election, Position } from '../voting';

/**
 * Database storage layer using Prisma/Supabase
 * Mirrors the Storage class API but uses PostgreSQL instead of localStorage
 */
export class DatabaseStorage {
  // Check if database is available
  static isAvailable(): boolean {
    return isDatabaseConfigured();
  }

  // ============================================================================
  // ELECTIONS
  // ============================================================================

  static async saveElection(election: Election): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      // First, ensure school exists if schoolId is provided
      if (election.schoolId) {
        await prisma.school.upsert({
          where: { id: election.schoolId },
          update: {},
          create: {
            id: election.schoolId,
            name: 'Default School', // Will be updated by school management
          },
        });
      }

      // Upsert the election
      await prisma.election.upsert({
        where: { id: election.id },
        update: {
          title: election.title,
          description: election.description || '',
          startDate: election.startDate,
          endDate: election.endDate,
          isActive: election.isActive ?? false,
          updatedAt: new Date(),
        },
        create: {
          id: election.id,
          schoolId: election.schoolId || null,
          title: election.title,
          description: election.description || '',
          startDate: election.startDate,
          endDate: election.endDate,
          isActive: election.isActive ?? false,
        },
      });

      // Save positions and candidates
      for (const position of election.positions) {
        await prisma.position.upsert({
          where: { id: position.id },
          update: {
            title: position.title,
            description: position.description || '',
            displayOrder: election.positions.indexOf(position),
          },
          create: {
            id: position.id,
            electionId: election.id,
            title: position.title,
            description: position.description || '',
            displayOrder: election.positions.indexOf(position),
          },
        });

        // Save candidates for this position
        for (const candidate of position.candidates) {
          await prisma.candidate.upsert({
            where: { id: candidate.id },
            update: {
              name: candidate.name,
              description: candidate.description || '',
              pictureUrl: candidate.picture || null,
            },
            create: {
              id: candidate.id,
              positionId: position.id,
              name: candidate.name,
              description: candidate.description || '',
              pictureUrl: candidate.picture || null,
            },
          });
        }
      }

      console.log(`[DB] Saved election: ${election.title}`);
    } catch (error) {
      console.error('[DB] Error saving election:', error);
      throw error;
    }
  }

  static async getAllElections(schoolId?: string): Promise<StoredElection[]> {
    if (!this.isAvailable()) return [];

    try {
      const elections = await prisma.election.findMany({
        where: schoolId ? { schoolId } : undefined,
        include: {
          positions: {
            include: {
              candidates: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return elections.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        positions: e.positions.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description || undefined,
          candidates: p.candidates.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description || undefined,
            picture: c.pictureUrl || undefined,
          })),
        })),
        schoolId: e.schoolId || undefined,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        createdAt: e.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error('[DB] Error fetching elections:', error);
      return [];
    }
  }

  static async getElection(id: string): Promise<StoredElection | null> {
    if (!this.isAvailable()) return null;

    try {
      const election = await prisma.election.findUnique({
        where: { id },
        include: {
          positions: {
            include: {
              candidates: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      if (!election) return null;

      return {
        id: election.id,
        title: election.title,
        description: election.description || '',
        positions: election.positions.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description || undefined,
          candidates: p.candidates.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description || undefined,
            picture: c.pictureUrl || undefined,
          })),
        })),
        schoolId: election.schoolId || undefined,
        startDate: election.startDate.toISOString(),
        endDate: election.endDate.toISOString(),
        createdAt: election.createdAt.toISOString(),
      };
    } catch (error) {
      console.error('[DB] Error fetching election:', error);
      return null;
    }
  }

  static async deleteElection(id: string): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await prisma.election.delete({
        where: { id },
      });
      console.log(`[DB] Deleted election: ${id}`);
    } catch (error) {
      console.error('[DB] Error deleting election:', error);
    }
  }

  static async setCurrentElection(id: string | null): Promise<void> {
    // This is stored in localStorage for now, as it's UI state
    // Could move to database later if needed
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('vote_b_current_election', id);
      } else {
        localStorage.removeItem('vote_b_current_election');
      }
    }
  }

  static async getCurrentElectionId(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('vote_b_current_election');
  }

  // ============================================================================
  // VOTERS
  // ============================================================================

  static async registerVoter(
    email: string,
    electionId: string,
    schoolId?: string
  ): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check if already registered
      const existing = await prisma.voter.findUnique({
        where: {
          email_electionId: {
            email: normalizedEmail,
            electionId,
          },
        },
      });

      if (existing) {
        console.log(`[DB] Voter already registered: ${normalizedEmail}`);
        return false;
      }

      // Register new voter
      await prisma.voter.create({
        data: {
          email: normalizedEmail,
          electionId,
          schoolId: schoolId || null,
          isVerified: false,
        },
      });

      console.log(`[DB] Registered voter: ${normalizedEmail}`);
      return true;
    } catch (error) {
      console.error('[DB] Error registering voter:', error);
      return false;
    }
  }

  static async getAllVoters(schoolId?: string): Promise<RegisteredVoter[]> {
    if (!this.isAvailable()) return [];

    try {
      const voters = await prisma.voter.findMany({
        where: schoolId ? { schoolId } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return voters.map((v) => ({
        email: v.email,
        electionId: v.electionId,
        schoolId: v.schoolId || undefined,
        registeredAt: v.createdAt.getTime(),
        verified: v.isVerified,
      }));
    } catch (error) {
      console.error('[DB] Error fetching voters:', error);
      return [];
    }
  }

  static async getElectionVoters(
    electionId: string,
    schoolId?: string
  ): Promise<RegisteredVoter[]> {
    if (!this.isAvailable()) return [];

    try {
      const voters = await prisma.voter.findMany({
        where: {
          electionId,
          ...(schoolId && { schoolId }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return voters.map((v) => ({
        email: v.email,
        electionId: v.electionId,
        schoolId: v.schoolId || undefined,
        registeredAt: v.createdAt.getTime(),
        verified: v.isVerified,
      }));
    } catch (error) {
      console.error('[DB] Error fetching election voters:', error);
      return [];
    }
  }

  static async isVoterRegistered(
    email: string,
    electionId: string,
    schoolId?: string
  ): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const voter = await prisma.voter.findUnique({
        where: {
          email_electionId: {
            email: normalizedEmail,
            electionId,
          },
        },
      });

      // Check school match if provided
      if (voter && schoolId && voter.schoolId !== schoolId) {
        return false;
      }

      return !!voter;
    } catch (error) {
      console.error('[DB] Error checking voter registration:', error);
      return false;
    }
  }

  static async verifyVoter(
    email: string,
    electionId: string,
    schoolId?: string
  ): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      const normalizedEmail = email.toLowerCase().trim();

      await prisma.voter.update({
        where: {
          email_electionId: {
            email: normalizedEmail,
            electionId,
          },
        },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      console.log(`[DB] Verified voter: ${normalizedEmail}`);
    } catch (error) {
      console.error('[DB] Error verifying voter:', error);
    }
  }

  static async isVoterVerified(
    email: string,
    electionId: string,
    schoolId?: string
  ): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const voter = await prisma.voter.findUnique({
        where: {
          email_electionId: {
            email: normalizedEmail,
            electionId,
          },
        },
      });

      // Check school match if provided
      if (voter && schoolId && voter.schoolId !== schoolId) {
        return false;
      }

      return voter?.isVerified ?? false;
    } catch (error) {
      console.error('[DB] Error checking voter verification:', error);
      return false;
    }
  }
}
