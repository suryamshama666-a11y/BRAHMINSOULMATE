/**
 * Mock profile data for development/demo purposes.
 * Used as fallback when no real profiles are available in the database.
 */

export interface MockProfile {
  id: string;
  first_name: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  occupation: string;
  profile_picture_url: string;
  subscription_type: string;
  gotra: string;
  height?: number;
}

const FEMALE_ONLINE: MockProfile[] = [
  { id: 'online1', first_name: 'Priya', age: 26, gender: 'female', city: 'Mumbai', state: 'Maharashtra', occupation: 'Software Engineer', profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', subscription_type: 'premium', gotra: 'Kashyap Gotra' },
  { id: 'online2', first_name: 'Anjali', age: 24, gender: 'female', city: 'Bangalore', state: 'Karnataka', occupation: 'Doctor', profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', subscription_type: 'free', gotra: 'Bharadwaja Gotra' },
  { id: 'online3', first_name: 'Kavya', age: 27, gender: 'female', city: 'Chennai', state: 'Tamil Nadu', occupation: 'Teacher', profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', subscription_type: 'premium', gotra: 'Vasishtha Gotra' },
  { id: 'online4', first_name: 'Meera', age: 25, gender: 'female', city: 'Pune', state: 'Maharashtra', occupation: 'CA', profile_picture_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop', subscription_type: 'free', gotra: 'Atri Gotra' },
  { id: 'online5', first_name: 'Divya', age: 28, gender: 'female', city: 'Hyderabad', state: 'Telangana', occupation: 'Architect', profile_picture_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', subscription_type: 'premium', gotra: 'Gautam Gotra' },
  { id: 'online6', first_name: 'Sneha', age: 23, gender: 'female', city: 'Delhi', state: 'Delhi', occupation: 'Designer', profile_picture_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop', subscription_type: 'free', gotra: 'Jamadagni Gotra' },
  { id: 'online7', first_name: 'Riya', age: 26, gender: 'female', city: 'Kolkata', state: 'West Bengal', occupation: 'Lawyer', profile_picture_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop', subscription_type: 'premium', gotra: 'Kashyap Gotra' },
  { id: 'online8', first_name: 'Neha', age: 25, gender: 'female', city: 'Jaipur', state: 'Rajasthan', occupation: 'Manager', profile_picture_url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop', subscription_type: 'free', gotra: 'Bharadwaja Gotra' },
];

const MALE_ONLINE: MockProfile[] = [
  { id: 'online1', first_name: 'Rahul', age: 28, gender: 'male', city: 'Mumbai', state: 'Maharashtra', occupation: 'Software Engineer', profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', subscription_type: 'premium', gotra: 'Kashyap Gotra' },
  { id: 'online2', first_name: 'Aditya', age: 30, gender: 'male', city: 'Bangalore', state: 'Karnataka', occupation: 'Doctor', profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', subscription_type: 'free', gotra: 'Bharadwaja Gotra' },
  { id: 'online3', first_name: 'Vikram', age: 27, gender: 'male', city: 'Chennai', state: 'Tamil Nadu', occupation: 'Lawyer', profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', subscription_type: 'premium', gotra: 'Vasishtha Gotra' },
  { id: 'online4', first_name: 'Arjun', age: 29, gender: 'male', city: 'Pune', state: 'Maharashtra', occupation: 'CA', profile_picture_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop', subscription_type: 'free', gotra: 'Atri Gotra' },
  { id: 'online5', first_name: 'Karthik', age: 26, gender: 'male', city: 'Hyderabad', state: 'Telangana', occupation: 'Architect', profile_picture_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', subscription_type: 'premium', gotra: 'Gautam Gotra' },
  { id: 'online6', first_name: 'Sanjay', age: 31, gender: 'male', city: 'Delhi', state: 'Delhi', occupation: 'Business', profile_picture_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop', subscription_type: 'free', gotra: 'Jamadagni Gotra' },
  { id: 'online7', first_name: 'Rohan', age: 28, gender: 'male', city: 'Kolkata', state: 'West Bengal', occupation: 'Engineer', profile_picture_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop', subscription_type: 'premium', gotra: 'Kashyap Gotra' },
  { id: 'online8', first_name: 'Amit', age: 29, gender: 'male', city: 'Jaipur', state: 'Rajasthan', occupation: 'Manager', profile_picture_url: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop', subscription_type: 'free', gotra: 'Bharadwaja Gotra' },
];

const FEMALE_NEW: MockProfile[] = [
  { id: 'new1', first_name: 'Lakshmi', age: 25, gender: 'female', city: 'Coimbatore', state: 'Tamil Nadu', occupation: 'Engineer', profile_picture_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150', subscription_type: 'premium', gotra: 'Kashyap Gotra', height: 162 },
  { id: 'new2', first_name: 'Radha', age: 24, gender: 'female', city: 'Mysore', state: 'Karnataka', occupation: 'Pharmacist', profile_picture_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', subscription_type: 'free', gotra: 'Bharadwaja Gotra', height: 158 },
  { id: 'new3', first_name: 'Geetha', age: 26, gender: 'female', city: 'Kochi', state: 'Kerala', occupation: 'Banker', profile_picture_url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150', subscription_type: 'premium', gotra: 'Vasishtha Gotra', height: 160 },
  { id: 'new4', first_name: 'Sita', age: 27, gender: 'female', city: 'Jaipur', state: 'Rajasthan', occupation: 'Professor', profile_picture_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150', subscription_type: 'free', gotra: 'Atri Gotra', height: 165 },
];

const MALE_NEW: MockProfile[] = [
  { id: 'new1', first_name: 'Suresh', age: 29, gender: 'male', city: 'Coimbatore', state: 'Tamil Nadu', occupation: 'Engineer', profile_picture_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', subscription_type: 'premium', gotra: 'Kashyap Gotra', height: 175 },
  { id: 'new2', first_name: 'Ganesh', age: 28, gender: 'male', city: 'Mysore', state: 'Karnataka', occupation: 'Pharmacist', profile_picture_url: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150', subscription_type: 'free', gotra: 'Bharadwaja Gotra', height: 172 },
  { id: 'new3', first_name: 'Mohan', age: 30, gender: 'male', city: 'Kochi', state: 'Kerala', occupation: 'Banker', profile_picture_url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150', subscription_type: 'premium', gotra: 'Vasishtha Gotra', height: 178 },
  { id: 'new4', first_name: 'Krishna', age: 27, gender: 'male', city: 'Jaipur', state: 'Rajasthan', occupation: 'Professor', profile_picture_url: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150', subscription_type: 'free', gotra: 'Atri Gotra', height: 170 },
];

const FEMALE_RECOMMENDED: MockProfile[] = [
  { id: 'rec1', first_name: 'Ananya', age: 25, gender: 'female', city: 'Ahmedabad', state: 'Gujarat', occupation: 'Data Scientist', profile_picture_url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150', subscription_type: 'premium', gotra: 'Gautam Gotra', height: 163 },
  { id: 'rec2', first_name: 'Pooja', age: 26, gender: 'female', city: 'Lucknow', state: 'Uttar Pradesh', occupation: 'Marketing Manager', profile_picture_url: 'https://images.unsplash.com/photo-1464863979621-258859e62245?w=150', subscription_type: 'free', gotra: 'Jamadagni Gotra', height: 157 },
  { id: 'rec3', first_name: 'Nisha', age: 24, gender: 'female', city: 'Indore', state: 'Madhya Pradesh', occupation: 'HR Manager', profile_picture_url: 'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=150', subscription_type: 'premium', gotra: 'Vishwamitra Gotra', height: 161 },
  { id: 'rec4', first_name: 'Swati', age: 27, gender: 'female', city: 'Nagpur', state: 'Maharashtra', occupation: 'Consultant', profile_picture_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150', subscription_type: 'free', gotra: 'Agastya Gotra', height: 159 },
];

const MALE_RECOMMENDED: MockProfile[] = [
  { id: 'rec1', first_name: 'Ravi', age: 29, gender: 'male', city: 'Ahmedabad', state: 'Gujarat', occupation: 'Data Scientist', profile_picture_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', subscription_type: 'premium', gotra: 'Gautam Gotra', height: 176 },
  { id: 'rec2', first_name: 'Amit', age: 30, gender: 'male', city: 'Lucknow', state: 'Uttar Pradesh', occupation: 'Marketing Manager', profile_picture_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150', subscription_type: 'free', gotra: 'Jamadagni Gotra', height: 174 },
  { id: 'rec3', first_name: 'Deepak', age: 28, gender: 'male', city: 'Indore', state: 'Madhya Pradesh', occupation: 'HR Manager', profile_picture_url: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=150', subscription_type: 'premium', gotra: 'Vishwamitra Gotra', height: 177 },
  { id: 'rec4', first_name: 'Nikhil', age: 31, gender: 'male', city: 'Nagpur', state: 'Maharashtra', occupation: 'Consultant', profile_picture_url: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=150', subscription_type: 'free', gotra: 'Agastya Gotra', height: 173 },
];

export function getMockOnlineProfiles(oppositeGender: string): MockProfile[] {
  return oppositeGender === 'female' ? FEMALE_ONLINE : MALE_ONLINE;
}

export function getMockNewProfiles(oppositeGender: string): MockProfile[] {
  return oppositeGender === 'female' ? FEMALE_NEW : MALE_NEW;
}

export function getMockRecommendedProfiles(oppositeGender: string): MockProfile[] {
  return oppositeGender === 'female' ? FEMALE_RECOMMENDED : MALE_RECOMMENDED;
}
