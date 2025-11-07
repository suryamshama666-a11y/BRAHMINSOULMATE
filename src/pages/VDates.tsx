import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Clock, Users } from 'lucide-react';
import Footer from '@/components/Footer';


export default function VDates() {
  const [activeSection, setActiveSection] = useState<'schedule' | 'upcoming' | 'history' | null>(null);


  const handleButtonClick = (section: 'schedule' | 'upcoming' | 'history') => {
    setActiveSection(section);
  };
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 
              className="text-3xl font-serif font-bold mb-2"
              style={{ color: '#E30613' }}
            >
              V-Dates
            </h1>
            <p className="text-gray-600">
              Schedule virtual dates with your matches in a safe and comfortable environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2 text-black"
                >
                  <Calendar className="h-5 w-5" style={{ color: '#E30613' }} />
                  Schedule V-Date
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4 flex-grow">
                  Schedule a virtual date with someone you're interested in.
                </p>
                <Button
                  onClick={() => handleButtonClick('schedule')}
                  className="w-full transition-all duration-300 transform hover:scale-105 font-medium border-2"
                  style={{
                    backgroundColor: activeSection === 'schedule' ? '#E30613' : 'white',
                    borderColor: '#E30613',
                    color: activeSection === 'schedule' ? 'white' : 'black'
                  }}
                >
                  Schedule New V-Date
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2 text-black"
                >
                  <Clock className="h-5 w-5" style={{ color: '#E30613' }} />
                  Upcoming V-Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4 flex-grow">
                  View and manage your scheduled virtual dates.
                </p>
                <Button
                  onClick={() => handleButtonClick('upcoming')}
                  className="w-full transition-all duration-300 transform hover:scale-105 font-medium border-2"
                  style={{
                    backgroundColor: activeSection === 'upcoming' ? '#E30613' : 'white',
                    borderColor: '#E30613',
                    color: activeSection === 'upcoming' ? 'white' : 'black'
                  }}
                >
                  View Upcoming
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2 text-black"
                >
                  <Video className="h-5 w-5" style={{ color: '#E30613' }} />
                  V-Date History
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4 flex-grow">
                  Review your past virtual dating experiences.
                </p>
                <Button
                  onClick={() => handleButtonClick('history')}
                  className="w-full transition-all duration-300 transform hover:scale-105 font-medium border-2"
                  style={{
                    backgroundColor: activeSection === 'history' ? '#E30613' : 'white',
                    borderColor: '#E30613',
                    color: activeSection === 'history' ? 'white' : 'black'
                  }}
                >
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2"
                  style={{ color: '#E30613' }}
                >
                  <Users className="h-5 w-5" style={{ color: '#E30613' }} />
                  V-Date Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#E30613' }}>Safe Environment</h3>
                    <p className="text-gray-600 text-sm">
                      All V-Dates are monitored and recorded for safety and security.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#E30613' }}>Flexible Scheduling</h3>
                    <p className="text-gray-600 text-sm">
                      Schedule dates at your convenience with easy rescheduling options.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#E30613' }}>Quality Matching</h3>
                    <p className="text-gray-600 text-sm">
                      Only connect with verified and compatible matches.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#E30613' }}>Privacy Protected</h3>
                    <p className="text-gray-600 text-sm">
                      Your personal information remains secure during all interactions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
