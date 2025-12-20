import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Loader2, Share2, CheckCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { eventsService, Event } from '@/services/api/events.service';
import { useToast } from '@/hooks/use-toast';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) loadEvent();
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await eventsService.getEvent(id!);
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      setEvent({
        id: id!,
        title: "Matrimony Meet & Greet",
        event_date: "2025-03-15T10:00:00",
        location: "The Grand Hotel, Mumbai",
        description: "Join us for a day of meaningful connections. Meet prospective matches and their families in a comfortable environment. This event features structured ice-breakers, private conversation areas, and refreshments.\n\nWhat to expect:\n• Welcome and registration\n• Group introductions\n• One-on-one meeting sessions\n• Networking lunch\n• Cultural activities",
        capacity: 150,
        participant_count: 45,
        is_registered: false,
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;
    setActionLoading(true);
    try {
      await eventsService.registerForEvent(event.id);
      toast({ title: 'Registered!', description: 'You have been registered for this event.' });
      await loadEvent();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to register', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event) return;
    setActionLoading(true);
    try {
      await eventsService.cancelRegistration(event.id);
      toast({ title: 'Cancelled', description: 'Your registration has been cancelled.' });
      await loadEvent();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied', description: 'Event link copied to clipboard' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const isPastEvent = event ? new Date(event.event_date) < new Date() : false;
  const isFull = event ? (event.participant_count || 0) >= event.capacity : false;
  const spotsLeft = event ? event.capacity - (event.participant_count || 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E30613]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif mb-4">Event Not Found</h1>
        <Button onClick={() => navigate('/events')}>Back to Events</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/events')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {event.image_url && (
              <div className="rounded-xl overflow-hidden h-64 bg-gradient-to-br from-[#E30613]/20 to-[#FF4500]/20">
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            {!event.image_url && (
              <div className="rounded-xl h-64 bg-gradient-to-br from-[#E30613]/10 to-[#FF4500]/10 flex items-center justify-center">
                <Calendar className="h-20 w-20 text-[#E30613]/30" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={event.location.includes('Online') ? 'bg-blue-100 text-blue-700' : 'bg-[#FFF1E6] text-[#FF4500]'}>
                  {event.location.includes('Online') ? 'Virtual Event' : 'In-Person Event'}
                </Badge>
                {isPastEvent && <Badge variant="secondary">Past Event</Badge>}
                {event.is_registered && <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Registered</Badge>}
              </div>

              <h1 className="text-3xl font-serif mb-4" style={{ color: '#E30613' }}>
                {event.title}
              </h1>

              <div className="prose max-w-none">
                {event.description.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="text-gray-600 mb-2">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[#E30613] mt-0.5" />
                  <div>
                    <p className="font-medium">{formatDate(event.event_date)}</p>
                    <p className="text-sm text-gray-500">{formatTime(event.event_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#E30613] mt-0.5" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    {!event.location.includes('Online') && (
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`} 
                         target="_blank" rel="noopener noreferrer"
                         className="text-sm text-[#E30613] hover:underline">
                        View on map
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-[#E30613] mt-0.5" />
                  <div>
                    <p className="font-medium">{event.participant_count || 0} / {event.capacity} attending</p>
                    <p className="text-sm text-gray-500">
                      {isFull ? 'Event is full' : `${spotsLeft} spots remaining`}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  {event.is_registered ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelRegistration}
                      disabled={actionLoading || isPastEvent}
                    >
                      {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Cancel Registration
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={handleRegister}
                      disabled={actionLoading || isPastEvent || isFull}
                        style={{ backgroundColor: '#E30613', color: 'white' }}
                    >
                      {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {isPastEvent ? 'Event Ended' : isFull ? 'Event Full' : 'Register Now'}
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Event
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFF1E6]">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Event Guidelines</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Arrive 15 minutes early for check-in</li>
                  <li>• Bring a valid ID for verification</li>
                  <li>• Dress code: Smart casual</li>
                  <li>• Photography policy varies per event</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
