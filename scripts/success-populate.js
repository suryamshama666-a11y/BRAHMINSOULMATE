import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample profiles using ONLY the discovered working columns
const sampleProfiles = [
  {
    user_id: randomUUID(),
    gender: 'male',
    religion: 'Hindu',
    caste: 'Brahmin',
    marital_status: 'never_married',
    height: 175,
    subscription_type: 'free',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: randomUUID(),
    gender: 'female',
    religion: 'Hindu',
    caste: 'Brahmin',
    marital_status: 'never_married',
    height: 162,
    subscription_type: 'premium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: randomUUID(),
    gender: 'female',
    religion: 'Hindu',
    caste: 'Brahmin',
    marital_status: 'never_married',
    height: 165,
    subscription_type: 'free',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: randomUUID(),
    gender: 'male',
    religion: 'Hindu',
    caste: 'Brahmin',
    marital_status: 'never_married',
    height: 180,
    subscription_type: 'premium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: randomUUID(),
    gender: 'female',
    religion: 'Hindu',
    caste: 'Brahmin',
    marital_status: 'never_married',
    height: 160,
    subscription_type: 'free',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function populateSuccessfulProfiles() {
  console.log('🔄 Populating with discovered working columns...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < sampleProfiles.length; i++) {
    const profile = sampleProfiles[i];
    console.log(`📋 Creating profile ${i + 1}:`);
    console.log(`   Gender: ${profile.gender}`);
    console.log(`   Religion: ${profile.religion}`);
    console.log(`   Caste: ${profile.caste}`);
    console.log(`   Height: ${profile.height}cm`);
    console.log(`   Subscription: ${profile.subscription_type}`);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select();
      
      if (error) {
        console.log(`❌ Error creating profile ${i + 1}:`, error.message);
        if (error.details) console.log(`   Details:`, error.details);
        errorCount++;
      } else {
        console.log(`✅ Successfully created profile ${i + 1}!`);
        if (data && data[0]) {
          console.log(`   ID: ${data[0].id}`);
          console.log(`   User ID: ${data[0].user_id}`);
        }
        successCount++;
      }
    } catch (err) {
      console.log(`❌ Exception creating profile ${i + 1}:`, err.message);
      errorCount++;
    }
    
    console.log('');
  }
  
  return { successCount, errorCount };
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

async function checkFinalData() {
  console.log('🔍 Checking final data...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (error) {
      console.log('❌ Error checking data:', error.message);
    } else {
      console.log(`📊 Total profiles in database: ${data.length}`);
      if (data.length > 0) {
        console.log('📋 Sample profile:');
        const sample = data[0];
        console.log(`   ID: ${sample.id}`);
        console.log(`   User ID: ${sample.user_id}`);
        console.log(`   Gender: ${sample.gender}`);
        console.log(`   Religion: ${sample.religion}`);
        console.log(`   Caste: ${sample.caste}`);
        console.log(`   Height: ${sample.height}cm`);
        console.log(`   Subscription: ${sample.subscription_type}`);
        console.log(`   Created: ${sample.created_at}`);
      }
    }
  } catch (err) {
    console.log('❌ Exception checking data:', err.message);
  }
}

async function main() {
  console.log('🚀 SUCCESS! Database Population with Discovered Schema');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('📋 Using discovered columns: id, user_id, created_at, updated_at, gender, religion, caste, marital_status, height, subscription_type');
  console.log('\n');
  
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Cannot connect to Supabase. Please check your configuration.');
      return;
    }
    
    // Populate profiles with working schema
    const { successCount, errorCount } = await populateSuccessfulProfiles();
    
    // Check final results
    await checkFinalData();
    
    console.log('\n🎉 Population completed!');
    console.log('\n📊 Final Summary:');
    console.log(`✅ Successfully created: ${successCount} profiles`);
    console.log(`❌ Failed to create: ${errorCount} profiles`);
    console.log(`📋 Total attempted: ${sampleProfiles.length} profiles`);
    
    if (successCount > 0) {
      console.log('\n🌐 Check your Supabase dashboard to see the data:');
      console.log(`   https://supabase.com/dashboard/project/pgiivokemegrlevfzezg/editor`);
      console.log('\n🎯 Your database now has sample data for testing your application!');
    }
    
  } catch (error) {
    console.error('❌ Error during population:', error);
  }
}

main();
