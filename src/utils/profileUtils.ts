import { UserProfile } from '@/types';
import { ProfileRow, isProfileRow } from '@/types/supabase-extended';
import { Rashi, IshtaDevata } from '@/types/profile';
import { profiles } from '@/data/profileData';

/**
 * Get all Rashi values from profiles
 */
export const getAllRashisData = (): Rashi[] => {
  const rashiSet = new Set(
    profiles
      .map(profile => profile.horoscope?.rashi)
      .filter((rashi): rashi is Rashi => rashi !== undefined)
  );
  return Array.from(rashiSet).sort() as Rashi[];
};

/**
 * Get all Ishta Devata values from profiles
 */
export const getAllIshtaDevatasData = (): IshtaDevata[] => {
  const ishtaDevataSet = new Set(
    profiles
      .map(profile => profile.family?.ishtaDevata)
      .filter((ishtaDevata): ishtaDevata is IshtaDevata => ishtaDevata !== undefined)
  );
  return Array.from(ishtaDevataSet).sort() as IshtaDevata[];
};

/**
 * Helper to map database response to UserProfile
 * Handles JSON parsing of Supabase columns
 */
export const mapToUserProfile = (row: unknown): UserProfile => {
  const typedRow = row as ProfileRow;
  // Create base object - exclude JSON fields that need parsing/casting
  const { 
    location, education, employment, family, preferences, horoscope, privacy_settings, 
    ...scalarFields 
  } = typedRow;
  
  const profile: Partial<UserProfile> = { ...scalarFields };

  // Explicitly parse JSON fields if they are strings
  const jsonFields = ['location', 'education', 'employment', 'family', 'preferences', 'horoscope', 'privacy_settings'];
  
  jsonFields.forEach(field => {
    const value = typedRow[field as keyof ProfileRow];
    if (value) {
      if (typeof value === 'string') {
        try {
          profile[field as keyof UserProfile] = JSON.parse(value) as any;
        } catch (e) {
          console.error(`Failed to parse ${field}:`, e);
          // Use null instead of corrupted data to prevent type errors
          profile[field as keyof UserProfile] = null as any;
        }
      } else {
        profile[field as keyof UserProfile] = value as any;
      }
    }
  });

  return profile as UserProfile;
};

/**
 * Metadata Helpers for search and registration
 */

export const getAllGotras = (): string[] => [
  'Bharadwaj', 'Kashyap', 'Vashistha', 'Vishvamitra', 'Gautam', 
  'Jamadagni', 'Atri', 'Agastya', 'Angiras', 'Shandilya',
  'Garga', 'Parashara', 'Harita', 'Kaudinya', 'Vatsa'
];

export const getAllMaritalStatuses = (): string[] => [
  'Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce', 'Annulled'
];

export const getAllSubcastes = (): string[] => [
  'Iyer', 'Iyengar', 'Saraswat', 'Gaud', 'Kanyakubja', 
  'Maithil', 'Utkal', 'Nambudiri', 'Deshastha', 'Chitpavan',
  'Karhade', 'Pancham Gauda', 'Pancha Dravida'
];

export const getAllRashis = (): string[] => [
  'Mesh', 'Vrushabh', 'Mithun', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrushchik', 'Dhanu', 'Makar', 'Kumbha', 'Meen'
];

export const getAllIshtaDevatas = (): string[] => [
  'Shiva', 'Vishnu', 'Ganesha', 'Durga', 'Lakshmi', 'Saraswati',
  'Hanuman', 'Rama', 'Krishna', 'Dattatreya', 'Venkateswara'
];

/**
 * Calculate profile completion percentage
 */
export const calculateProfileCompletion = (profile: Partial<UserProfile>): number => {
  const fields = [
    profile.name,
    profile.age,
    profile.gender,
    profile.images && profile.images.length > 0,
    profile.bio,
    profile.location,
    profile.religion,
    profile.caste,
    profile.marital_status,
    profile.height,
    profile.education,
    profile.employment,
    profile.family,
    profile.preferences,
    profile.gotra,
    profile.subcaste
  ];

  const completedFields = fields.filter(field => {
    if (typeof field === 'object' && field !== null) {
      return Object.keys(field).length > 0;
    }
    return !!field;
  }).length;

  return Math.round((completedFields / fields.length) * 100);
};
