import { VDate, VDateInvitation, VDateTemplate, UserAvailability } from '@/types/vdates';
import { getAllProfiles } from '@/data/profiles';

const profiles = getAllProfiles();

// Helper to get dates relative to today
const getRelativeDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const getRelativeDateObject = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

export const vdateTemplates: VDateTemplate[] = [
  {
    id: 'video-chat',
    name: 'Video Chat',
    type: 'video',
    description: 'A casual video conversation to get to know each other',
    duration: 30,
    activities: ['Introduction', 'Getting to know each other', 'Future plans discussion'],
    icon: 'video',
    isPremium: false
  },
  {
    id: 'virtual-coffee',
    name: 'Virtual Coffee Date',
    type: 'coffee',
    description: 'Share a coffee or tea while chatting virtually',
    duration: 45,
    activities: ['Coffee/tea preparation', 'Life stories', 'Interests discussion'],
    icon: 'coffee',
    isPremium: false
  },
  {
    id: 'cooking-together',
    name: 'Cook Together',
    type: 'cooking',
    description: 'Prepare a meal together while video chatting',
    duration: 90,
    activities: ['Recipe selection', 'Cooking preparation', 'Meal sharing'],
    icon: 'chef-hat',
    isPremium: true
  },
  {
    id: 'movie-night',
    name: 'Virtual Movie Night',
    type: 'movie',
    description: 'Watch a movie together with synchronized playback',
    duration: 120,
    activities: ['Movie selection', 'Synchronized viewing', 'Discussion'],
    icon: 'film',
    isPremium: true
  },
  {
    id: 'game-session',
    name: 'Online Games',
    type: 'game',
    description: 'Play online games together',
    duration: 60,
    activities: ['Game selection', 'Competitive play', 'Fun conversation'],
    icon: 'gamepad-2',
    isPremium: false
  }
];

export const mockVDates: VDate[] = [
  {
    id: 'vdate-1',
    participantIds: ['user-1', profiles[0]?.id || 'profile-1'],
    initiatorId: 'user-1',
    date: getRelativeDate(5), // 5 days from now
    time: '19:00',
    type: 'video',
    status: 'confirmed',
    title: 'Getting to know each other',
    duration: 30,
    meetingLink: 'https://meet.brahminmatrimony.com/room/vdate-1',
    createdAt: getRelativeDateObject(-5),
    updatedAt: getRelativeDateObject(-4),
    reminderSent: false
  },
  {
    id: 'vdate-2',
    participantIds: ['user-1', profiles[1]?.id || 'profile-2'],
    initiatorId: profiles[1]?.id || 'profile-2',
    date: getRelativeDate(7), // 7 days from now
    time: '18:30',
    type: 'coffee',
    status: 'pending',
    title: 'Virtual Coffee Chat',
    duration: 45,
    createdAt: getRelativeDateObject(-6),
    updatedAt: getRelativeDateObject(-6)
  },
  {
    id: 'vdate-3',
    participantIds: ['user-1', profiles[2]?.id || 'profile-3'],
    initiatorId: 'user-1',
    date: getRelativeDate(-10), // 10 days ago (past/completed)
    time: '20:00',
    type: 'movie',
    status: 'completed',
    title: 'Movie Night',
    duration: 120,
    createdAt: getRelativeDateObject(-12),
    updatedAt: getRelativeDateObject(-10),
    feedback: [
      {
        userId: 'user-1',
        rating: 5,
        comment: 'Had a wonderful time! Great conversation.',
        connectionQuality: 'excellent',
        wouldMeetAgain: true,
        submittedAt: getRelativeDateObject(-10)
      }
    ]
  }
];

export const mockInvitations: VDateInvitation[] = [
  {
    id: 'inv-1',
    fromUserId: profiles[3]?.id || 'profile-4',
    toUserId: 'user-1',
    vdateId: 'pending-vdate-1',
    message: 'Would you like to have a virtual coffee chat this weekend?',
    status: 'sent',
    createdAt: getRelativeDateObject(-1)
  },
  {
    id: 'inv-2',
    fromUserId: 'user-1',
    toUserId: profiles[4]?.id || 'profile-5',
    vdateId: 'pending-vdate-2',
    message: 'Hi! I enjoyed our conversation. Would you like to have a video date?',
    status: 'sent',
    createdAt: getRelativeDateObject(-2)
  }
];

export const defaultAvailability: UserAvailability = {
  userId: 'user-1',
  timezone: 'Asia/Kolkata',
  weeklySchedule: {
    monday: { available: true, timeSlots: ['18:00', '19:00', '20:00'] },
    tuesday: { available: true, timeSlots: ['18:00', '19:00', '20:00'] },
    wednesday: { available: true, timeSlots: ['18:00', '19:00', '20:00'] },
    thursday: { available: true, timeSlots: ['18:00', '19:00', '20:00'] },
    friday: { available: true, timeSlots: ['18:00', '19:00', '20:00'] },
    saturday: { available: true, timeSlots: ['10:00', '11:00', '14:00', '15:00', '18:00', '19:00'] },
    sunday: { available: true, timeSlots: ['10:00', '11:00', '14:00', '15:00', '18:00', '19:00'] }
  },
  blackoutDates: [],
  preferredDuration: 45,
  maxDatesPerWeek: 3
};