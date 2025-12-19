import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd2Zjc2hqcnJiYnJuZHNkcWdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjEzNjM0MiwiZXhwIjoyMDgxNzEyMzQyfQ.EqZsmvFa32U0kMcRaysgTITWTuYXscxqc4QlkRDBjVs';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const sampleUsers = [
  {
    email: 'arjun.desai@example.com',
    password: 'Password123!',
    profile: {
      first_name: 'Arjun',
      last_name: 'Desai',
      display_name: 'Arjun Desai',
      date_of_birth: '1992-04-12',
      gender: 'male',
      height: 180,
      marital_status: 'never_married',
      religion: 'hindu',
      caste: 'brahmin',
      subcaste: 'smartha',
      occupation: 'doctor',
      company_name: 'Apollo Hospitals',
      annual_income: 3000000,
      education_level: 'phd',
      education_details: 'MBBS, MD from AIIMS Delhi',
      about_me: 'Doctor specializing in cardiology, passionate about helping others and traveling.',
      hobbies: ['medicine', 'research', 'fitness', 'photography'],
      profile_picture_url: 'https://randomuser.me/api/portraits/men/45.jpg',
      languages_known: ['English', 'Hindi', 'Marathi']
    }
  },
  {
    email: 'meera.krishnan@example.com',
    password: 'Password123!',
    profile: {
      first_name: 'Meera',
      last_name: 'Krishnan',
      display_name: 'Meera Krishnan',
      date_of_birth: '1996-11-20',
      gender: 'female',
      height: 160,
      marital_status: 'never_married',
      religion: 'hindu',
      caste: 'brahmin',
      subcaste: 'aiyangar',
      occupation: 'teacher',
      company_name: 'DAV School',
      annual_income: 800000,
      education_level: 'masters',
      education_details: 'M.A. in Education from University of Madras',
      about_me: 'Teacher and classical dancer, dedicated to preserving cultural traditions.',
      hobbies: ['dance', 'teaching', 'spirituality', 'cooking'],
      profile_picture_url: 'https://randomuser.me/api/portraits/women/35.jpg',
      languages_known: ['English', 'Tamil', 'Sanskrit']
    }
  },
  {
    email: 'rajesh.iyer@example.com',
    password: 'Password123!',
    profile: {
      first_name: 'Rajesh',
      last_name: 'Iyer',
      display_name: 'Rajesh Iyer',
      date_of_birth: '1990-07-05',
      gender: 'male',
      height: 172,
      marital_status: 'never_married',
      religion: 'hindu',
      caste: 'brahmin',
      subcaste: 'aiyar',
      occupation: 'business',
      company_name: 'Goldman Sachs',
      annual_income: 4500000,
      education_level: 'masters',
      education_details: 'MBA from IIM Ahmedabad',
      about_me: 'Investment banker with a love for classical music and hiking.',
      hobbies: ['hiking', 'music', 'stocks'],
      profile_picture_url: 'https://randomuser.me/api/portraits/men/12.jpg',
      languages_known: ['English', 'Tamil', 'Hindi']
    }
  },
  {
    email: 'sneha.kulkarni@example.com',
    password: 'Password123!',
    profile: {
      first_name: 'Sneha',
      last_name: 'Kulkarni',
      display_name: 'Sneha Kulkarni',
      date_of_birth: '1994-03-25',
      gender: 'female',
      height: 165,
      marital_status: 'never_married',
      religion: 'hindu',
      caste: 'brahmin',
      subcaste: 'other',
      occupation: 'software',
      company_name: 'Amazon',
      annual_income: 2800000,
      education_level: 'bachelors',
      education_details: 'B.E. Computer Science from COEP Pune',
      about_me: 'Software engineer who loves to travel and try new cuisines.',
      hobbies: ['travel', 'food', 'coding'],
      profile_picture_url: 'https://randomuser.me/api/portraits/women/65.jpg',
      languages_known: ['English', 'Marathi', 'Hindi']
    }
  }
];

const sampleEvents = [
  {
    title: 'Brahmin Community Meetup - Pune',
    description: 'A gathering for Brahmin families to network and discuss matrimonial prospects in a traditional setting.',
    event_date: '2026-03-10T17:00:00Z',
    location: 'Tilak Smarak Mandir, Pune',
    banner_image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500',
    max_participants: 150,
    registration_fee: 499,
    category: 'matrimony_meetup',
    event_type: 'meetup',
    status: 'published'
  },
  {
    title: 'Vedic Wedding Traditions Seminar',
    description: 'Learn about the significance of various rituals in a traditional Brahmin wedding.',
    event_date: '2026-03-22T11:00:00Z',
    location: 'Online Webinar',
    banner_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
    max_participants: 500,
    registration_fee: 0,
    category: 'webinar',
    event_type: 'webinar',
    status: 'published'
  }
];

async function seed() {
  console.log('🚀 Starting Seeding...');

  const userIds = [];

  for (const u of sampleUsers) {
    console.log(`Creating user: ${u.email}...`);
    
    // Check if user exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const foundUser = existingUser?.users.find(user => user.email === u.email);

    let userId;
    if (foundUser) {
      console.log(`User ${u.email} already exists.`);
      userId = foundUser.id;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true
      });

      if (error) {
        console.error(`Error creating user ${u.email}:`, error.message);
        continue;
      }
      userId = data.user.id;
      console.log(`User ${u.email} created.`);
    }
    userIds.push(userId);

    // Create profile
    console.log(`Creating profile for ${u.profile.display_name}...`);
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        ...u.profile,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error(`Error creating profile for ${u.profile.display_name}:`, profileError.message);
    } else {
      console.log(`Profile for ${u.profile.display_name} created/updated.`);
    }
  }

  // Get all profile IDs
  const { data: profiles } = await supabase.from('profiles').select('user_id');
  const profileUserIds = profiles.map(p => p.user_id);

  if (profileUserIds.length > 0) {
    console.log('Creating events...');
    for (const event of sampleEvents) {
      const { error: eventError } = await supabase
        .from('events')
        .insert({
          ...event,
          organizer_id: profileUserIds[0]
        });
      
      if (eventError) {
        console.error(`Error creating event ${event.title}:`, eventError.message);
      } else {
        console.log(`Event ${event.title} created.`);
      }
    }

    if (profileUserIds.length >= 2) {
      console.log('Creating matches and messages...');
      // Match first two
      const { error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: profileUserIds[0],
          user2_id: profileUserIds[1],
          status: 'accepted',
          compatibility_score: 85
        });
      
      if (matchError) {
        console.error('Error creating match:', matchError.message);
      } else {
        console.log('Sample match created.');
        
        // Message between them
        const { error: msgError } = await supabase
          .from('messages')
          .insert([
            {
              sender_id: profileUserIds[0],
              receiver_id: profileUserIds[1],
              content: 'Hi! I saw your profile and would love to connect.',
              read_at: new Date().toISOString()
            },
            {
              sender_id: profileUserIds[1],
              receiver_id: profileUserIds[0],
              content: 'Hello! Thanks for reaching out. I liked your profile too.',
              read_at: null
            }
          ]);
        
        if (msgError) {
          console.error('Error creating messages:', msgError.message);
        } else {
          console.log('Sample messages created.');
        }
      }
    }
  }

  console.log('✅ Seeding completed!');
}

seed().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
