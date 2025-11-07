
import { Profile, ProfileGender, ProfileMaritalStatus, Gotra, BrahminSubcaste, Rashi, IshtaDevata } from '@/types/profile';
import { profiles } from '@/data/profileData';
import { ProfileLocation } from '@/data/profileTypes';

export const getProfileByUserId = (userId: string): Profile | undefined => {
  return profiles.find(profile => profile.userId === userId);
};

export const getAllProfiles = (): Profile[] => {
  return profiles;
};

export const getFilteredProfiles = (
  gender?: ProfileGender,
  minAge?: number,
  maxAge?: number,
  maritalStatus?: ProfileMaritalStatus,
  location?: ProfileLocation,
  gotra?: Gotra,
  excludeGotra?: Gotra,
  subcaste?: BrahminSubcaste,
  rashi?: Rashi,
  ishtaDevata?: IshtaDevata,
): Profile[] => {
  return profiles.filter(profile => {
    if (gender && profile.gender !== gender) return false;
    if (minAge && profile.age < minAge) return false;
    if (maxAge && profile.age > maxAge) return false;
    if (maritalStatus && profile.maritalStatus !== maritalStatus) return false;
    
    if (location) {
      if (location.country && profile.location.country !== location.country) return false;
      if (location.state && profile.location.state !== location.state) return false;
      if (location.city && profile.location.city !== location.city) return false;
    }
    
    if (gotra && profile.family?.gotra !== gotra) return false;
    if (excludeGotra && profile.family?.gotra === excludeGotra) return false;
    if (subcaste && profile.family?.subcaste !== subcaste) return false;
    if (rashi && profile.horoscope?.rashi !== rashi) return false;
    if (ishtaDevata && profile.family?.ishtaDevata !== ishtaDevata) return false;
    
    return true;
  });
};

export const searchProfiles = (searchTerm: string): Profile[] => {
  if (!searchTerm) return profiles;
  
  const term = searchTerm.toLowerCase().trim();
  
  return profiles.filter(profile => {
    if (profile.name.toLowerCase().includes(term)) return true;
    const locationString = `${profile.location.city} ${profile.location.state || ''} ${profile.location.country}`.toLowerCase();
    if (locationString.includes(term)) return true;
    if (profile.family?.gotra?.toLowerCase().includes(term)) return true;
    return false;
  });
};

export const getAllCountries = (): string[] => {
  const countrySet = new Set(profiles.map(profile => profile.location.country));
  return Array.from(countrySet).sort();
};

export const getAllStates = (country?: string): string[] => {
  const filteredProfiles = country 
    ? profiles.filter(profile => profile.location.country === country)
    : profiles;
  
  const stateSet = new Set(
    filteredProfiles
      .map(profile => profile.location.state)
      .filter((state): state is string => state !== undefined)
  );
  
  return Array.from(stateSet).sort();
};

export const getAllCities = (country?: string, state?: string): string[] => {
  let filteredProfiles = profiles;
  
  if (country) {
    filteredProfiles = filteredProfiles.filter(profile => profile.location.country === country);
  }
  
  if (state) {
    filteredProfiles = filteredProfiles.filter(profile => profile.location.state === state);
  }
  
  const citySet = new Set(filteredProfiles.map(profile => profile.location.city));
  return Array.from(citySet).sort();
};

export const getAllGotras = (): Gotra[] => {
  const gotraSet = new Set(
    profiles
      .map(profile => profile.family?.gotra)
      .filter((gotra): gotra is Gotra => gotra !== undefined)
  );
  return Array.from(gotraSet).sort() as Gotra[];
};

export const getAllSubcastes = (): BrahminSubcaste[] => {
  const subcasteSet = new Set(
    profiles
      .map(profile => profile.family?.subcaste)
      .filter((subcaste): subcaste is BrahminSubcaste => subcaste !== undefined)
  );
  return Array.from(subcasteSet).sort() as BrahminSubcaste[];
};

export const getAllRashis = (): Rashi[] => {
  const rashiSet = new Set(
    profiles
      .map(profile => profile.horoscope?.rashi)
      .filter((rashi): rashi is Rashi => rashi !== undefined)
  );
  return Array.from(rashiSet).sort() as Rashi[];
};

export const getAllIshtaDevatas = (): IshtaDevata[] => {
  const ishtaDevataSet = new Set(
    profiles
      .map(profile => profile.family?.ishtaDevata)
      .filter((ishtaDevata): ishtaDevata is IshtaDevata => ishtaDevata !== undefined)
  );
  return Array.from(ishtaDevataSet).sort() as IshtaDevata[];
};

export const getAllMaritalStatuses = (): ProfileMaritalStatus[] => {
  return [
    'Never Married',
    'Widowed',
    'Divorced',
    'Separated',
    'Awaiting Divorce'
  ];
};
