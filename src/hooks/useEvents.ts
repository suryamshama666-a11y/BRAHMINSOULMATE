
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
  creator_id: string;
  max_participants?: number;
  current_participants: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

const fetchEventsData = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_private', false)
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data || [];
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
    mutationFn: async (eventData: Omit<Event, 'id' | 'creator_id' | 'current_participants' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          creator_id: user.id,
          current_participants: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator to event
      await supabase
        .from('event_participants')
        .insert({
          event_id: data.id,
          user_id: user.id,
          status: 'attending'
        });

      return data;
    },
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Check if already joined
      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingParticipant) {
        throw new Error('Already registered');
      }

      // Join event
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'attending'
        });

      if (error) throw error;

      // Update participant count
      const { data: currentEvent } = await supabase
        .from('events')
        .select('current_participants')
        .eq('id', eventId)
        .single();

      if (currentEvent) {
        await supabase
          .from('events')
          .update({ current_participants: currentEvent.current_participants + 1 })
          .eq('id', eventId);
      }
    },
    onSuccess: () => {
      toast.success('Successfully joined the event!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      if (error.message === 'Already registered') {
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

      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update participant count
      const { data: currentEvent } = await supabase
        .from('events')
        .select('current_participants')
        .eq('id', eventId)
        .single();

      if (currentEvent) {
        await supabase
          .from('events')
          .update({ current_participants: Math.max(currentEvent.current_participants - 1, 0) })
          .eq('id', eventId);
      }
    },
    onSuccess: () => {
      toast.success('Successfully left the event');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: any) => {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave event');
    }
  });

  const createEvent = async (eventData: Omit<Event, 'id' | 'creator_id' | 'current_participants' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Please login to create events');
      return { success: false };
    }

    try {
      const data = await createMutation.mutateAsync(eventData);
      return { success: true, event: data };
    } catch (error: any) {
      return { success: false, error: error.message };
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
    } catch (error: any) {
      return { success: false, error: error.message };
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
    } catch (error: any) {
      return { success: false, error: error.message };
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
