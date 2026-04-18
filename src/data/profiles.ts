import { Profile } from '@/types/profile';
import { profiles as profileData } from './profileData';

// Export proper types from types/profile
export type { 
  Profile,
  ProfileGender, 
  ProfileMaritalStatus, 
  BrahminSubcaste, 
  Gotra, 
  IshtaDevata,
  Rashi,
  ProfileLocation,
  ProfileFamily,
  ProfileEmployment,
  ProfileHoroscope,
  ProfileEducation,
  ProfilePreference
} from '@/types/profile';

export const profiles = profileData || [];

export const getAllProfiles = (): Profile[] => {
  try {
    if (!profileData || !Array.isArray(profileData)) {
      console.warn('Profile data is not available or not an array');
      return [];
    }
    return profileData;
  } catch (error) {
    console.error('Error loading profile data:', error);
    return [];
  }
};

export const getProfileById = (id: string): Profile | undefined => {
  try {
    if (!profileData || !Array.isArray(profileData)) {
      console.warn('Profile data is not available or not an array');
      return undefined;
    }
    return profileData.find(profile => profile.id === id);
  } catch (error) {
    console.error(`Error finding profile with ID ${id}:`, error);
    return undefined;
  }
};

export const getFilteredProfiles = (filter: any): Profile[] => {
  try {
    const allProfiles = getAllProfiles();
    if (!filter || Object.keys(filter).length === 0) {
      return allProfiles;
    }
    
    // Apply filters here (simplified example)
    return allProfiles;
  } catch (error) {
    console.error('Error filtering profiles:', error);
    return [];
  }
};
