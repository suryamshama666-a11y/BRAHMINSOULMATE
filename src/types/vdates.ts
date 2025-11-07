
export type VDateStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
export type VDateType = 'video' | 'coffee' | 'activity' | 'game' | 'cooking' | 'movie';
export type CallQuality = 'excellent' | 'good' | 'fair' | 'poor';

export interface VDate {
  id: string;
  participantIds: [string, string];
  initiatorId: string;
  date: string;
  time: string;
  type: VDateType;
  status: VDateStatus;
  title?: string;
  description?: string;
  duration: number; // in minutes
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
  reminderSent?: boolean;
  feedback?: VDateFeedback[];
  recording?: {
    url: string;
    consent: boolean;
  };
}

export interface VDateFeedback {
  userId: string;
  rating: number; // 1-5
  comment?: string;
  connectionQuality?: CallQuality;
  wouldMeetAgain: boolean;
  submittedAt: Date;
}

export interface VDateInvitation {
  id: string;
  fromUserId: string;
  toUserId: string;
  vdateId: string;
  message?: string;
  status: 'sent' | 'accepted' | 'declined';
  createdAt: Date;
  respondedAt?: Date;
}

export interface VDateTemplate {
  id: string;
  name: string;
  type: VDateType;
  description: string;
  duration: number;
  activities: string[];
  icon: string;
  isPremium: boolean;
}

export interface UserAvailability {
  userId: string;
  timezone: string;
  weeklySchedule: {
    [key: string]: { // 'monday', 'tuesday', etc.
      available: boolean;
      timeSlots: string[]; // ['09:00', '10:00', '14:00']
    };
  };
  blackoutDates: string[]; // dates user is unavailable
  preferredDuration: number;
  maxDatesPerWeek: number;
}
