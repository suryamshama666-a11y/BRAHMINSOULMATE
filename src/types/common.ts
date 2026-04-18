/**
 * Common types and UI-related interfaces
 */

import { UserProfile } from './user';

import { APIResponse } from './errors';
export type { APIResponse };

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
