/**
 * Core type definitions for the application
 */

// User Profile Types
export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  images: string[];
  bio: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  religion: string;
  caste: string;
  subcaste: string | null;
  marital_status: 'never_married' | 'divorced' | 'widowed' | 'separated';
  height: number; // in cm
  education: {
    level: string;
    field: string;
    institution: string;
    year_completed?: number;
  };
  employment: {
    profession: string;
    company: string;
    position: string;
    income_range: string;
    work_location?: string;
  };
  family: {
    father_occupation: string;
    mother_occupation: string;
    siblings: number;
    family_type: 'nuclear' | 'joint' | 'other';
    family_values: string;
    about_family: string;
  };
  preferences: {
    age_range: { min: number; max: number };
    height_range: { min: number; max: number };
    location_preference: string[];
    education_preference: string[];
    occupation_preference: string[];
    caste_preference: string[];
    marital_status_preference?: ('never_married' | 'divorced' | 'widowed' | 'separated')[];
  };
  horoscope: {
    birth_time: string;
    birth_place: string;
    moon_sign: string;
    sun_sign: string;
    nakshatra: string;
    manglik: boolean;
    horoscope_image?: string;
  };
  subscription_type: 'free' | 'premium' | 'gold';
  subscription_expiry?: string;
  interests: string[];
  languages: string[];
  verified: boolean;
  created_at: string;
  updated_at: string;
  last_active: string;
  privacy_settings?: {
    show_online_status: boolean;
    show_profile_to: 'all' | 'matches' | 'none';
    show_photos_to: 'all' | 'matches' | 'none';
    show_contact_info_to: 'all' | 'matches' | 'none';
  };
  account_status?: 'active' | 'inactive' | 'suspended';
  profile_completion?: number; // percentage of profile completed
}

// Auth Types
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Session {
  user: User;
  access_token: string;
  expires_at: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Match Types
export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
  match_percentage?: number;
  user_profile?: UserProfile;
}

// Message Types
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string | null;
  created_at: string;
  read_at?: string | null;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_id?: string;
  last_message_content?: string;
  last_message_time?: string;
  unread_count?: number;
  created_at: string;
  updated_at: string;
  partner_id?: string;
  partner_profile?: UserProfile;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  max_participants?: number;
  current_participants: number;
  price?: number;
  organizer_id: string;
  created_at: string;
}

// Subscription Plan Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  is_popular?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  payment_id?: string;
}

// API Response Types
export interface APIResponse<T> {
  data: T | null;
  error: string | null;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  agree_terms: boolean;
}

export interface ProfileFormData extends Partial<UserProfile> {
  // Additional fields specific to forms
}

// Component Prop Types
export interface ProfileCardProps {
  profile: UserProfile;
  onClick?: (profile: UserProfile) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl';
  ripple?: boolean;
}

// Context Types
export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'match' | 'message' | 'profile_view' | 'interest' | 'system';
  content: string;
  related_user_id?: string;
  related_entity_id?: string;
  read: boolean;
  created_at: string;
} 