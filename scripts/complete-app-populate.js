import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Additional users for a complete application
const additionalUsers = [
  {
    email: 'rajesh.gupta.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'male',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 178,
      subscription_type: 'premium'
    }
  },
  {
    email: 'anita.sharma.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'female',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 158,
      subscription_type: 'free'
    }
  },
  {
    email: 'vikram.mishra.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'male',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 182,
      subscription_type: 'free'
    }
  },
  {
    email: 'deepika.rao.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'female',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 164,
      subscription_type: 'premium'
    }
  },
  {
    email: 'arjun.pandey.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'male',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 176,
      subscription_type: 'free'
    }
  },
  {
    email: 'sneha.joshi.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'female',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 161,
      subscription_type: 'premium'
    }
  },
  {
    email: 'rohit.trivedi.test@gmail.com',
    password: 'TestPassword123!',
    profile: {
      gender: 'male',
      religion: 'Hindu',
      caste: 'Brahmin',
      marital_status: 'never_married',
      height: 174,
      subscription_type: 'free'
    }
  }
];

// Sample events data
const sampleEvents = [
  {
    title: 'Brahmin Cultural Meet - Mumbai',
    description: 'Join us for a traditional cultural gathering with music, dance, and networking opportunities for young Brahmins.',
    date: '2025-08-15',
    time: '18:00',
    location: 'Mumbai, Maharashtra',
    max_participants: 50,
    event_type: 'cultural'
  },
  {
    title: 'Spiritual Discourse & Meditation',
    description: 'A peaceful evening of spiritual discourse followed by guided meditation session.',
    date: '2025-08-20',
    time: '17:30',
    location: 'Bangalore, Karnataka',
    max_participants: 30,
    event_type: 'spiritual'
  },
  {
    title: 'Traditional Cooking Workshop',
    description: 'Learn to prepare authentic Brahmin cuisine with expert chefs and connect with like-minded individuals.',
    date: '2025-08-25',
    time: '15:00',
    location: 'Chennai, Tamil Nadu',
    max_participants: 25,
    event_type: 'workshop'
  },
  {
    title: 'Young Professionals Networking',
    description: 'Networking event for young Brahmin professionals across various industries.',
    date: '2025-09-01',
    time: '19:00',
    location: 'Delhi, NCR',
    max_participants: 40,
    event_type: 'networking'
  },
  {
    title: 'Classical Music Evening',
    description: 'An evening dedicated to classical Indian music with performances and appreciation.',
    date: '2025-09-10',
    time: '18:30',
    location: 'Pune, Maharashtra',
    max_participants: 35,
    event_type: 'cultural'
  }
];

async function createAdditionalUsers() {
  console.log('🔄 Creating additional users and profiles...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const createdUserIds = [];
  
  for (let i = 0; i < additionalUsers.length; i++) {
    const userData = additionalUsers[i];
    console.log(`📋 Creating user ${i + 1}: ${userData.email}`);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined
        }
      });
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`🔄 User already exists, skipping...`);
          continue;
        }
        console.log(`❌ Error creating auth user:`, authError.message);
        errorCount++;
        continue;
      }
      
      if (!authData.user) {
        console.log(`❌ No user data returned`);
        errorCount++;
        continue;
      }
      
      console.log(`✅ Created auth user: ${authData.user.id}`);
      createdUserIds.push(authData.user.id);
      
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
        successCount++;
      }
      
    } catch (err) {
      console.log(`❌ Exception:`, err.message);
      errorCount++;
    }
    
    console.log('');
  }
  
  return { successCount, errorCount, createdUserIds };
}

