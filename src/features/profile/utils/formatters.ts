
import { ProfileLocation } from '@/data/profiles';

export const formatHeight = (heightInCm: number): string => {
  const feet = Math.floor(heightInCm / 30.48);
  const inches = Math.round((heightInCm - feet * 30.48) / 2.54);
  
  if (inches === 12) {
    return `${feet + 1}'0"`;
  }
  
  return `${feet}'${inches}"`;
};

export const formatLocation = (location: ProfileLocation): string => {
  if (!location) return 'Location not specified';
  
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);
  
  return parts.join(', ');
};
