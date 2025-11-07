import { createClient } from '@supabase/supabase-js';

// Supabase configuration from .env
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function populateProfiles() {
  console.log('🔄 Populating profiles...');
  
  for (let i = 0; i < sampleProfiles.length; i++) {
    const profile = sampleProfiles[i];
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: `user-${Date.now()}-${Math.random()}`,
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

async function main() {
  console.log('🚀 Starting simple database population...');
  console.log('📡 Supabase URL:', supabaseUrl);
  
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Cannot connect to Supabase. Please check your configuration.');
      return;
    }
    
    // Populate profiles
    await populateProfiles();
    
    console.log('\n🎉 Database population completed!');
    console.log('\n📊 Summary:');
    console.log(`- Attempted to create ${sampleProfiles.length} profiles`);
    console.log('\n🌐 Check your Supabase dashboard to see the data:');
    console.log(`   https://supabase.com/dashboard/project/pgiivokemegrlevfzezg`);
    
  } catch (error) {
    console.error('❌ Error during population:', error);
  }
}

// Run the script
main();
