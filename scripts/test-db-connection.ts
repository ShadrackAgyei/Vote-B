// Test database connection
import { config } from 'dotenv';
import { Pool } from 'pg';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function main() {
  console.log('🔌 Testing database connection...\n');

  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

  if (!connectionString) {
    console.log('❌ No DATABASE_URL found in .env.local');
    process.exit(1);
  }

  console.log('📡 Connecting to:', connectionString.replace(/:([^:@]+)@/, ':***@'));

  try {
    const pool = new Pool({ connectionString });
    const client = await pool.connect();

    console.log('✅ Database connection successful!\n');

    // Test a simple query
    console.log('📊 Testing query: Listing tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`   Found ${result.rows.length} tables:`);
    result.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n🎉 All tests passed! Database is ready to use.');

    client.release();
    await pool.end();
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

main();
