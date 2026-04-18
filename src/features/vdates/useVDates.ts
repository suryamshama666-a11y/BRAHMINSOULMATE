import { useState, useEffect, useCallback } from 'react';
import { VDate as LocalVDate, VDateInvitation, VDateTemplate } from '@/types/vdates';
import { vdatesService, VDate as ServiceVDate } from '@/services/api/vdates.service';
import { matchingService } from '@/services/api/matching.service';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useVDateScheduling } from './hooks/useVDateScheduling';
import { Profile } from '@/types/profile';

const transformServiceVDate = (v: ServiceVDate): LocalVDate => ({
  id: v.id,
  participantIds: [v.organizer_id, v.participant_id],
  initiatorId: v.organizer_id,
  date: (v.scheduled_time || v.scheduled_at).split('T')[0],
  time: (v.scheduled_time || v.scheduled_at).split('T')[1]?.substring(0, 5) || '00:00',
  type: 'video',
  status: v.status === 'scheduled' ? 'confirmed' : v.status === 'missed' ? 'cancelled' : v.status as any,
  title: v.title || 'V-Date',
  duration: v.duration || v.duration_minutes || 30,
  meetingLink: v.meeting_url || (v.room_name ? `https://meet.jit.si/${v.room_name}` : undefined),
  createdAt: new Date(v.created_at),
  updatedAt: new Date(v.created_at),
  feedback: (v.rating_1 || v.rating_2) ? [{
    userId: isNaN(Number(v.organizer_id)) ? v.organizer_id : v.organizer_id,
    rating: v.rating_1 || v.rating_2 || 0,
    comment: v.feedback_1 || v.feedback_2,
    wouldMeetAgain: true,
    submittedAt: new Date()
  }] : undefined
});

export const useVDates = () => {
  const [vdates, setVDates] = useState<LocalVDate[]>([]);
  const [invitations, _setInvitations] = useState<VDateInvitation[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const scheduling = useVDateScheduling();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      const [allVDates, matchesRes] = await Promise.all([
        vdatesService.getMyVDates(),
        matchingService.getMatches(user.id)
      ]);

      const matchesData = matchesRes.data || [];

      setVDates(allVDates.map(transformServiceVDate));
      
      setProfiles(matchesData
        .filter(m => m.user_profile)
        .map(m => {
          const p = m.user_profile!;
          return {
            id: p.user_id,
            userId: p.user_id,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            age: p.age || 0,
            gender: (p.gender === 'male' || p.gender === 'female') ? p.gender : 'male' as const,
            maritalStatus: (p.marital_status || 'Never Married') as 'Never Married' | 'Widowed' | 'Divorced' | 'Separated' | 'Awaiting Divorce',
            height: typeof p.height === 'number' ? p.height : parseInt(String(p.height)) || 0,
            location: {
              city: p.city || 'Unknown',
              state: p.state || '',
              country: 'India'
            },
            about: p.bio || '',
            images: p.profile_picture ? [p.profile_picture] : [],
            education: p.education_level ? [{ degree: p.education_level, institution: '', year: new Date().getFullYear() }] : [],
            employment: { profession: p.occupation || '', company: '', position: '', income: '' },
            family: {},
            createdAt: new Date(),
            isVerified: !!p.verified
          } as Profile;
        }));

    } catch (error: unknown) {
      console.error('Failed to load V-Dates:', error);
      const message = error instanceof Error ? error.message : 'Failed to load V-Dates';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const upcomingVDates = vdates.filter(vdate => {
    const vdateDateTime = new Date(`${vdate.date}T${vdate.time}`);
    return vdateDateTime > new Date() && (vdate.status === 'confirmed' || vdate.status === 'pending');
  }).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const pastVDates = vdates.filter(vdate => {
    const vdateDateTime = new Date(`${vdate.date}T${vdate.time}`);
    return vdateDateTime <= new Date() || vdate.status === 'completed';
  }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const pendingInvitations = invitations.filter(inv => 
    inv.status === 'sent' && inv.toUserId === currentUserId
  );

  const sentInvitations = invitations.filter(inv => 
    inv.status === 'sent' && inv.fromUserId === currentUserId
  );

  const scheduleVDate = async (profileId: string, template: VDateTemplate, _message?: string) => {
    if (!scheduling.selectedDate || !scheduling.selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      const scheduledTime = `${scheduling.selectedDate.toISOString().split('T')[0]}T${scheduling.selectedTime}:00`;
      await vdatesService.scheduleVDate(profileId, scheduledTime, template.duration);
      toast.success('V-Date scheduled successfully!');
      scheduling.resetSelection();
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to schedule V-Date';
      toast.error(message);
    }
  };

  const acceptInvitation = async (_invitationId: string) => {
    toast.info('Invitation accepted');
  };

  const declineInvitation = async (_invitationId: string) => {
    toast.info('Invitation declined');
  };

  const cancelVDate = async (vdateId: string) => {
    try {
      await vdatesService.cancelVDate(vdateId);
      toast.success('V-Date cancelled');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel V-Date');
    }
  };

  const joinVDate = async (vdateId: string) => {
    try {
      const vdate = vdates.find(v => v.id === vdateId);
      if (!vdate) {
        toast.error('V-Date not found');
        return;
      }

      await vdatesService.updateStatus(vdateId, 'completed');
      
      if (vdate.meetingLink) {
        window.open(vdate.meetingLink, '_blank');
      } else {
        toast.error('Meeting link not available');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to join V-Date');
    }
  };

  const submitFeedback = async (vdateId: string, rating: number, comment: string, _wouldMeetAgain: boolean) => {
    try {
      await vdatesService.submitFeedback(vdateId, rating, comment);
      toast.success('Thank you for your feedback!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback');
    }
  };

  const getAvailableTimeSlots = scheduling.getAvailableTimeSlots;

  return {
    vdates,
    upcomingVDates,
    pastVDates,
    invitations,
    pendingInvitations,
    sentInvitations,
    profiles,
    loading,
    ...scheduling,
    scheduleVDate,
    acceptInvitation,
    declineInvitation,
    cancelVDate,
    joinVDate,
    submitFeedback,
    getAvailableTimeSlots
  };
};