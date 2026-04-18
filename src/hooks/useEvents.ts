
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  organizer_id: string;
  max_participants?: number;
  current_participants?: number;
  is_private?: boolean;
  created_at: string;
  updated_at?: string;
  event_type?: string;
  is_virtual?: boolean;
  meeting_url?: string | null;
  registration_fee?: number;
  banner_image_url?: string | null;
  deleted_at?: string | null;
}

const fetchEventsData = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_private', false)
    .order('event_date', { ascending: true });

  if (error) throw error;
  // Map database rows to Event interface
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    event_date: row.event_date,
    location: row.location ?? undefined,
    organizer_id: row.organizer_id,
    max_participants: row.max_participants ?? undefined,
    current_participants: 0, // Default value since column doesn't exist in DB
    is_private: false, // Default value since column doesn't exist in DB
    created_at: row.created_at,
    updated_at: undefined, // Column doesn't exist in DB
    event_type: row.event_type,
    is_virtual: row.is_virtual,
    meeting_url: row.meeting_url,
    registration_fee: row.registration_fee,
    banner_image_url: row.banner_image_url,
    deleted_at: row.deleted_at
  }));
};

export const useEvents = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEventsData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const fetchEvents = () => refetch();

  const createMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id' | 'organizer_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description ?? null,
          event_date: eventData.event_date,
          location: eventData.location ?? null,
          organizer_id: user.id,
          max_participants: eventData.max_participants ?? null,
          is_private: eventData.is_private ?? false,
          event_type: eventData.event_type ?? 'community',
          is_virtual: eventData.is_virtual ?? false,
          meeting_url: eventData.meeting_url ?? null,
          registration_fee: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator to event
      await (supabase as any)
        .from('event_registrations')
        .insert({
          event_id: data.id,
          user_id: user.id,
          attended: false
        });

      return data;
    },
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: unknown) => {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Check if already joined
      const { data: existingParticipant } = await (supabase as any)
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingParticipant) {
        throw new Error('Already registered');
      }

      // Join event
      const { error } = await (supabase as any)
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          attended: false
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Successfully joined the event!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Already registered') {
        toast.error('You are already registered for this event');
      } else {
        console.error('Error joining event:', error);
        toast.error('Failed to join event');
      }
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await (supabase as any)
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Successfully left the event');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: unknown) => {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave event');
    }
  });

  const createEvent = async (eventData: Omit<Event, 'id' | 'organizer_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Please login to create events');
      return { success: false };
    }

    try {
      const data = await createMutation.mutateAsync(eventData);
      return { success: true, event: data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) {
      toast.error('Please login to join events');
      return { success: false };
    }

    try {
      await joinMutation.mutateAsync(eventId);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) {
      toast.error('Please login to leave events');
      return { success: false };
    }

    try {
      await leaveMutation.mutateAsync(eventId);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    joinEvent,
    leaveEvent
  };
};
