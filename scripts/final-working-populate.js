import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample user data with valid email formats
const sampleUsers = [
  {
    email: 'aditya.sharma.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'male',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 175,
      subscription_type: 'free'
    }
  },
  {
    email: 'priya.iyer.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'female',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 162,
      subscription_type: 'premium'
    }
  },
  {
    email: 'kavya.nambiar.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'female',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 165,
      subscription_type: 'free'
    }
  }
];

async function createUsersAndProfiles() {
  console.log('🔄 Creating users and profiles with valid emails...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < sampleUsers.length; i++) {
    const userData = sampleUsers[i];
    console.log(`📋 Creating user ${i + 1}: ${userData.email}`);
    
    try {
      // Step 1: Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined // Skip email confirmation
        }
      });
      
      if (authError) {
        console.log(`❌ Error creating auth user:`, authError.message);
        
        // If user already exists, try to get the user
        if (authError.message.includes('already registered')) {
          console.log(`🔄 User already exists, trying to sign in...`);
          
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password
          });
          
          if (signInError) {
            console.log(`❌ Sign in failed:`, signInError.message);
            errorCount++;
            continue;
          }
          
          if (signInData.user) {
            console.log(`✅ Signed in existing user: ${signInData.user.id}`);
            
            // Try to create profile for existing user
            const profileData = {
              user_id: signInData.user.id,
              ...userData.profile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: profileData2, error: profileError } = await supabase
              .from('profiles')
              .insert(profileData)
              .select();
            
            if (profileError) {
              console.log(`❌ Error creating profile:`, profileError.message);
              errorCount++;
            } else {
              console.log(`✅ Created profile: ${profileData2[0].id}`);
              successCount++;
            }
          }
        } else {
          errorCount++;
        }
        continue;
      }
      
      if (!authData.user) {
        console.log(`❌ No user data returned from auth signup`);
        errorCount++;
        continue;
      }
      
      console.log(`✅ Created auth user: ${authData.user.id}`);
      
      // Step 2: Create profile using the auth user ID
      const profileData = {
        user_id: authData.user.id,
        ...userData.profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: profileData2, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select();
      
      if (profileError) {
        console.log(`❌ Error creating profile:`, profileError.message);
        errorCount++;
      } else {
        console.log(`✅ Created profile: ${profileData2[0].id}`);
        console.log(`   Gender: ${profileData2[0].gender}`);
        console.log(`   Religion: ${profileData2[0].religion}`);
        console.log(`   Height: ${profileData2[0].height}cm`);
        successCount++;
      }
      
    } catch (err) {
      console.log(`❌ Exception creating user ${i + 1}:`, err.message);
      errorCount++;
    }
    
    console.log('');
  }
  
  return { successCount, errorCount };
}

async function createDummyProfiles() {
  console.log('🔄 Alternative: Creating profiles with dummy user IDs...\n');
  
  // Generate some dummy UUIDs that might exist in auth.users
  const dummyUserIds = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < dummyUserIds.length; i++) {
    const userId = dummyUserIds[i];
    console.log(`📋 Creating profile with dummy user ID: ${userId}`);
    
    const profile = {
      user_id: userId,
      gender: i % 2 === 0 ? 'male' : 'female',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 160 + (i * 5),
      subscription_type: i % 2 === 0 ? 'free' : 'premium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select();
      
      if (error) {
        console.log(`❌ Error:`, error.message);
      } else {
        console.log(`✅ Success: ${data[0].id}`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ Exception:`, err.message);
    }
  }
  
  return successCount;
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
        console.log('📋 Sample profiles:');
        data.forEach((profile, index) => {
          console.log(`   ${index + 1}. ID: ${profile.id}`);
          console.log(`      User ID: ${profile.user_id}`);
          console.log(`      Gender: ${profile.gender}`);
          console.log(`      Religion: ${profile.religion}`);
          console.log(`      Height: ${profile.height}cm`);
          console.log(`      Subscription: ${profile.subscription_type}`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Exception checking data:', err.message);
  }
}

async function main() {
  console.log('🚀 FINAL Working Database Population');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('📋 Using valid email formats and proper auth flow');
  console.log('\n');
  
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Cannot connect to Supabase. Please check your configuration.');
      return;
    }
    
    // Try Method 1: Create auth users + profiles with valid emails
    console.log('🎯 Method 1: Creating auth users + profiles with valid emails...');
    const { successCount, errorCount } = await createUsersAndProfiles();
    
    if (successCount === 0) {
      console.log('\n🎯 Method 2: Creating profiles with dummy user IDs...');
      const dummySuccess = await createDummyProfiles();
      console.log(`Dummy profiles created: ${dummySuccess}`);
    }
    
    // Check final results
    await checkFinalData();
    
    console.log('\n🎉 Population completed!');
    console.log('\n📊 Final Summary:');
    console.log(`✅ Successfully created: ${successCount} complete user+profile pairs`);
    console.log(`❌ Failed to create: ${errorCount} user+profile pairs`);
    
    if (successCount > 0) {
      console.log('\n🌐 Check your Supabase dashboard to see the data:');
      console.log(`   https://supabase.com/dashboard/project/pgiivokemegrlevfzezg/editor`);
      console.log('\n🎯 Your database now has sample data for testing your application!');
    } else {
      console.log('\n💡 If this still fails, you may need to:');
      console.log('1. Disable email confirmations in Supabase Auth settings');
      console.log('2. Or manually create users in the Supabase dashboard first');
      console.log('3. Or remove the foreign key constraint on user_id');
    }
    
  } catch (error) {
    console.error('❌ Error during population:', error);
  }
}

main();
