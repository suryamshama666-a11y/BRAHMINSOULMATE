import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ogwfcshjrrbbrndsdqgg.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd2Zjc2hqcnJiYnJuZHNkcWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzYzNDIsImV4cCI6MjA4MTcxMjM0Mn0.OiM3f2IOyZTjCud7-1bjU-RWn6mQD2mKgTG9ltO3RpU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to authenticate user
async function authenticateUser() {
  console.log('🔐 Authentication required to populate database');
  console.log('Please provide your Supabase project credentials:\n');

  const email = await askQuestion('Enter your email: ');
  const password = await askQuestion('Enter your password: ');

  console.log('\n🔄 Authenticating...');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error('❌ Authentication failed:', error.message);
    return false;
  }

  console.log('✅ Authentication successful!');
  console.log(`👤 Logged in as: ${data.user.email}\n`);
  return true;
}

// Sample profile data
const sampleProfiles = [
  {
    name: 'Aditya Sharma',
    age: 28,
    gender: 'male',
    images: ['https://randomuser.me/api/portraits/men/32.jpg'],
    bio: 'Software engineer who values tradition and spiritual growth.',
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Smartha',
    marital_status: 'never_married',
    height: 175,
    education: [{ degree: 'B.Tech Computer Science', institution: 'BITS Pilani', year: 2018 }],
    employment: { profession: 'Software Engineer', company: 'Microsoft', position: 'Senior Developer' },
    interests: ['reading', 'yoga', 'technology'],
    languages: ['English', 'Hindi', 'Kannada'],
    verified: true
  },
  {
    name: 'Priya Iyer',
    age: 26,
    gender: 'female',
    images: ['https://randomuser.me/api/portraits/women/44.jpg'],
    bio: 'Chartered Accountant with a passion for classical music and dance.',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Iyer',
    marital_status: 'never_married',
    height: 162,
    education: [{ degree: 'Chartered Accountancy', institution: 'ICAI', year: 2020 }],
    employment: { profession: 'Chartered Accountant', company: 'Deloitte', position: 'Senior Associate' },
    interests: ['music', 'dance', 'travel'],
    languages: ['English', 'Hindi', 'Tamil'],
    verified: true
  },
  {
    name: 'Kavya Nambiar',
    age: 29,
    gender: 'female',
    images: ['https://randomuser.me/api/portraits/women/28.jpg'],
    bio: 'Software architect with deep interest in classical arts and literature.',
    location: { city: 'Kochi', state: 'Kerala', country: 'India' },
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Namboodiri',
    marital_status: 'never_married',
    height: 165,
    education: [{ degree: 'M.Tech AI & Machine Learning', institution: 'IIT Madras', year: 2019 }],
    employment: { profession: 'Software Architect', company: 'Google', position: 'Technical Lead' },
    interests: ['music', 'literature', 'cooking'],
    languages: ['English', 'Malayalam', 'Tamil', 'Sanskrit'],
    verified: true
  },
  {
    name: 'Arjun Desai',
    age: 31,
    gender: 'male',
    images: ['https://randomuser.me/api/portraits/men/45.jpg'],
    bio: 'Doctor specializing in cardiology, passionate about helping others.',
    location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Deshastha',
    marital_status: 'never_married',
    height: 180,
    education: [{ degree: 'MBBS', institution: 'AIIMS Delhi', year: 2018 }],
    employment: { profession: 'Doctor', company: 'Apollo Hospitals', position: 'Cardiologist' },
    interests: ['medicine', 'research', 'fitness'],
    languages: ['English', 'Hindi', 'Marathi'],
    verified: true
  },
  {
    name: 'Meera Krishnan',
    age: 27,
    gender: 'female',
    images: ['https://randomuser.me/api/portraits/women/35.jpg'],
    bio: 'Teacher and classical dancer, dedicated to preserving cultural traditions.',
    location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Iyengar',
    marital_status: 'never_married',
    height: 160,
    education: [{ degree: 'M.A. in Education', institution: 'University of Madras', year: 2019 }],
    employment: { profession: 'Teacher', company: 'DAV School', position: 'Senior Teacher' },
    interests: ['dance', 'teaching', 'spirituality'],
    languages: ['English', 'Tamil', 'Sanskrit'],
    verified: true
  }
];

