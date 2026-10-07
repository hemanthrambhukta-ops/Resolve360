import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

dotenv.config();

const { Client } = pg;

async function runMigration() {
  console.log('====================================================');
  console.log('   RESOLVE 360 - SUPABASE DATABASE MIGRATION RUNNER   ');
  console.log('====================================================');

  const migrationPath = path.resolve(process.cwd(), '../supabase/migrations/001_initial_schema.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found at: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  console.log(`Loaded migration SQL (${sql.length} characters) from: ${migrationPath}\n`);

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (dbUrl) {
    console.log('Found PostgreSQL connection string. Connecting to Supabase Cloud...');
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      console.log('Connected to PostgreSQL successfully. Executing migration script...');
      await client.query(sql);
      console.log('Schema migration executed successfully via direct PostgreSQL connection!');
      await client.end();
    } catch (err: any) {
      console.error('Migration execution error via pg:', err.message);
    }
  } else {
    console.log('NOTICE: Direct PostgreSQL connection string (DATABASE_URL) is not set.');
    console.log('You can execute the migration in one of two ways:');
    console.log('1. Open your Supabase Dashboard -> SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/kmmsbwhivscxmmyscvtz/sql/new');
    console.log('   Paste the contents of /supabase/migrations/001_initial_schema.sql and click RUN.');
    console.log('2. Provide DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.kmmsbwhivscxmmyscvtz.supabase.co:5432/postgres" in server/.env\n');
  }

  // Verify Supabase connection using Service Role key
  try {
    console.log('Verifying Supabase REST API & Storage Bucket...');
    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
    if (bucketError) {
      console.warn('Storage verification warning:', bucketError.message);
    } else {
      console.log(`Supabase Storage active. Buckets available:`, buckets.map(b => b.name).join(', '));
    }
  } catch (err: any) {
    console.error('Supabase verification error:', err.message);
  }

  console.log('\nMigration check complete. Ready for Resolve 360 operations.');
}

runMigration().catch(console.error);
