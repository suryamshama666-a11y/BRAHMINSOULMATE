
import { ProfileLocation } from '@/data/profiles';

export const formatHeight = (heightInCm: number): string => {
  return `${heightInCm} cm`;
};

export const formatLocation = (location: ProfileLocation): string => {
  if (!location) return 'Location not specified';
  
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);
  
  return parts.join(', ');
};
