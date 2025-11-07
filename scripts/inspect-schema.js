import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTables() {
  console.log('🔍 Inspecting database schema...\n');
  
  // List of tables to check
  const tables = ['profiles', 'events', 'matches', 'messages'];
  
  for (const table of tables) {
    console.log(`📋 Table: ${table}`);
    console.log('─'.repeat(50));
    
    try {
      // Try to get one row to see the structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error accessing ${table}:`, error.message);
      } else {
        if (data && data.length > 0) {
          console.log('✅ Table exists with columns:');
          const columns = Object.keys(data[0]);
          columns.forEach(col => console.log(`   • ${col}`));
          console.log(`📊 Current rows: ${data.length > 0 ? 'Has data' : 'Empty'}`);
        } else {
          console.log('✅ Table exists but is empty');
          // Try to insert a test row to see what columns are expected
          const testResult = await supabase
            .from(table)
            .insert({})
            .select();
          
          if (testResult.error) {
            console.log('💡 Required columns (from error):');
            console.log(`   ${testResult.error.message}`);
          }
        }
      }
    } catch (err) {
      console.log(`❌ Exception for ${table}:`, err.message);
    }
    
    console.log('\n');
  }
}

async function main() {
  console.log('🚀 Database Schema Inspector');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('\n');
  
  try {
    await inspectTables();
    
    console.log('🎯 Next Steps:');
    console.log('1. Check the column names above');
    console.log('2. Update the populate script to match your schema');
    console.log('3. Or create the missing columns in your database');
    
  } catch (error) {
    console.error('❌ Error during inspection:', error);
  }
}

main();
