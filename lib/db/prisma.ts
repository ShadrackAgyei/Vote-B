import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: Pool };

// Create connection pool for PostgreSQL adapter
function createPrismaClient() {
  if (!isDatabaseConfigured()) {
    console.warn('[Database] Not configured - some features may be limited');
    // Return a dummy client that won't be used
    return new PrismaClient({
      adapter: new PrismaPg(new Pool({ connectionString: 'postgresql://localhost:5432/postgres' })),
    });
  }

  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  const pool = globalForPrisma.pool || new Pool({ connectionString });

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0);
}

// Gracefully handle database connection errors
export async function testDatabaseConnection(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    console.log('[Database] Not configured - using localStorage fallback');
    return false;
  }

  try {
    await prisma.$connect();
    console.log('[Database] Connected successfully');
    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    return false;
  }
}

// Disconnect from database (useful for cleanup)
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
