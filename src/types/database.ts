/**
 * Database Type Definitions
 * Comprehensive type definitions that match the Supabase database schema
 */

// Profile related types
export interface DatabaseProfile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  age: number;
  gender: string;
  images: string[];
  bio: string;
  location: ProfileLocation | null;
  religion: string;
  caste: string | null;
  subcaste: string | null;
  gotra: string | null;
  marital_status: 'never_married' | 'divorced' | 'widowed' | null;
  height: number;
  weight: number | null;
  complexion: string | null;
  education: ProfileEducation | null;
  employment: ProfileEmployment | null;
  annual_income: number | null;
  family: ProfileFamily | null;
  preferences: ProfilePreferences | null;
  horoscope: ProfileHoroscope | null;
  birth_time: string | null;
  birth_place: string | null;
  subscription_type: string;
  subscription_expiry: string | null;
  interests: string[];
  languages: string[];
  verified: boolean;
  last_active: string;
  privacy_settings: ProfilePrivacySettings | null;
  education_level: string | null;
  employment_status: string | null;
  annual_income_range: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  profile_picture_url: string | null;
  gallery_images: string[] | null;
  profile_visibility: string | null;
  profile_completion_percentage: number | null;
  verification_status: string | null;
}

export interface ProfileLocation {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
}

export interface ProfileEducation {
  level: string;
  field: string;
  institution: string;
  year_completed?: number;
}

export interface ProfileEmployment {
  profession: string;
  company: string;
  position: string;
  income_range: string;
  work_location?: string;
}

export interface ProfileFamily {
  father_occupation?: string;
  mother_occupation?: string;
  siblings?: number;
  family_type?: string;
  family_values?: string;
  about_family?: string;
  community?: string;
}

export interface ProfilePreferences {
  age_range?: { min: number; max: number };
  height_range?: { min: number; max: number };
  location_preference?: string[];
  education_preference?: string[];
  occupation_preference?: string[];
  caste_preference?: string[];
  marital_status_preference?: string[];
}

export interface ProfileHoroscope {
  birth_time?: string;
  birth_place?: string;
  moon_sign?: string;
  sun_sign?: string;
  nakshatra?: string;
  rashi?: string;
  charan?: string;
  gan?: string;
  nadi?: string;
  devak?: string;
  manglik?: boolean;
  horoscope_image?: string;
  birth_date?: string;
}

export interface ProfilePrivacySettings {
  show_last_active?: boolean;
  show_profile_views?: boolean;
}

// Message related types
export interface DatabaseMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  attachment_url?: string | null;
  read: boolean;
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
  type?: string;
}

// Match related types
export interface DatabaseMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  message?: string | null;
  compatibility_score?: number;
}

// Connection related types
export interface DatabaseConnection {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: 'pending' | 'active' | 'blocked';
  created_at: string;
  updated_at: string;
}

// Notification related types
export interface DatabaseNotification {
  id: string;
  user_id: string;
  type: 'new_message' | 'interest_received' | 'interest_accepted' | 'profile_view' | 'subscription_activated' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  action_url?: string | null;
  sender_id?: string | null;
  created_at: string;
}

// Payment related types
export interface DatabasePayment {
  id: string;
  user_id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  currency: string;
  plan: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Event related types
export interface DatabaseEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string | null;
  max_participants?: number | null;
  current_participants: number;
  price: number;
  organizer_id: string;
  created_at: string;
  updated_at?: string | null;
}

// Event participant types
export interface DatabaseEventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  payment_status: string;
}

// Favorite related types
export interface DatabaseFavorite {
  id: string;
  user_id: string;
  profile_id: string;
  created_at: string;
}

// Profile view types
export interface DatabaseProfileView {
  id: string;
  viewer_id: string;
  viewed_profile_id: string;
  viewed_at: string;
}

// Blocked user types
export interface DatabaseBlockedUser {
  id: string;
  user_id: string;
  blocked_user_id: string;
  created_at: string;
}

// User activity types
export interface DatabaseUserActivity {
  id: string;
  user_id: string;
  action: string;
  date: string;
  count: number;
}

// Push subscription types
export interface DatabasePushSubscription {
  id: string;
  user_id: string;
  subscription: Record<string, unknown>;
  created_at: string;
}

