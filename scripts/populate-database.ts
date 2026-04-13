import { createClient } from '@supabase/supabase-js';
import { profiles as profileData } from '../src/data/profileData';

// Supabase configuration
const supabaseUrl = 'https://pgiivokemegrlevfzezg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample user data for authentication
const sampleUsers = [
  {
    email: 'aditya.sharma@example.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Aditya',
      last_name: 'Sharma'
    }
  },
  {
    email: 'priya.iyer@example.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Priya',
      last_name: 'Iyer'
    }
  },
  {
    email: 'kavya.nambiar@example.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Kavya',
      last_name: 'Nambiar'
    }
  },
  {
    email: 'arjun.desai@example.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Arjun',
      last_name: 'Desai'
    }
  },
  {
    email: 'meera.krishnan@example.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Meera',
      last_name: 'Krishnan'
    }
  }
];

// Sample events data
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

// Sample forum posts
const _sampleForumPosts = [
  {
    title: 'How to approach family about modern wedding ideas?',
    content: 'I want to incorporate some modern elements in my wedding but my family is very traditional. How do I find a balance that makes everyone happy?',
    category_id: null, // Will be set after categories are created
    author_id: null,   // Will be set after users are created
    tags: ['wedding', 'tradition', 'modern'],
    upvotes: 15,
    downvotes: 2
  },
  {
    title: 'Our Arranged Marriage Success Story',
    content: 'We met through our families 2 years ago and got married last month. Here\'s how we made it work and fell in love...',
    category_id: null,
    author_id: null,
    tags: ['success-story', 'arranged-marriage', 'love'],
    upvotes: 28,
    downvotes: 0
  },
  {
    title: 'Horoscope Matching - How Important Is It?',
    content: 'What are your thoughts on horoscope matching? Is it essential for a successful marriage?',
    category_id: null,
    author_id: null,
    tags: ['horoscope', 'astrology', 'compatibility'],
    upvotes: 12,
    downvotes: 5
  }
];

async function createUsers() {
  console.log('Creating sample users...');
  const createdUsers = [];
  
  for (const userData of sampleUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true
      });
      
      if (error) {
        console.error(`Error creating user ${userData.email}:`, error);
      } else {
        console.log(`✓ Created user: ${userData.email}`);
        createdUsers.push(data.user);
      }
    } catch (error) {
      console.error(`Exception creating user ${userData.email}:`, error);
    }
  }
  
  return createdUsers;
}

async function populateProfiles(users: any[]) {
  console.log('Populating profiles...');
  
  // Take first few profiles from our sample data
  const profilesToCreate = profileData.slice(0, Math.min(users.length, 20));
  
  for (let i = 0; i < profilesToCreate.length && i < users.length; i++) {
    const profile = profilesToCreate[i];
    const user = users[i];
    
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          images: profile.images,
          bio: profile.about,
          location: profile.location,
          religion: profile.religion,
          caste: profile.caste,
          subcaste: profile.subcaste,
          marital_status: profile.maritalStatus,
          height: profile.height,
          education: profile.education,
          employment: profile.employment,
          family: profile.family,
          preferences: profile.preferences,
          horoscope: profile.horoscope,
          interests: profile.interests || [],
          languages: profile.languages || [],
          verified: Math.random() > 0.5,
          last_active: new Date()
        });
      
      if (error) {
        console.error(`Error creating profile for ${profile.name}:`, error);
      } else {
        console.log(`✓ Created profile: ${profile.name}`);
      }
    } catch (error) {
      console.error(`Exception creating profile for ${profile.name}:`, error);
    }
  }
}

async function populateEvents() {
  console.log('Creating sample events...');
  
  // Get a random organizer from profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (!profiles || profiles.length === 0) {
    console.log('No profiles found, skipping events creation');
    return;
  }
  
  const organizerId = profiles[0].id;
  
  for (const event of sampleEvents) {
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          ...event,
          organizer_id: organizerId
        });
      
      if (error) {
        console.error(`Error creating event ${event.title}:`, error);
      } else {
        console.log(`✓ Created event: ${event.title}`);
      }
    } catch (error) {
      console.error(`Exception creating event ${event.title}:`, error);
    }
  }
}

async function createMatches() {
  console.log('Creating sample matches...');
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id');
  
  if (!profiles || profiles.length < 2) {
    console.log('Not enough profiles for matches');
    return;
  }
  
  // Create some random matches
  for (let i = 0; i < Math.min(10, profiles.length - 1); i++) {
    const user1 = profiles[i];
    const user2 = profiles[i + 1] || profiles[0];
    
    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          user_id: user1.id,
          match_id: user2.id,
          status: Math.random() > 0.5 ? 'accepted' : 'pending'
        });
      
      if (error) {
        console.error('Error creating match:', error);
      } else {
        console.log(`✓ Created match between profiles`);
      }
    } catch (error) {
      console.error('Exception creating match:', error);
    }
  }
}

async function createSampleMessages() {
  console.log('Creating sample messages...');
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id');
  
  if (!profiles || profiles.length < 2) {
    console.log('Not enough profiles for messages');
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
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: profiles[i].id,
          receiver_id: profiles[i + 1].id,
          content: sampleMessages[i],
          read: Math.random() > 0.5
        });
      
      if (error) {
        console.error('Error creating message:', error);
      } else {
        console.log(`✓ Created message`);
      }
    } catch (error) {
      console.error('Exception creating message:', error);
    }
  }
}

async function main() {
  console.log('🚀 Starting database population...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Test connection
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error);
      return;
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Create users and populate data
    const users = await createUsers();
    await populateProfiles(users);
    await populateEvents();
    await createMatches();
    await createSampleMessages();
    
    console.log('🎉 Database population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${users.length} users`);
    console.log(`- Created ${Math.min(users.length, 20)} profiles`);
    console.log(`- Created ${sampleEvents.length} events`);
    console.log('- Created sample matches and messages');
    
  } catch (error) {
    console.error('❌ Error during population:', error);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { main as populateDatabase };
