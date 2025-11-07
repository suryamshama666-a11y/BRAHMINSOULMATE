
import { useState, useEffect } from 'react';
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

export const useEvents = () => {
  const { user } = useSupabaseAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_private', false)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'creator_id' | 'current_participants' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Please login to create events');
      return { success: false };
    }

    try {
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

      await fetchEvents();
      toast.success('Event created successfully!');
      return { success: true, event: data };
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      return { success: false, error: error.message };
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) {
      toast.error('Please login to join events');
      return { success: false };
    }

    try {
      // Check if already joined
      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingParticipant) {
        toast.error('You are already registered for this event');
        return { success: false };
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

      // Update participant count manually
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

      await fetchEvents();
      toast.success('Successfully joined the event!');
      return { success: true };
    } catch (error: any) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
      return { success: false, error: error.message };
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) {
      toast.error('Please login to leave events');
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update participant count manually
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

      await fetchEvents();
      toast.success('Successfully left the event');
      return { success: true };
    } catch (error: any) {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave event');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    joinEvent,
    leaveEvent
  };
};
