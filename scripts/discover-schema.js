import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function discoverTableSchema() {
  console.log('🔍 Discovering actual database schema...\n');
  
  // Method 1: Query information_schema to get column details
  console.log('📋 Method 1: Querying information_schema...');
  try {
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' });
    
    if (error) {
      console.log('❌ RPC call failed:', error.message);
    } else {
      console.log('✅ Schema from RPC:', data);
    }
  } catch (err) {
    console.log('❌ RPC exception:', err.message);
  }
  
  // Method 2: Direct SQL query to information_schema
  console.log('\n📋 Method 2: Direct SQL query...');
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('❌ Information schema query failed:', error.message);
    } else {
      console.log('✅ Columns from information_schema:');
      data.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
      });
    }
  } catch (err) {
    console.log('❌ Information schema exception:', err.message);
  }
  
  // Method 3: Try to get schema from PostgREST introspection
  console.log('\n📋 Method 3: PostgREST introspection...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (response.ok) {
      const schema = await response.text();
      console.log('✅ PostgREST schema response received');
      
      // Look for profiles table definition
      if (schema.includes('profiles')) {
        const profilesSection = schema.split('profiles')[1]?.split('\n')[0];
        console.log('   Profiles section:', profilesSection);
      }
    } else {
      console.log('❌ PostgREST introspection failed:', response.status);
    }
  } catch (err) {
    console.log('❌ PostgREST exception:', err.message);
  }
  
  // Method 4: Try a raw SQL query
  console.log('\n📋 Method 4: Raw SQL query...');
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT column_name, data_type, is_nullable 
              FROM information_schema.columns 
              WHERE table_name = 'profiles' 
              AND table_schema = 'public' 
              ORDER BY ordinal_position;`
      });
    
    if (error) {
      console.log('❌ Raw SQL failed:', error.message);
    } else {
      console.log('✅ Raw SQL result:', data);
    }
  } catch (err) {
    console.log('❌ Raw SQL exception:', err.message);
  }
  
  // Method 5: Try to describe the table structure by attempting inserts
  console.log('\n📋 Method 5: Reverse engineering from error messages...');
  
  const testColumns = [
    'id', 'user_id', 'created_at', 'updated_at', 'name', 'age', 'gender', 
    'bio', 'location', 'religion', 'caste', 'subcaste', 'marital_status',
    'height', 'education', 'employment', 'subscription_type', 'verified',
    'last_active', 'images', 'interests', 'languages', 'preferences',
    'horoscope', 'family', 'visibility', 'country'
  ];
  
  const workingColumns = [];
  
  for (const column of testColumns) {
    try {
      const testData = { [column]: column === 'user_id' ? '123e4567-e89b-12d3-a456-426614174000' : 'test' };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(testData)
        .select();
      
      if (error) {
        if (!error.message.includes(`Could not find the '${column}' column`)) {
          workingColumns.push(column);
          console.log(`   ✅ Column '${column}' exists (error: ${error.message.substring(0, 50)}...)`);
        } else {
          console.log(`   ❌ Column '${column}' does not exist`);
        }
      } else {
        workingColumns.push(column);
        console.log(`   ✅ Column '${column}' exists and insert succeeded!`);
        
        // Clean up the test record
        if (data && data[0]) {
          await supabase.from('profiles').delete().eq('id', data[0].id);
        }
      }
    } catch (err) {
      console.log(`   ❌ Column '${column}' test failed: ${err.message}`);
    }
  }
  
  console.log('\n🎯 DISCOVERED WORKING COLUMNS:');
  console.log(workingColumns);
}

async function main() {
  console.log('🚀 Database Schema Discovery');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('\n');
  
  try {
    await discoverTableSchema();
  } catch (error) {
    console.error('❌ Error during schema discovery:', error);
  }
}

main();
