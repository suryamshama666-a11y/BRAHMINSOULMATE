import { createClient } from '@supabase/supabase-js';

// Supabase configuration (read from environment variables)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBackendIntegration() {
  console.log('🚀 Testing Backend Integration for Brahmin Soulmate Connect\n');
  
  const results = {
    profiles: { status: '❌', count: 0, error: null },
    events: { status: '❌', count: 0, error: null },
    messages: { status: '❌', count: 0, error: null },
    auth: { status: '❌', error: null }
  };

  // Test 1: Profiles Table
  console.log('📋 Testing Profiles Table...');
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      results.profiles.error = profilesError.message;
      console.log(`❌ Profiles test failed: ${profilesError.message}`);
    } else {
      results.profiles.status = '✅';
      results.profiles.count = profiles.length;
      console.log(`✅ Profiles test passed: Found ${profiles.length} profiles`);
      
      if (profiles.length > 0) {
        console.log('   Sample profile structure:');
        console.log(`   - ID: ${profiles[0].id}`);
        console.log(`   - User ID: ${profiles[0].user_id}`);
        console.log(`   - Gender: ${profiles[0].gender}`);
        console.log(`   - Religion: ${profiles[0].religion}`);
        console.log(`   - Height: ${profiles[0].height}cm`);
        console.log(`   - Subscription: ${profiles[0].subscription_type}`);
      }
    }
  } catch (error) {
    results.profiles.error = error.message;
    console.log(`❌ Profiles test exception: ${error.message}`);
  }
  
  console.log('');

  // Test 2: Events Table
  console.log('📅 Testing Events Table...');
  try {
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(5);
    
    if (eventsError) {
      results.events.error = eventsError.message;
      console.log(`❌ Events test failed: ${eventsError.message}`);
      console.log('   Note: This is expected if events table schema differs');
    } else {
      results.events.status = '✅';
      results.events.count = events.length;
      console.log(`✅ Events test passed: Found ${events.length} events`);
      
      if (events.length > 0) {
        console.log('   Sample event:');
        console.log(`   - Title: ${events[0].title}`);
        console.log(`   - Date: ${events[0].date}`);
        console.log(`   - Location: ${events[0].location}`);
      }
    }
  } catch (error) {
    results.events.error = error.message;
    console.log(`❌ Events test exception: ${error.message}`);
  }
  
  console.log('');

  // Test 3: Messages Table
  console.log('💬 Testing Messages Table...');
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);
    
    if (messagesError) {
      results.messages.error = messagesError.message;
      console.log(`❌ Messages test failed: ${messagesError.message}`);
      console.log('   Note: This is expected if messages table schema differs');
    } else {
      results.messages.status = '✅';
      results.messages.count = messages.length;
      console.log(`✅ Messages test passed: Found ${messages.length} messages`);
      
      if (messages.length > 0) {
        console.log('   Sample message:');
        console.log(`   - ID: ${messages[0].id}`);
        console.log(`   - Content: ${messages[0].content?.substring(0, 50)}...`);
      }
    }
  } catch (error) {
    results.messages.error = error.message;
    console.log(`❌ Messages test exception: ${error.message}`);
  }
  
  console.log('');

  // Test 4: Auth Connection
  console.log('🔐 Testing Auth Connection...');
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      results.auth.error = authError.message;
      console.log(`❌ Auth test failed: ${authError.message}`);
    } else {
      results.auth.status = '✅';
      console.log(`✅ Auth connection successful`);
      console.log(`   Session status: ${authData.session ? 'Active' : 'No active session'}`);
    }
  } catch (error) {
    results.auth.error = error.message;
    console.log(`❌ Auth test exception: ${error.message}`);
  }
  
  console.log('');

  // Test 5: API Functionality
  console.log('🔧 Testing API Functions...');
  
  // Test profile filtering
  try {
    const { data: maleProfiles, error: filterError } = await supabase
      .from('profiles')
      .select('*')
      .eq('gender', 'male')
      .limit(3);
    
    if (filterError) {
      console.log(`❌ Profile filtering failed: ${filterError.message}`);
    } else {
      console.log(`✅ Profile filtering works: Found ${maleProfiles.length} male profiles`);
    }
  } catch (error) {
    console.log(`❌ Profile filtering exception: ${error.message}`);
  }

  // Test profile search
  try {
    const { data: brahminProfiles, error: searchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('caste', 'Brahmin')
      .limit(3);
    
    if (searchError) {
      console.log(`❌ Profile search failed: ${searchError.message}`);
    } else {
      console.log(`✅ Profile search works: Found ${brahminProfiles.length} Brahmin profiles`);
    }
  } catch (error) {
    console.log(`❌ Profile search exception: ${error.message}`);
  }

  console.log('');

  // Summary Report
  console.log('📊 BACKEND INTEGRATION TEST SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Profiles Table: ${results.profiles.status} (${results.profiles.count} records)`);
  console.log(`Events Table: ${results.events.status} (${results.events.count} records)`);
  console.log(`Messages Table: ${results.messages.status} (${results.messages.count} records)`);
  console.log(`Auth Connection: ${results.auth.status}`);
  
  console.log('\n🎯 RECOMMENDATIONS:');
  
  if (results.profiles.status === '✅') {
    console.log('✅ Profiles integration is working - Dashboard, Search, Matches pages will work');
  } else {
    console.log('❌ Profiles integration failed - Core functionality will not work');
    console.log(`   Error: ${results.profiles.error}`);
  }
  
  if (results.events.status === '❌') {
    console.log('⚠️  Events integration failed - Events page will use mock data');
    console.log('   This is expected if events table schema is different');
  }
  
  if (results.messages.status === '❌') {
    console.log('⚠️  Messages integration failed - Messages page will use mock data');
    console.log('   This is expected if messages table schema is different');
  }
  
  if (results.auth.status === '✅') {
    console.log('✅ Auth integration is working - Login/Registration will work');
  }

  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Test the application pages:');
  console.log('   - Dashboard: Should show real stats and profiles');
  console.log('   - Search: Should show real profile data');
  console.log('   - Matches: Should show real matching profiles');
  console.log('   - Events: Should show events (real or mock data)');
  console.log('3. Test user registration and login functionality');
  console.log('4. Verify profile browsing and filtering works');
  
  console.log('\n🎉 Your Brahmin Soulmate Connect app is ready for testing!');
}

// Run the test
testBackendIntegration().catch(console.error);
