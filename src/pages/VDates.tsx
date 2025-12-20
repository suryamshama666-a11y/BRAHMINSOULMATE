import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Clock, Users, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { vdatesService, VDate } from '@/services/api/vdates.service';
import { matchingService } from '@/services/api/matching.service';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';


interface Match {
  user_id: string;
  full_name: string;
  profile_picture?: string;
}

export default function VDates() {
  const [activeSection, setActiveSection] = useState<'overview' | 'schedule' | 'upcoming' | 'history'>('overview');
  const [upcomingVDates, setUpcomingVDates] = useState<VDate[]>([]);
  const [pastVDates, setPastVDates] = useState<VDate[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [selectedMatch, setSelectedMatch] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Load matches for scheduling
      const matchesData = await matchingService.getMatches(user.id);
      setMatches(matchesData
        .filter(m => m.profile) // Only include matches with profile data
        .map(m => ({
          user_id: m.profile.user_id,
          full_name: m.profile.full_name,
          profile_picture: m.profile.profile_picture
        })));

      // Load upcoming V-Dates
      const upcoming = await vdatesService.getUpcomingVDates();
      setUpcomingVDates(upcoming);

      // Load all V-Dates and filter past ones
      const allVDates = await vdatesService.getMyVDates();
      const past = allVDates.filter(v => 
        v.status === 'completed' || v.status === 'missed' || 
        (v.status === 'cancelled' && new Date(v.scheduled_time) < new Date())
      );
      setPastVDates(past);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load V-Dates data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleVDate = async () => {
    if (!selectedMatch || !scheduledTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select a match and date/time',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      await vdatesService.scheduleVDate(selectedMatch, scheduledTime, duration);
      toast({
        title: 'Success',
        description: 'V-Date scheduled successfully!'
      });
      
      // Reset form
      setSelectedMatch('');
      setScheduledTime('');
      setDuration(30);
      
      // Reload data and go back to overview
      await loadData();
      setActiveSection('overview');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule V-Date',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinVDate = async (vdate: VDate) => {
    try {
      await vdatesService.startVDate(vdate.id);
      const meetingUrl = vdatesService.generateMeetingUrl(vdate);
      window.open(meetingUrl, '_blank');
      
      toast({
        title: 'Joining V-Date',
        description: 'Opening video call in new window...'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join V-Date',
        variant: 'destructive'
      });
    }
  };

  const handleCancelVDate = async (vdateId: string) => {
    if (!confirm('Are you sure you want to cancel this V-Date?')) return;

    try {
      await vdatesService.cancelVDate(vdateId);
      toast({
        title: 'Success',
        description: 'V-Date cancelled successfully'
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel V-Date',
        variant: 'destructive'
      });
    }
  };

  const getOtherUser = (vdate: VDate) => {
    // Return the first available user profile
    return vdate.user1 || vdate.user2;
  };

  const handleButtonClick = (section: 'schedule' | 'upcoming' | 'history') => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'schedule':
        return (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Schedule New V-Date</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading matches...</div>
              ) : matches.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No matches available to schedule V-Dates with.</p>
                  <p className="text-sm text-gray-500 mt-2">Connect with users first to schedule V-Dates.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Match</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={selectedMatch}
                      onChange={(e) => setSelectedMatch(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Select a connected user...</option>
                      {matches.map((match) => (
                        <option key={match.user_id} value={match.user_id}>
                          {match.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full p-2 border rounded-lg"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      disabled={submitting}
                    >
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleScheduleVDate}
                      disabled={submitting || !selectedMatch || !scheduledTime}
                    >
                      {submitting ? 'Scheduling...' : 'Schedule V-Date'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveSection('overview')}
                      disabled={submitting}
                      className="text-black"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'upcoming':
        return (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Upcoming V-Dates</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : upcomingVDates.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No upcoming V-Dates scheduled.</p>
                  <Button 
                    className="mt-4 text-white"
                    onClick={() => setActiveSection('schedule')}
                    style={{ backgroundColor: '#E30613' }}
                  >
                    Schedule Your First V-Date
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingVDates.map((vdate) => {
                    const otherUser = getOtherUser(vdate);
                    const scheduledDate = new Date(vdate.scheduled_time);
                    const now = new Date();
                    const canJoin = (scheduledDate.getTime() - now.getTime()) / (1000 * 60) <= 15;

                    return (
                      <div key={vdate.id} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <img 
                          src={otherUser?.profile_picture || '/placeholder.svg'} 
                          alt={otherUser?.full_name || 'User'} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{otherUser?.full_name || 'Unknown User'}</h4>
                          <p className="text-sm text-gray-600">
                            {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {vdate.duration} min
                          </p>
                          {!canJoin && (
                            <p className="text-xs text-gray-500 mt-1">
                              Available to join 15 minutes before scheduled time
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleJoinVDate(vdate)}
                            disabled={!canJoin}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelVDate(vdate.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="outline" onClick={() => setActiveSection('overview')} className="w-full text-black">
                    Back to Overview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'history':
        return (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>V-Date History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : pastVDates.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No V-Date history yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Your completed V-Dates will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastVDates.map((vdate) => {
                    const otherUser = getOtherUser(vdate);
                    const scheduledDate = new Date(vdate.scheduled_time);
                    const rating = vdate.rating_1 || vdate.rating_2;
                    
                    const statusColors = {
                      completed: 'text-green-600',
                      missed: 'text-red-600',
                      cancelled: 'text-gray-600'
                    };

                    const statusLabels = {
                      completed: 'Completed',
                      missed: 'Missed',
                      cancelled: 'Cancelled'
                    };

                    return (
                      <div key={vdate.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={otherUser?.profile_picture || '/placeholder.svg'} 
                          alt={otherUser?.full_name || 'User'} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{otherUser?.full_name || 'Unknown User'}</h4>
                          <p className="text-sm text-gray-600">
                            {scheduledDate.toLocaleDateString()} • {vdate.duration} min
                          </p>
                          {rating && (
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${statusColors[vdate.status as keyof typeof statusColors]}`}>
                          {statusLabels[vdate.status as keyof typeof statusLabels] || vdate.status}
                        </span>
                      </div>
                    );
                  })}
                  <Button variant="outline" onClick={() => setActiveSection('overview')} className="w-full text-black">
                    Back to Overview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
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

          {/* Dynamic Content Section */}
          {renderContent()}

          {/* Features Section - Only show in overview */}
          {activeSection === 'overview' && (
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
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