async function createEvents() {
  console.log('🔄 Creating sample events...\n');
  
  let successCount = 0;
  
  for (let i = 0; i < sampleEvents.length; i++) {
    const event = sampleEvents[i];
    console.log(`📋 Creating event: ${event.title}`);
    
    try {
      const eventData = {
        ...event,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select();
      
      if (error) {
        console.log(`❌ Error creating event:`, error.message);
      } else {
        console.log(`✅ Created event: ${data[0].id}`);
        console.log(`   Date: ${data[0].date} at ${data[0].time}`);
        console.log(`   Location: ${data[0].location}`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ Exception:`, err.message);
    }
    
    console.log('');
  }
  
  return successCount;
}

async function createSampleMessages() {
  console.log('🔄 Creating sample messages...\n');
  
  // Get existing profiles to create messages between them
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, user_id')
    .limit(6);
  
  if (error || !profiles || profiles.length < 2) {
    console.log('❌ Not enough profiles to create messages');
    return 0;
  }
  
  const sampleMessages = [
    {
      sender_id: profiles[0].user_id,
      receiver_id: profiles[1].user_id,
      content: 'Hi! I noticed we have similar interests. Would love to connect and chat.',
      message_type: 'text'
    },
    {
      sender_id: profiles[1].user_id,
      receiver_id: profiles[0].user_id,
      content: 'Hello! Thank you for reaching out. I would be happy to chat as well.',
      message_type: 'text'
    },
    {
      sender_id: profiles[2].user_id,
      receiver_id: profiles[3].user_id,
      content: 'Namaste! I see you are also interested in classical music. That is wonderful!',
      message_type: 'text'
    },
    {
      sender_id: profiles[3].user_id,
      receiver_id: profiles[2].user_id,
      content: 'Namaste! Yes, I have been learning classical music since childhood. What about you?',
      message_type: 'text'
    }
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < sampleMessages.length; i++) {
    const message = sampleMessages[i];
    console.log(`📋 Creating message ${i + 1}`);
    
    try {
      const messageData = {
        ...message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();
      
      if (error) {
        console.log(`❌ Error creating message:`, error.message);
      } else {
        console.log(`✅ Created message: ${data[0].id}`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ Exception:`, err.message);
    }
  }
  
  return successCount;
}

async function checkFinalData() {
  console.log('🔍 Checking final application data...\n');
  
  try {
    // Check profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');
    
    console.log(`📊 Total profiles: ${profiles?.length || 0}`);
    
    // Check events
    const { data: events } = await supabase
      .from('events')
      .select('*');
    
    console.log(`📊 Total events: ${events?.length || 0}`);
    
    // Check messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*');
    
    console.log(`📊 Total messages: ${messages?.length || 0}`);
    
  } catch (err) {
    console.log('❌ Error checking data:', err.message);
  }
}

async function main() {
  console.log('🚀 COMPLETE APPLICATION DATABASE POPULATION');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('🎯 Creating comprehensive data for full application functionality');
  console.log('\n');
  
  try {
    // Create additional users and profiles
    const { successCount: userSuccess, errorCount: userErrors } = await createAdditionalUsers();
    
    // Create sample events
    const eventSuccess = await createEvents();
    
    // Create sample messages
    const messageSuccess = await createSampleMessages();
    
    // Check final data
    await checkFinalData();
    
    console.log('\n🎉 COMPLETE APPLICATION POPULATION FINISHED!');
    console.log('\n📊 Final Summary:');
    console.log(`✅ Additional users created: ${userSuccess}`);
    console.log(`✅ Events created: ${eventSuccess}`);
    console.log(`✅ Messages created: ${messageSuccess}`);
    console.log(`❌ Failed operations: ${userErrors}`);
    
    console.log('\n🌐 Check your Supabase dashboard:');
    console.log(`   https://supabase.com/dashboard/project/pgiivokemegrlevfzezg/editor`);
    
    console.log('\n🎯 Your application now has:');
    console.log('   • Multiple user profiles for browsing and matching');
    console.log('   • Sample events for community engagement');
    console.log('   • Message conversations for testing chat functionality');
    console.log('   • Mix of free and premium users for subscription testing');
    console.log('\n🚀 Your Brahmin Soulmate Connect app is now fully populated and ready!');
    
  } catch (error) {
    console.error('❌ Error during complete population:', error);
  }
}

main();
