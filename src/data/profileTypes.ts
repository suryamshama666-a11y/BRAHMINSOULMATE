import { BrahminSubcaste, Gotra, IshtaDevata, Rashi, ProfileMaritalStatus } from '@/types/profile';

export type ProfileLocation = {
  country: string;
  state?: string;
  city: string;
};

export type ProfileEducation = {
  degree: string;
  institution: string;
  year: number;
};

export type ProfileEmployment = {
  profession: string;
  company?: string;
  position?: string;
  income?: string;
};

export type ProfileFamily = {
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  siblings?: number;
  familyType?: 'joint' | 'nuclear';
  gotra?: Gotra;
  subcaste?: BrahminSubcaste;
  ishtaDevata?: IshtaDevata;
};

export type ProfileHoroscope = {
  rashi?: Rashi;
  nakshatra?: string;
  manglik?: boolean;
  matchingRequired?: boolean;
  birthDateTime?: string;
  birthPlace?: string;
  ascendant?: string;
  navamsa?: string;
  kundaliFile?: string;
  kundaliPermission?: 'public' | 'private' | 'matches';
  doshas?: {
    mangal?: boolean;
    nadi?: boolean;
    bhakoot?: boolean;
    gana?: boolean;
  };
  gunaPoints?: number;
};

export type ProfilePreference = {
  ageRange?: [number, number];
  heightRange?: [number, number];
  education?: string[];
  profession?: string[];
  maritalStatus?: ProfileMaritalStatus[];
  locationPreferences?: {
    countries?: string[];
    states?: string[];
    cities?: string[];
  };
  manglik?: boolean | null;
  excludeMyGotra?: boolean;
  acceptedGotras?: Gotra[];
  subcaste?: BrahminSubcaste[];
  rashi?: Rashi[];
  ishtaDevata?: IshtaDevata[];
  horoscopeWeightage?: {
    rashiCompatibility?: number;
    nakshatraCompatibility?: number;
    gunaMatch?: number;
    doshaCheck?: number;
  };
};
