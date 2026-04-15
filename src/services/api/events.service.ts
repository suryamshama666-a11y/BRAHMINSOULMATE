import { supabase } from '@/lib/supabase';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_participants: number | null;
  current_participants: number;
  image: string | null;
  organizer_id: string;
  created_at: string;
  participant_count?: number;
  is_registered?: boolean;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  event?: Event;
  user?: {
    user_id: string;
    name: string;
    email: string;
    phone: string | null;
    images: string[];
  };
}

class EventsService {
  // Get all upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (error) throw error;

    // Get participant counts and registration status
    const eventsWithDetails = await Promise.all(
      (data || []).map(async (event) => {
        const { count } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        let isRegistered = false;
        if (user) {
          const { data: registration } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .single();

          isRegistered = !!registration;
        }

        return {
          ...event,
          participant_count: count || 0,
          is_registered: isRegistered
        };
      })
    );

    return eventsWithDetails;
  }

  // Get event by ID
  async getEvent(eventId: string): Promise<Event | null> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    const event = data as unknown as Event;

    // Get participant count
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    // Check if user is registered
    let isRegistered = false;
    if (user) {
      const { data: registration } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      isRegistered = !!registration;
    }

    return {
      ...event,
      participant_count: count || 0,
      is_registered: isRegistered
    };
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
    const eventDate = (event as any).event_date || (event as any).date;
    if (new Date(eventDate) < new Date()) {
      throw new Error('Cannot register for past events');
    }

    // Register
    const { error } = await supabase
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

    const { error } = await supabase
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

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:event_id (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Admin: Create event
  async createEvent(eventData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    max_participants: number;
    image: string | null;
    organizer_id: string;
  }): Promise<Event> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Admin: Update event
  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId);

    if (error) throw error;
  }

  // Admin: Delete event
  async deleteEvent(eventId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }

  // Admin: Get event participants
  async getEventParticipants(eventId: string): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        user:user_id (
          user_id,
          name,
          email,
          phone,
          images
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Send event reminders (to be called by cron job)
  async sendEventReminders(): Promise<void> {
    // Get events happening in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    const threeDaysEnd = new Date(threeDaysFromNow);
    threeDaysEnd.setHours(23, 59, 59, 999);

    const { data: upcomingEvents } = await supabase
      .from('events')
      .select('*')
      .gte('date', threeDaysFromNow.toISOString())
      .lte('date', threeDaysEnd.toISOString());

    if (!upcomingEvents) return;

    // Send reminders for each event
    for (const event of upcomingEvents) {
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('user_id')
        .eq('event_id', event.id);

      if (!registrations) continue;

      // Create notifications for all registered users
      const notifications = registrations.map(reg => ({
        user_id: reg.user_id,
        type: 'event_reminder',
        title: 'Event Reminder',
        message: `${event.title} is happening in 3 days!`,
        action_url: `/events/${event.id}`,
        read: false
      }));

      await supabase.from('notifications').insert(notifications);
    }
  }

  // Send registration confirmation
  private async sendRegistrationConfirmation(userId: string, event: Event): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'event_registration',
        title: 'Event Registration Confirmed',
        message: `You're registered for ${event.title} on ${new Date(event.date).toLocaleDateString()}`,
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
      await supabase.from('notifications').insert({
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
