import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';
import { eventsService, Event } from '@/services/api/events.service';
import { useToast } from '@/hooks/use-toast';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventsData = await eventsService.getUpcomingEvents();
      setEvents(eventsData);
    } catch (error: any) {
      console.error('Error loading events:', error);
      setEvents([
        {
          id: '1',
          title: "Matrimony Meet & Greet",
          event_date: "2025-03-15T10:00:00",
          location: "The Grand Hotel, Mumbai",
          description: "Join us for a day of meaningful connections. Meet prospective matches and their families in a comfortable environment.",
          capacity: 150,
          participant_count: 45,
          is_registered: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: "Virtual Matchmaking Session",
          event_date: "2025-03-20T18:00:00",
          location: "Online (Zoom)",
          description: "A curated virtual event where you can interact with potential matches from across the country.",
          capacity: 100,
          participant_count: 32,
          is_registered: false,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: "Cultural Matrimony Gathering",
          event_date: "2025-04-05T11:00:00",
          location: "Convention Center, Bangalore",
          description: "A traditional matrimonial event with cultural activities and opportunities to meet like-minded individuals.",
          capacity: 200,
          participant_count: 78,
          is_registered: false,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    setRegisteringId(eventId);
    try {
      await eventsService.registerForEvent(eventId);
      toast({
        title: 'Registered!',
        description: 'You have been registered for this event.'
      });
      await loadEvents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register',
        variant: 'destructive'
      });
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    setRegisteringId(eventId);
    try {
      await eventsService.cancelRegistration(eventId);
      toast({
        title: 'Cancelled',
        description: 'Your registration has been cancelled.'
      });
      await loadEvents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel registration',
        variant: 'destructive'
      });
    } finally {
      setRegisteringId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-serif mb-4"
            style={{ color: '#E30613' }}
          >
            Upcoming Events
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our exclusive matrimonial events to meet potential matches and their families
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#E30613]" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-[#FFF1E6] text-[#FF4500] rounded-full text-sm">
                      {event.location.includes('Online') ? 'Virtual' : 'In-Person'}
                    </span>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">{event.participant_count || 0}/{event.capacity}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-serif">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-[#FF4500] mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">{formatDate(event.event_date)}</p>
                        <p className="text-sm text-gray-500">{formatTime(event.event_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-[#FF4500] mr-2 mt-0.5" />
                      <p>{event.location}</p>
                    </div>
                    <p className="text-gray-600 pt-2">{event.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    {event.is_registered ? (
                      <Button 
                        variant="outline"
                        onClick={() => handleCancelRegistration(event.id)}
                        disabled={registeringId === event.id}
                      >
                        {registeringId === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Cancel Registration
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleRegister(event.id)}
                        disabled={registeringId === event.id || (event.participant_count || 0) >= event.capacity}
                        style={{ backgroundColor: '#E30613' }}
                      >
                        {registeringId === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {(event.participant_count || 0) >= event.capacity ? 'Event Full' : 'Register'}
                      </Button>
                    )}
                    <button className="flex items-center text-[#FF4500] hover:text-[#FF4500]/80 transition-colors">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 bg-[#FFF1E6] rounded-xl p-8 text-center">
          <h2 
            className="text-2xl font-serif mb-4"
            style={{ color: '#E30613' }}
          >
            Want to Host a Matrimonial Event?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you're interested in organizing a matrimonial event in your city, we can help you reach the right audience
            and manage the event successfully.
          </p>
          <button
            onClick={() => window.location.href = '/help'}
            className="px-8 py-3 rounded-lg hover:bg-[#E30613]/90 transition-colors"
            style={{ backgroundColor: '#E30613', color: 'white' }}
          >
            Contact Us to Host
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}