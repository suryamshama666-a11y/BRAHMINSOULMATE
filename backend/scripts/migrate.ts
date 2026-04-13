import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { argv } from 'process';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...');
    
    // Get current migration status
    const { data: status, error } = await supabase.rpc('migration_status');
    
    if (error) {
      console.error('❌ Failed to get migration status:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Migration status retrieved successfully');
    
    // Run pending migrations
    const { error: runError } = await supabase.rpc('run_migrations');
    
    if (runError) {
      console.error('❌ Failed to run migrations:', runError.message);
      process.exit(1);
    }
    
    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function rollbackMigrations() {
  try {
    console.log('⏪ Rolling back last migration...');
    
    const { error } = await supabase.rpc('rollback_migration');
    
    if (error) {
      console.error('❌ Failed to rollback migration:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Migration rolled back successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
}

async function getMigrationStatus() {
  try {
    console.log('📊 Checking migration status...');
    
    const { data, error } = await supabase.rpc('migration_status');
    
    if (error) {
      console.error('❌ Failed to get migration status:', error.message);
      process.exit(1);
    }
    
    console.log('📋 Current Migration Status:');
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('❌ Status check failed:', error);
    process.exit(1);
  }
}

// Main execution
const command = argv[2];

switch (command) {
  case 'up':
    await runMigrations();
    break;
  case 'down':
    await rollbackMigrations();
    break;
  case 'status':
    await getMigrationStatus();
    break;
  default:
    console.log('Usage: npm run migrate <up|down|status>');
    console.log('  up      - Run pending migrations');
    console.log('  down    - Rollback last migration');
    console.log('  status  - Check current migration status');
    process.exit(1);
}