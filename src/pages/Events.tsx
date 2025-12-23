import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowRight, Loader2, CalendarCheck, Clock } from 'lucide-react';
import Footer from '@/components/Footer';
import { eventsService, Event, EventRegistration } from '@/services/api/events.service';
import { useToast } from '@/hooks/use-toast';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
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
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback mock data
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

  const loadMyRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      const registrations = await eventsService.getMyRegistrations();
      setMyRegistrations(registrations);
    } catch (error) {
      console.error('Error loading registrations:', error);
      setMyRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
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
      await loadMyRegistrations();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to register';
      toast({
        title: 'Error',
        description: message,
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
      await loadMyRegistrations();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel registration';
      toast({
        title: 'Error',
        description: message,
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

  const isEventFull = (event: Event) => (event.participant_count || 0) >= event.capacity;
  const isVirtual = (location: string) => location.toLowerCase().includes('online') || location.toLowerCase().includes('virtual');

  const EventCard = ({ event, showActions = true }: { event: Event; showActions?: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={isVirtual(event.location) ? "secondary" : "outline"}>
            {isVirtual(event.location) ? 'Virtual' : 'In-Person'}
          </Badge>
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
            <Calendar className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">{formatDate(event.event_date)}</p>
              <p className="text-sm text-gray-500">{formatTime(event.event_date)}</p>
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <p>{event.location}</p>
          </div>
          <p className="text-gray-600 pt-2 line-clamp-3">{event.description}</p>
        </div>
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            {event.is_registered ? (
              <Button 
                variant="outline"
                onClick={() => handleCancelRegistration(event.id)}
                disabled={registeringId === event.id}
              >
                {registeringId === event.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Cancel Registration
              </Button>
            ) : (
              <Button 
                onClick={() => handleRegister(event.id)}
                disabled={registeringId === event.id || isEventFull(event)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {registeringId === event.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEventFull(event) ? 'Event Full' : 'Register'}
              </Button>
            )}
            <Link 
              to={`/events/${event.id}`}
              className="flex items-center text-red-600 hover:text-red-700 transition-colors"
            >
              View Details
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4 bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
            Matrimonial Events
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our exclusive matrimonial events to meet potential matches and their families
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6" onValueChange={(v) => v === 'registered' && loadMyRegistrations()}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-orange-50 border border-orange-200">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger value="registered" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
              <CalendarCheck className="h-4 w-4 mr-2" />
              My Registrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Events</h3>
                <p className="text-gray-500">Check back soon for new matrimonial events!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="registered">
            {loadingRegistrations ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : myRegistrations.length === 0 ? (
              <div className="text-center py-16">
                <CalendarCheck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Registrations Yet</h3>
                <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
                <Button 
                  variant="outline"
                  onClick={() => document.querySelector('[data-state="inactive"]')?.dispatchEvent(new MouseEvent('click'))}
                >
                  Browse Events
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRegistrations.map((registration) => (
                  registration.event && (
                    <Card key={registration.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={isVirtual(registration.event.location) ? "secondary" : "outline"}>
                                {isVirtual(registration.event.location) ? 'Virtual' : 'In-Person'}
                              </Badge>
                              <Badge variant="default" className="bg-green-600">Registered</Badge>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{registration.event.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(registration.event.event_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(registration.event.event_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {registration.event.location}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelRegistration(registration.event!.id)}
                              disabled={registeringId === registration.event.id}
                            >
                              {registeringId === registration.event.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                              Cancel
                            </Button>
                            <Link to={`/events/${registration.event.id}`}>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-16 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-8 text-center border border-orange-200">
          <h2 className="text-2xl font-serif mb-4 text-red-800">
            Want to Host a Matrimonial Event?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you're interested in organizing a matrimonial event in your city, we can help you reach the right audience
            and manage the event successfully.
          </p>
          <Button
            onClick={() => window.location.href = '/help'}
            className="bg-red-600 hover:bg-red-700 text-white px-8"
          >
            Contact Us to Host
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
