import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment or context
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ogwfcshjrrbbrndsdqgg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd2Zjc2hqcnJiYnJuZHNkcWdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjEzNjM0MiwiZXhwIjoyMDgxNzEyMzQyfQ.EqZsmvFa32U0kMcRaysgTITWTuYXscxqc4QlkRDBjVs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample profile data mapped to the schema
const sampleProfiles = [
  {
    first_name: 'Aditya',
    last_name: 'Sharma',
    display_name: 'Aditya Sharma',
    date_of_birth: '1996-05-15',
    gender: 'male',
    profile_picture_url: 'https://randomuser.me/api/portraits/men/32.jpg',
    about_me: 'Software engineer who values tradition and spiritual growth.',
    religion: 'hindu',
    caste: 'brahmin',
    subcaste: 'smartha',
    marital_status: 'never_married',
    height: 175,
    education_level: 'bachelors',
    education_details: 'B.Tech Computer Science from BITS Pilani',
    occupation: 'software',
    company_name: 'Microsoft',
    annual_income: 2500000,
    hobbies: ['reading', 'yoga', 'technology'],
    languages_known: ['English', 'Hindi', 'Kannada'],
    verified: 'verified'
  },
  {
    first_name: 'Priya',
    last_name: 'Iyer',
    display_name: 'Priya Iyer',
    date_of_birth: '1998-08-22',
    gender: 'female',
    profile_picture_url: 'https://randomuser.me/api/portraits/women/44.jpg',
    about_me: 'Chartered Accountant with a passion for classical music and dance.',
    religion: 'hindu',
    caste: 'brahmin',
    subcaste: 'aiyar',
    marital_status: 'never_married',
    height: 162,
    education_level: 'masters',
    education_details: 'Chartered Accountancy from ICAI',
    occupation: 'business',
    company_name: 'Deloitte',
    annual_income: 1800000,
    hobbies: ['music', 'dance', 'travel'],
    languages_known: ['English', 'Hindi', 'Tamil'],
    verified: 'verified'
  },
  {
    first_name: 'Kavya',
    last_name: 'Nambiar',
    display_name: 'Kavya Nambiar',
    date_of_birth: '1995-12-10',
    gender: 'female',
    profile_picture_url: 'https://randomuser.me/api/portraits/women/28.jpg',
    about_me: 'Software architect with deep interest in classical arts and literature.',
    religion: 'hindu',
    caste: 'brahmin',
    subcaste: 'other',
    marital_status: 'never_married',
    height: 165,
    education_level: 'masters',
    education_details: 'M.Tech AI & Machine Learning from IIT Madras',
    occupation: 'software',
    company_name: 'Google',
    annual_income: 3500000,
    hobbies: ['music', 'literature', 'cooking'],
    languages_known: ['English', 'Malayalam', 'Tamil', 'Sanskrit'],
    verified: 'verified'
  }
];

async function seedData() {
  console.log('🚀 Starting database seeding with Service Role...');

  try {
    // 1. Create a few auth users if they don't exist
    // For simplicity in this demo, we'll try to create profiles with dummy user_ids
    // or we could use the service role to create real auth users.
    // Creating real auth users is better for a functional demo.
    
    for (const p of sampleProfiles) {
      const email = `${p.first_name.toLowerCase()}.${p.last_name.toLowerCase()}@example.com`;
      const password = 'Password123!';
      
      console.log(`\n👤 Processing ${p.display_name}...`);
      
      // Check if user exists
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      let user = users?.users.find(u => u.email === email);
      
      if (!user) {
        console.log(`  Creating auth user for ${email}...`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { first_name: p.first_name, last_name: p.last_name }
        });
        
        if (createError) {
          console.error(`  ❌ Error creating auth user: ${createError.message}`);
          continue;
        }
        user = newUser.user;
      }
      
      // Update/Insert profile
      const profileData = {
        user_id: user.id,
        ...p,
        updated_at: new Date().toISOString()
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });
        
      if (profileError) {
        console.error(`  ❌ Error creating profile: ${profileError.message}`);
      } else {
        console.log(`  ✅ Profile ready for ${p.display_name}`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('You can now log in with any of the sample accounts (Password: Password123!)');

  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error);
  }
}

seedData();
