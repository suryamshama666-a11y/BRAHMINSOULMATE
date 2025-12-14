import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  type: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await api.getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading events:', error);
        // Use static events as fallback
        setEvents([
          {
            title: "Matrimony Meet & Greet",
            date: "March 15, 2024",
            time: "10:00 AM - 4:00 PM",
            location: "The Grand Hotel, Mumbai",
            description: "Join us for a day of meaningful connections. Meet prospective matches and their families in a comfortable environment.",
            attendees: 150,
            type: "In-Person"
          },
          {
            title: "Virtual Matchmaking Session",
            date: "March 20, 2024",
            time: "6:00 PM - 8:00 PM",
            location: "Online (Zoom)",
            description: "A curated virtual event where you can interact with potential matches from across the country.",
            attendees: 100,
            type: "Virtual"
          },
          {
            title: "Cultural Matrimony Gathering",
            date: "April 5, 2024",
            time: "11:00 AM - 5:00 PM",
            location: "Convention Center, Bangalore",
            description: "A traditional matrimonial event with cultural activities and opportunities to meet like-minded individuals.",
            attendees: 200,
            type: "In-Person"
          }
        ]);
      }
    };

    loadEvents();
  }, []);

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-[#FFF1E6] text-[#FF4500] rounded-full text-sm">
                    {event.type}
                  </span>
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{event.attendees} attendees</span>
                  </div>
                </div>
                <CardTitle className="text-xl font-serif">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-[#FF45
00] mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{event.date}</p>
                      <p className="text-sm text-gray-500">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-[#FF4500] mr-2 mt-0.5" />
                    <p>{event.location}</p>
                  </div>
                  <p className="text-gray-600 pt-2">{event.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button className="flex items-center text-[#FF4500] hover:text-[#FF4500]/80 transition-colors">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
            onClick={() => {/* Handle host request */}}
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
