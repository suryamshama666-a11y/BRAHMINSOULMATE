import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// From the error message, these are the only columns we know exist:
// (id, user_id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, country, ?, ?, subscription_type, ?, visibility, created_at, updated_at)
// Let's use only the ones we're absolutely sure about

const sampleProfiles = [
  {
    user_id: randomUUID(),
    subscription_type: 'free'
  },
  {
    user_id: randomUUID(),
    subscription_type: 'premium'
  },
  {
    user_id: randomUUID(),
    subscription_type: 'free'
  }
];

async function populateMinimalProfiles() {
  console.log('🔄 Populating with absolute minimal columns...\n');
  
  for (let i = 0; i < sampleProfiles.length; i++) {
    const profile = sampleProfiles[i];
    console.log(`📋 Creating minimal profile ${i + 1}`);
    console.log(`   Data:`, profile);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select();
      
      if (error) {
        console.log(`❌ Error creating profile ${i + 1}:`, error.message);
        if (error.details) console.log(`   Details:`, error.details);
        if (error.hint) console.log(`   Hint:`, error.hint);
        
        // If this fails, try with even fewer columns
        if (error.message.includes('schema cache')) {
          console.log(`🔄 Trying with just user_id...`);
          
          const minimalData = { user_id: profile.user_id };
          const { data: data2, error: error2 } = await supabase
            .from('profiles')
            .insert(minimalData)
            .select();
          
          if (error2) {
            console.log(`❌ Even minimal insert failed:`, error2.message);
          } else {
            console.log(`✅ Minimal insert succeeded!`);
            console.log(`   Data:`, data2);
          }
        }
      } else {
        console.log(`✅ Successfully created profile ${i + 1}!`);
        if (data && data[0]) {
          console.log(`   ID: ${data[0].id}`);
          console.log(`   User ID: ${data[0].user_id}`);
          console.log(`   Full data:`, data[0]);
        }
      }
    } catch (err) {
      console.log(`❌ Exception creating profile ${i + 1}:`, err.message);
    }
    
    console.log('');
  }
}

async function testConnection() {
  console.log('🔄 Testing connection...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection test exception:', error.message);
    return false;
  }
}

async function checkExistingData() {
  console.log('🔍 Checking existing data...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Error checking data:', error.message);
    } else {
      console.log(`📊 Found ${data.length} existing profiles`);
      if (data.length > 0) {
        console.log('📋 Actual table structure:');
        console.log('   Columns:', Object.keys(data[0]));
        console.log('   Sample data:', data[0]);
      }
    }
  } catch (err) {
    console.log('❌ Exception checking data:', err.message);
  }
}

async function main() {
  console.log('🚀 Final Database Population Attempt');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('\n');
  
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Cannot connect to Supabase. Please check your configuration.');
      return;
    }
    
    // Check existing data to see actual structure
    await checkExistingData();
    console.log('');
    
    // Try to populate with minimal data
    await populateMinimalProfiles();
    
    console.log('🎉 Final population attempt completed!');
    console.log('\n📊 Summary:');
    console.log(`- Attempted to create ${sampleProfiles.length} minimal profiles`);
    console.log('\n🌐 Check your Supabase dashboard to see the data:');
    console.log(`   https://supabase.com/dashboard/project/pgiivokemegrlevfzezg/editor`);
    
  } catch (error) {
    console.error('❌ Error during population:', error);
  }
}

main();
