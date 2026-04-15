#!/usr/bin/env node

/**
 * Push Database Migrations to Supabase
 * Project: dotpqqfcamimrsdnvzor
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const SUPABASE_PROJECT_REF = 'dotpqqfcamimrsdnvzor';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

// Read migration file
const migrationPath = path.join(__dirname, 'backend', 'src', 'migrations', '20260413_fix_schema_consistency.sql');

console.log('🚀 Supabase Migration Push');
console.log('==========================\n');

// Check if migration file exists
if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found:', migrationPath);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration file loaded');
console.log(`📊 SQL size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

// Get service role key from environment or prompt
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY === 'your_service_role_key_here') {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set!\n');
  console.log('Please set your Supabase Service Role Key:');
  console.log('');
  console.log('Windows (PowerShell):');
  console.log('  $env:SUPABASE_SERVICE_ROLE_KEY="your_key_here"');
  console.log('  node push-to-supabase.js');
  console.log('');
  console.log('Or get it from:');
  console.log(`  https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/settings/api`);
  console.log('');
  process.exit(1);
}

console.log('🔑 Service Role Key found');
console.log(`🌐 Target: ${SUPABASE_URL}\n`);

// Execute SQL via Supabase REST API
function executeSQLQuery(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${SUPABASE_PROJECT_REF}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: responseData });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Alternative: Use psql connection string
async function pushViaPSQL() {
  console.log('📝 Instructions for manual migration:\n');
  console.log('1. Go to Supabase SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new\n`);
  console.log('2. Copy the SQL from:');
  console.log(`   ${migrationPath}\n`);
  console.log('3. Paste into the SQL Editor');
  console.log('4. Click "Run" to execute\n');
  
  // Also save a formatted version
  const outputPath = path.join(__dirname, 'migration-to-run.sql');
  fs.writeFileSync(outputPath, migrationSQL);
  console.log(`✅ Migration SQL saved to: ${outputPath}`);
  console.log('   You can copy this file content to Supabase SQL Editor\n');
}

// Main execution
async function main() {
  try {
    console.log('⚡ Attempting to push migration...\n');
    
    // For now, provide manual instructions since REST API might not have exec_sql
    await pushViaPSQL();
    
    console.log('✨ Next steps:');
    console.log('1. Open the Supabase SQL Editor (link above)');
    console.log('2. Run the migration SQL');
    console.log('3. Verify tables are created');
    console.log('4. Update your .env.local files with Supabase credentials');
    console.log('5. Start your app: npm run dev\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Use manual migration method above');
    process.exit(1);
  }
}

main();
