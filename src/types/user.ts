/**
 * User and Profile related types
 */

export interface LocationData {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  age: number;
  gender: string;
  images: string[];
  bio: string;
  phone?: string;
  phone_number?: string;
  email?: string;
  location: LocationData | string;
  city?: string;
  state?: string;
  address?: string;
  religion: string;
  caste: string;
  subcaste?: string;
  gotra?: string;
  marital_status?: string;
  date_of_birth?: string;
  height: number;
  education?: {
    level: string;
    field: string;
    institution: string;
    year_completed?: number;
  };
  employment?: {
    profession: string;
    company: string;
    position: string;
    income_range: string;
    work_location?: string;
  };
  family?: {
    father_occupation?: string;
    mother_occupation?: string;
    siblings?: number;
    family_type?: string;
    family_values?: string;
    about_family?: string;
    community?: string;
  };
  preferences?: {
    age_range?: { min: number; max: number };
    height_range?: { min: number; max: number };
    location_preference?: string[];
    education_preference?: string[];
    occupation_preference?: string[];
    caste_preference?: string[];
    marital_status_preference?: string[];
  };
  horoscope?: {
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
  };
  subscription_type: string;
  subscription_status?: string;
  subscriptionStatus?: string;
  subscription_expiry?: string;
  subscriptionExpiryDate?: string;
  interests: string[];
  languages: string[];
  verified: boolean;
  created_at: string;
  updated_at?: string;
  last_active?: string;
  lastActive?: string;
  profile_picture?: string;
  profilePicture?: string;
  profileNameVisibility?: string;
  occupation?: string;
  profession?: string;
  role?: string;
  privacy_settings?: {
    show_online_status?: boolean;
    show_profile_to?: 'all' | 'matches' | 'none';
    show_photos_to?: 'all' | 'matches' | 'none';
    show_contact_info_to?: 'all' | 'matches' | 'none';
  };
  account_status?: 'active' | 'inactive' | 'suspended';
  profile_completion?: number;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_active?: boolean;
  is_banned?: boolean;
  deleted_at?: string;
  last_seen_at?: string;
  location_city?: string;
  location_state?: string;
  education_level?: string;
  unreadMessages?: number;
}
