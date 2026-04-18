import { supabase } from '@/lib/supabase';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  max_participants: number | null;
  organizer_id: string;
  created_at: string;
  // UI-facing flattened fields
  date: string;
  time: string;
  current_participants: number;
  image: string | null;
  participant_count?: number;
  is_registered?: boolean;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  event?: Event;
  user?: any;
}

class EventsService {
  // Get all upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await (supabase as any)
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (error) throw error;

    // Get participant counts and registration status
    const eventsWithDetails = await Promise.all(
      (data || []).map(async (event: any) => {
        const { count } = await (supabase as any)
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        let isRegistered = false;
        if (user) {
          const { data: registration } = await (supabase as any)
            .from('event_registrations')
            .select('id')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .maybeSingle();

          isRegistered = !!registration;
        }

        return this.mapToEvent({
          ...event,
          participant_count: count || 0,
          is_registered: isRegistered
        });
      })
    );

    return eventsWithDetails;
  }

  // Get event by ID
  async getEvent(eventId: string): Promise<Event | null> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await (supabase as any)
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    // Get participant count
    const { count } = await (supabase as any)
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    // Check if user is registered
    let isRegistered = false;
    if (user) {
      const { data: registration } = await (supabase as any)
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      isRegistered = !!registration;
    }

    return this.mapToEvent({
      ...data,
      participant_count: count || 0,
      is_registered: isRegistered
    });
  }

  // Register for event
  async registerForEvent(eventId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get event details
    const event = await this.getEvent(eventId);
    if (!event) throw new Error('Event not found');

    // Check if already registered
    if (event.is_registered) {
      throw new Error('Already registered for this event');
    }

    // Check capacity
    if (event.participant_count! >= (event.max_participants || 100)) {
      throw new Error('Event is full');
    }

    // Check if event date has passed
    if (new Date(event.event_date) < new Date()) {
      throw new Error('Cannot register for past events');
    }

    // Register
    const { error } = await (supabase as any)
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Already registered for this event');
      }
      throw error;
    }

    // Send confirmation notification
    await this.sendRegistrationConfirmation(user.id, event);
  }

  // Cancel registration
  async cancelRegistration(eventId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Send cancellation confirmation
    const event = await this.getEvent(eventId);
    if (event) {
      await this.sendCancellationConfirmation(user.id, event);
    }
  }

  // Get my registrations
  async getMyRegistrations(): Promise<EventRegistration[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('event_registrations')
      .select(`
        *,
        event:event_id (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((reg: any) => ({
      ...reg,
      event: reg.event ? this.mapToEvent(reg.event) : undefined
    })) as EventRegistration[];
  }

  // Admin: Create event
  async createEvent(eventData: any): Promise<Event> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return this.mapToEvent(data);
  }

  // Admin: Update event
  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('events')
      .update(eventData)
      .eq('id', eventId);

    if (error) throw error;
  }

  // Admin: Delete event
  async deleteEvent(eventId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }

  // Admin: Get event participants
  async getEventParticipants(eventId: string): Promise<any[]> {
    const { data, error } = await (supabase as any)
      .from('event_registrations')
      .select(`
        *,
        user:user_id (*)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Helper to map DB row to Event interface
  private mapToEvent(data: any): Event {
    const eventDate = new Date(data.event_date);
    return {
      ...data,
      date: eventDate.toLocaleDateString(),
      time: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      current_participants: data.participant_count || 0,
      image: data.image_url || null,
    };
  }

  // Send registration confirmation
  private async sendRegistrationConfirmation(userId: string, event: Event): Promise<void> {
    try {
      await (supabase as any).from('notifications').insert({
        user_id: userId,
        type: 'event_registration',
        title: 'Event Registration Confirmed',
        message: `You're registered for ${event.title} on ${event.date}`,
        action_url: `/events/${event.id}`,
        read: false
      });
    } catch (error) {
      console.error('Failed to send confirmation:', error);
    }
  }

  // Send cancellation confirmation
  private async sendCancellationConfirmation(userId: string, event: Event): Promise<void> {
    try {
      await (supabase as any).from('notifications').insert({
        user_id: userId,
        type: 'event_cancellation',
        title: 'Event Registration Cancelled',
        message: `Your registration for ${event.title} has been cancelled`,
        read: false
      });
    } catch (error) {
      console.error('Failed to send cancellation:', error);
    }
  }
}

export const eventsService = new EventsService();
