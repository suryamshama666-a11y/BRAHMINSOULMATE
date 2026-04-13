
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/hooks/useEvents';

interface EventCardProps {
  event: Event;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
  isJoined?: boolean;
  participationStatus?: 'attending' | 'maybe' | 'not_attending';
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onJoin,
  onLeave,
  isJoined = false,
  participationStatus
}) => {
  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();
  const isPast = eventDate < new Date();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription className="mt-1">
              {event.description || 'No description available'}
            </CardDescription>
          </div>
          <div className="ml-2">
            {isPast ? (
              <Badge variant="secondary">Past Event</Badge>
            ) : isUpcoming ? (
              <Badge className="bg-green-100 text-green-800">Upcoming</Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800">Today</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{format(eventDate, 'PPP')}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{format(eventDate, 'p')}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {event.current_participants} attending
              {event.max_participants && ` (max ${event.max_participants})`}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            {participationStatus && (
              <Badge 
                variant={participationStatus === 'attending' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {participationStatus === 'attending' ? '✓ Attending' :
                 participationStatus === 'maybe' ? '? Maybe' : '✗ Not Attending'}
              </Badge>
            )}
            
            <div className="flex space-x-2">
              {!isPast && (
                <>
                  {isJoined ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLeave?.(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Leave
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onJoin?.(event.id)}
                      disabled={!!(event.max_participants && event.current_participants >= event.max_participants)}
                    >
                      {event.max_participants && event.current_participants >= event.max_participants
                        ? 'Full'
                        : 'Join'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
