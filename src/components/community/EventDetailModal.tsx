
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, MapPin, Users, DollarSign, 
  User 
} from 'lucide-react';
import { Event } from '@/hooks/useEvents';
import { format } from 'date-fns';

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (eventId: string) => void;
  isRegistered: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegister,
  isRegistered
}) => {
  const [isRegistering, setIsRegistering] = useState(false);

  if (!event) return null;

  const handleRegister = async () => {
    setIsRegistering(true);
    await onRegister(event.id);
    setIsRegistering(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
              <DialogDescription className="mt-2">
                <Badge variant="default">
                  Event
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Event Details */}
        <div className="space-y-6">
          {/* Date & Time */}
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">
                {format(new Date(event.event_date), 'EEEE, MMMM do, yyyy')}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(event.event_date), 'h:mm a')}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">{event.location || 'Location TBD'}</p>
            </div>
          </div>

          {/* Participants */}
          {event.max_participants && (
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Max Participants: {event.max_participants}</p>
                <p className="text-sm text-gray-500">Current: {event.current_participants}</p>
              </div>
            </div>
          )}

          {/* Registration Fee */}
          <div className="flex items-center space-x-3">
            <DollarSign className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">Free Event</p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <Separator />

          {/* Organizer */}
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">Organized by Community Member</p>
              <p className="text-sm text-gray-500">Event Organizer</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!isRegistered ? (
            <Button onClick={handleRegister} disabled={isRegistering}>
              {isRegistering ? 'Registering...' : 'Register for Event'}
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Already Registered
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