// Notification preference types
export interface DatabaseNotificationPreference {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  new_messages: boolean;
  new_interests: boolean;
  profile_views: boolean;
  marketing_emails: boolean;
  updated_at: string;
}

// V-Date types
export interface DatabaseVDate {
  id: string;
  requester_id: string;
  recipient_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  meeting_link?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// Success story types
export interface DatabaseSuccessStory {
  id: string;
  user1_id: string;
  user2_id: string;
  title: string;
  story: string;
  wedding_date?: string | null;
  images: string[];
  approved: boolean;
  created_at: string;
}

// User type (from auth.users)
export interface DatabaseUser {
  id: string;
  email: string;
  encrypted_password: string;
  email_confirmed_at: string | null;
  invited_at: string | null;
  confirmation_token: string | null;
  confirmed_at: string | null;
  confirmation_sent_at: string | null;
  recovery_token: string | null;
  recovery_sent_at: string | null;
  email_change_token_current: string | null;
  email_change: string | null;
  email_change_sent_at: string | null;
  last_sign_in_at: string | null;
  raw_app_meta_data: Record<string, unknown> | null;
  raw_user_meta_data: Record<string, unknown> | null;
  is_super_admin: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  phone_change: string | null;
  phone_change_token: string | null;
  phone_change_sent_at: string | null;
  email_change_token_new: string | null;
  banned_until: string | null;
  action_link: string | null;
  action_token: string | null;
  email_change_confirm_status: number | null;
  banned_at: string | null;
  instance_id: string | null;
  role: string | null;
  instance_id_2: string | null;
  aud: string | null;
  app_metadata: Record<string, unknown> | null;
  user_metadata: Record<string, unknown> | null;
  confirmationToken: string | null;
  recoveryToken: string | null;
  emailChangeTokenCurrent: string | null;
  emailChangeTokenNew: string | null;
  emailChangeConfirmStatus: number | null;
  reauthenticationToken: string | null;
  reauthenticationSentAt: string | null;
  bannedAt: string | null;
}

// Conversation type for messaging
export interface DatabaseConversation {
  profile: DatabaseProfile | null;
  lastMessage: DatabaseMessage | null;
  unreadCount: number;
}

// API Response wrapper
export interface DatabaseApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

// Search parameters
export interface ProfileSearchParams {
  gender?: 'male' | 'female';
  min_age?: number;
  max_age?: number;
  city?: string;
  religion?: string;
  limit?: number;
  offset?: number;
}

// Subscription plan types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  is_popular?: boolean;
}

// User subscription types
export interface DatabaseUserSubscription {
  id: string;
  user_id: string;
  plan_id?: string;
  plan?: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date?: string;
  end_date?: string;
  auto_renewal?: boolean;
  payment_id?: string;
}

// Type guards for runtime type checking
export const isDatabaseProfile = (obj: unknown): obj is DatabaseProfile => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'user_id' in obj;
};

export const isDatabaseMessage = (obj: unknown): obj is DatabaseMessage => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'sender_id' in obj;
};

export const isDatabaseMatch = (obj: unknown): obj is DatabaseMatch => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'user1_id' in obj;
};

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API endpoint types
export interface ApiEndpoints {
  profile: {
    getProfile: (id: string) => Promise<DatabaseApiResponse<DatabaseProfile>>;
    updateProfile: (data: Partial<DatabaseProfile>) => Promise<DatabaseApiResponse<DatabaseProfile>>;
    searchProfiles: (params: ProfileSearchParams) => Promise<DatabaseApiResponse<DatabaseProfile[]>>;
  };
  messages: {
    sendMessage: (data: { receiverId: string; content: string; type?: string }) => Promise<DatabaseApiResponse<DatabaseMessage>>;
    getMessages: (userId: string, limit?: number) => Promise<DatabaseApiResponse<DatabaseMessage[]>>;
    getConversations: () => Promise<DatabaseApiResponse<DatabaseConversation[]>>;
  };
  auth: {
    register: (data: { email: string; password: string; name: string }) => Promise<DatabaseApiResponse<DatabaseUser>>;
    login: (data: { email: string; password: string }) => Promise<DatabaseApiResponse<{ session: unknown }>>;
  };
}