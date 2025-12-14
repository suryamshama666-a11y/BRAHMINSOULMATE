// Common types used across the application

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number;
  religion: string;
  caste: string;
  gotra?: string;
  location: string;
  education: string;
  profession?: string;
  occupation?: string;
  subscription_type: 'premium' | 'free';
  lastActive?: string;
  profile_picture?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  status: 'pending' | 'viewed' | 'interested';
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
}

export interface Interest {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender?: UserProfile;
  receiver?: UserProfile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  read_at?: string;
  sender?: UserProfile;
  receiver?: UserProfile;
}

export interface Conversation {
  user_id: string;
  full_name: string;
  profile_picture?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}
