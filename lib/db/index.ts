// Export Prisma client and utilities
export { prisma, isDatabaseConfigured, testDatabaseConnection, disconnectDatabase } from './prisma';

// Export Prisma types for use in the app
export type {
  School,
  Election,
  Position,
  Candidate,
  Voter,
  VoteRecord,
  VerificationCode,
  BlockchainBlock,
} from '@prisma/client';
