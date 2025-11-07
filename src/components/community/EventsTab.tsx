
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EventCard } from './EventCard';
import { useEvents } from '@/hooks/useEvents';

interface EventsTabProps {
  onCreateEvent: () => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({ onCreateEvent }) => {
  const { events, loading, fetchEvents, joinEvent, leaveEvent } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleJoinEvent = async (eventId: string) => {
    await joinEvent(eventId);
  };

  const handleLeaveEvent = async (eventId: string) => {
    await leaveEvent(eventId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Community Events</CardTitle>
            <CardDescription>
              Discover and participate in matrimonial and social events
            </CardDescription>
          </div>
          <Button onClick={onCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No events found.</p>
              <p className="text-sm mt-1">Be the first to create an event!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onJoin={handleJoinEvent}
                  onLeave={handleLeaveEvent}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