// Sample events
const sampleEvents = [
  {
    title: 'Brahmin Community Meetup - Bangalore',
    description: 'Join us for a traditional gathering with cultural programs, networking, and matrimonial introductions.',
    date: '2025-02-15',
    time: '18:00',
    location: 'Bangalore Palace Grounds, Bangalore',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500',
    max_participants: 100,
    current_participants: 45,
    price: 500
  },
  {
    title: 'Traditional Cooking Workshop',
    description: 'Learn authentic Brahmin recipes and cooking techniques from expert chefs.',
    date: '2025-02-20',
    time: '10:00',
    location: 'Cultural Center, Mumbai',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
    max_participants: 30,
    current_participants: 18,
    price: 800
  },
  {
    title: 'Vedic Astrology & Horoscope Matching',
    description: 'Expert astrologers will guide you through horoscope compatibility and Vedic principles.',
    date: '2025-02-25',
    time: '14:00',
    location: 'Temple Complex, Chennai',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
    max_participants: 50,
    current_participants: 32,
    price: 300
  }
];

async function populateProfiles() {
  console.log('🔄 Populating profiles...');

  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  for (let i = 0; i < sampleProfiles.length; i++) {
    const profile = sampleProfiles[i];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user ? user.id : `user-${Date.now()}-${Math.random()}`, // Use authenticated user ID or generate one
          ...profile,
          last_active: new Date().toISOString()
        });

      if (error) {
        console.error(`❌ Error creating profile for ${profile.name}:`, error.message);
      } else {
        console.log(`✅ Created profile: ${profile.name}`);
      }
    } catch (error) {
      console.error(`❌ Exception creating profile for ${profile.name}:`, error.message);
    }
  }
}

async function populateEvents() {
  console.log('🔄 Creating sample events...');
  
  // Get a profile to use as organizer
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (!profiles || profiles.length === 0) {
    console.log('⚠️ No profiles found, skipping events creation');
    return;
  }
  
  const organizerId = profiles[0].id;
  
  for (const event of sampleEvents) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...event,
          organizer_id: organizerId
        });
      
      if (error) {
        console.error(`❌ Error creating event ${event.title}:`, error.message);
      } else {
        console.log(`✅ Created event: ${event.title}`);
      }
    } catch (error) {
      console.error(`❌ Exception creating event ${event.title}:`, error.message);
    }
  }
}

async function createMatches() {
  console.log('🔄 Creating sample matches...');
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id');
  
  if (!profiles || profiles.length < 2) {
    console.log('⚠️ Not enough profiles for matches');
    return;
  }
  
  // Create some random matches
  for (let i = 0; i < Math.min(5, profiles.length - 1); i++) {
    const user1 = profiles[i];
    const user2 = profiles[i + 1] || profiles[0];
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          user_id: user1.id,
          match_id: user2.id,
          status: Math.random() > 0.5 ? 'accepted' : 'pending'
        });
      
      if (error) {
        console.error('❌ Error creating match:', error.message);
      } else {
        console.log(`✅ Created match between profiles`);
      }
    } catch (error) {
      console.error('❌ Exception creating match:', error.message);
    }
  }
}

async function createSampleMessages() {
  console.log('🔄 Creating sample messages...');
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id');
  
  if (!profiles || profiles.length < 2) {
    console.log('⚠️ Not enough profiles for messages');
    return;
  }
  
  const sampleMessages = [
    'Hello! I found your profile very interesting.',
    'Thank you for showing interest. I would love to know more about you.',
    'What are your hobbies and interests?',
    'I enjoy reading, traveling, and classical music. What about you?',
    'That sounds wonderful! I also love music. Do you play any instruments?'
  ];
  
  for (let i = 0; i < Math.min(sampleMessages.length, profiles.length - 1); i++) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: profiles[i].id,
          receiver_id: profiles[i + 1].id,
          content: sampleMessages[i],
          read: Math.random() > 0.5
        });
      
      if (error) {
        console.error('❌ Error creating message:', error.message);
      } else {
        console.log(`✅ Created message`);
      }
    } catch (error) {
      console.error('❌ Exception creating message:', error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting database population...');
  console.log('📡 Supabase URL:', supabaseUrl);

  try {
    // Authenticate user first
    const isAuthenticated = await authenticateUser();
    if (!isAuthenticated) {
      console.log('❌ Authentication failed. Exiting...');
      rl.close();
      return;
    }

    // Test connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      rl.close();
      return;
    }

    console.log('✅ Connected to Supabase successfully');

    // Populate data
    await populateProfiles();
    await populateEvents();
    await createMatches();
    await createSampleMessages();

    console.log('\n🎉 Database population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${sampleProfiles.length} profiles`);
    console.log(`- Created ${sampleEvents.length} events`);
    console.log('- Created sample matches and messages');
    console.log('\n🌐 You can now view your data in the Supabase dashboard:');
    console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}`);

    // Sign out
    await supabase.auth.signOut();
    console.log('🔓 Signed out successfully');

  } catch (error) {
    console.error('❌ Error during population:', error);
  } finally {
    rl.close();
  }
}

// Run the script
main();
