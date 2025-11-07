import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWl2b2tlbWVncmxldmZ6ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDA4OTYsImV4cCI6MjA2MTk3Njg5Nn0.MBDTfgkKb8m7aNLDM6xRi1zxLyP8hyk2pH90Hd6aZw8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample profile data with proper UUID format
const sampleProfiles = [
  {
    user_id: randomUUID(),
    name: 'Aditya Sharma',
    age: 28,
    gender: 'male',
    bio: 'Software engineer who values tradition and spiritual growth.',
    location: 'Bangalore, Karnataka',
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Smartha',
    marital_status: 'never_married',
    height: 175,
    education: 'B.Tech Computer Science from BITS Pilani',
    profession: 'Software Engineer',
    company: 'Microsoft',
    verified: true
  },
  {
    user_id: randomUUID(),
    name: 'Priya Iyer',
    age: 26,
    gender: 'female',
    bio: 'Chartered Accountant with a passion for classical music and dance.',
    location: 'Mumbai, Maharashtra',
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Iyer',
    marital_status: 'never_married',
    height: 162,
    education: 'Chartered Accountancy from ICAI',
    profession: 'Chartered Accountant',
    company: 'Deloitte',
    verified: true
  },
  {
    user_id: randomUUID(),
    name: 'Kavya Nambiar',
    age: 29,
    gender: 'female',
    bio: 'Software architect with deep interest in classical arts and literature.',
    location: 'Kochi, Kerala',
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Namboodiri',
    marital_status: 'never_married',
    height: 165,
    education: 'M.Tech AI & Machine Learning from IIT Madras',
    profession: 'Software Architect',
    company: 'Google',
    verified: true
  },
  {
    user_id: randomUUID(),
    name: 'Arjun Desai',
    age: 31,
    gender: 'male',
    bio: 'Doctor specializing in cardiology, passionate about helping others.',
    location: 'Pune, Maharashtra',
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Deshastha',
    marital_status: 'never_married',
    height: 180,
    education: 'MBBS from AIIMS Delhi',
    profession: 'Doctor',
    company: 'Apollo Hospitals',
    verified: true
  },
  {
    user_id: randomUUID(),
    name: 'Meera Krishnan',
    age: 27,
    gender: 'female',
    bio: 'Teacher and classical dancer, dedicated to preserving cultural traditions.',
    location: 'Chennai, Tamil Nadu',
    religion: 'Hindu',
    caste: 'Brahmin',
    subcaste: 'Iyengar',
    marital_status: 'never_married',
    height: 160,
    education: 'M.A. in Education from University of Madras',
    profession: 'Teacher',
    company: 'DAV School',
    verified: true
  }
];

async function populateProfiles() {
  console.log('🔄 Populating profiles with proper UUID format...\n');
  
  for (let i = 0; i < sampleProfiles.length; i++) {
    const profile = sampleProfiles[i];
    console.log(`📋 Creating profile ${i + 1}: ${profile.name}`);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select();
      
      if (error) {
        console.log(`❌ Error creating ${profile.name}:`, error.message);
        if (error.details) console.log(`   Details:`, error.details);
        if (error.hint) console.log(`   Hint:`, error.hint);
      } else {
        console.log(`✅ Successfully created: ${profile.name}`);
        if (data && data[0]) {
          console.log(`   ID: ${data[0].id}`);
        }
      }
    } catch (err) {
      console.log(`❌ Exception creating ${profile.name}:`, err.message);
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

async function main() {
  console.log('🚀 Working Database Population');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('\n');
  
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Cannot connect to Supabase. Please check your configuration.');
      return;
    }
    
    // Populate profiles
    await populateProfiles();
    
    console.log('🎉 Database population completed!');
    console.log('\n📊 Summary:');
    console.log(`- Attempted to create ${sampleProfiles.length} profiles`);
    console.log('\n🌐 Check your Supabase dashboard to see the data:');
    console.log(`   https://supabase.com/dashboard/project/pgiivokemegrlevfzezg/editor`);
    
  } catch (error) {
    console.error('❌ Error during population:', error);
  }
}

main();
