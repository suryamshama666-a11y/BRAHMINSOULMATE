import { supabase, apiCall, APIResponse } from './base';

export interface VDate {
  id: string;
  organizer_id: string;
  participant_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  scheduled_time?: string;
  duration_minutes: number;
  duration?: number; // Alias for duration_minutes or vice versa
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'pending';
  meeting_url?: string;
  meetingLink?: string; 
  room_name?: string;
  feedback_1?: string;
  feedback_2?: string;
  rating_1?: number;
  rating_2?: number;
  viewer_rating?: number; // UI compatibility
  participant_rating?: number; // UI compatibility
  created_at: string;
  otherUser?: any; // UI helper
  user1?: any;
  user2?: any;
}

export class VDatesService {
  /**
   * Get all V-Dates for current user
   */
  async getMyVDates(): Promise<VDate[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('vdates')
      .select(`
        *,
        user1:organizer_id (user_id, first_name, last_name, display_name, profile_picture_url),
        user2:participant_id (user_id, first_name, last_name, display_name, profile_picture_url)
      `)
      .or(`organizer_id.eq.${user.id},participant_id.eq.${user.id}`)
      .order('scheduled_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((d: any) => this.mapToVDate(d, user.id));
  }

  // Get upcoming V-dates
  async getUpcomingVDates(): Promise<VDate[]> {
    const dates = await this.getMyVDates();
    return dates.filter(d => d.status === 'scheduled' || d.status === 'pending');
  }

  // Get history
  async getVDateHistory(): Promise<VDate[]> {
    const dates = await this.getMyVDates();
    return dates.filter(d => d.status === 'completed' || d.status === 'cancelled' || d.status === 'missed');
  }

  /**
   * Schedule a new V-Date
   */
  async scheduleVDate(
    participantId: string,
    scheduledAt: string,
    durationMinutes: number = 30,
    title: string = 'V-Date'
  ): Promise<VDate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('vdates')
      .insert({
        organizer_id: user.id,
        participant_id: participantId,
        title,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToVDate(data, user.id);
  }

  // Cancel V-Date
  async cancelVDate(vdateId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('vdates')
      .update({ status: 'cancelled' })
      .eq('id', vdateId);

    if (error) throw error;
  }

  /**
   * Update V-Date status
   */
  async updateStatus(vdateId: string, status: VDate['status']): Promise<VDate> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await (supabase as any)
      .from('vdates')
      .update({ status })
      .eq('id', vdateId)
      .select()
      .single();

    if (error) throw error;
    return this.mapToVDate(data, user?.id || '');
  }

  // Submit feedback
  async submitFeedback(vdateId: string, rating: number, comment: string): Promise<VDate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: vdate } = await (supabase as any)
      .from('vdates')
      .select('*')
      .eq('id', vdateId)
      .single();

    if (!vdate) throw new Error('V-Date not found');

    const updateData: any = {};
    if (vdate.organizer_id === user.id) {
      updateData.feedback_1 = comment;
      updateData.rating_1 = rating;
    } else {
      updateData.feedback_2 = comment;
      updateData.rating_2 = rating;
    }

    const { data, error } = await (supabase as any)
      .from('vdates')
      .update(updateData)
      .eq('id', vdateId)
      .select()
      .single();

    if (error) throw error;
    return this.mapToVDate(data, user.id);
  }

  private mapToVDate(d: any, currentUserId: string): VDate {
    const organizerId = d.organizer_id || d.user_id_1;
    const isOrganizer = organizerId === currentUserId;
    const otherUser = isOrganizer ? d.user2 : d.user1;

    return {
      ...d,
      organizer_id: organizerId,
      participant_id: d.participant_id || d.user_id_2,
      duration: d.duration_minutes || d.duration,
      scheduled_time: d.scheduled_at || d.scheduled_time,
      meetingLink: d.meeting_url,
      otherUser: otherUser,
      viewer_rating: isOrganizer ? d.rating_1 : d.rating_2,
      participant_rating: isOrganizer ? d.rating_2 : d.rating_1
    };
  }
}

export const vdatesService = new VDatesService();
