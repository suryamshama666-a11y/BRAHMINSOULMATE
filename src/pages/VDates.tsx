import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Clock, Users, AlertCircle, Star, X } from 'lucide-react';
import Footer from '@/components/Footer';
import { vdatesService, VDate } from '@/services/api/vdates.service';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import VideoCall from '@/components/vdates/VideoCall';

interface ConnectedUser {
  user_id: string;
  full_name: string;
  profile_photo_url?: string;
}

export default function VDates() {
  const [activeSection, setActiveSection] = useState<'overview' | 'schedule' | 'upcoming' | 'history'>('overview');
  const [upcomingVDates, setUpcomingVDates] = useState<VDate[]>([]);
  const [pastVDates, setPastVDates] = useState<VDate[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  // Form state
  const [selectedUser, setSelectedUser] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(30);

  // Video call state
  const [activeCall, setActiveCall] = useState<{
    vdate: VDate;
    roomUrl: string;
    roomName: string;
  } | null>(null);

  // Feedback modal state
  const [feedbackModal, setFeedbackModal] = useState<{
    vdate: VDate;
    rating: number;
    feedback: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setCurrentUser({ ...user, profile });

      // Load connected users for scheduling
      const connected = await vdatesService.getConnectedUsers();
      setConnectedUsers(connected);

      // Load upcoming V-Dates
      const upcoming = await vdatesService.getUpcomingVDates();
      setUpcomingVDates(upcoming);

      // Load all V-Dates and filter past ones
      const allVDates = await vdatesService.getMyVDates();
      const past = allVDates.filter(v => 
        v.status === 'completed' || v.status === 'missed' || v.status === 'cancelled'
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
    if (!selectedUser || !scheduledTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select a connection and date/time',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      await vdatesService.scheduleVDate(selectedUser, scheduledTime, duration);
      toast({
        title: 'Success',
        description: 'V-Date scheduled successfully! Both of you will receive notifications.'
      });
      
      // Reset form
      setSelectedUser('');
      setScheduledTime('');
      setDuration(30);
      
      // Reload data and go to upcoming
      await loadData();
      setActiveSection('upcoming');
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
      const { roomUrl, roomName } = await vdatesService.joinVDate(vdate.id);
      setActiveCall({ vdate, roomUrl, roomName });
      
      toast({
        title: 'Joining V-Date',
        description: 'Connecting to video call...'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join V-Date',
        variant: 'destructive'
      });
    }
  };

  const handleEndCall = async () => {
    if (activeCall) {
      try {
        // Mark as completed
        await vdatesService.completeVDate(activeCall.vdate.id);
        
        // Show feedback modal
        setFeedbackModal({
          vdate: activeCall.vdate,
          rating: 0,
          feedback: ''
        });
      } catch (error) {
        console.error('Error completing V-Date:', error);
      }
    }
    setActiveCall(null);
    await loadData();
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackModal || feedbackModal.rating === 0) {
      toast({
        title: 'Please rate your experience',
        description: 'Select a star rating before submitting',
        variant: 'destructive'
      });
      return;
    }

    try {
      await vdatesService.submitFeedback(feedbackModal.vdate.id, {
        rating: feedbackModal.rating,
        feedback: feedbackModal.feedback
      });
      
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted.'
      });
      
      setFeedbackModal(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit feedback',
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
    if (!currentUser) return vdate.user1 || vdate.user2;
    
    if (vdate.user_id_1 === currentUser.id) {
      return vdate.user2;
    }
    return vdate.user1;
  };

  // If in active call, show video call component
  if (activeCall) {
    const otherUser = getOtherUser(activeCall.vdate);
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <VideoCall
          roomName={activeCall.roomName}
          userName={currentUser?.profile?.full_name || 'User'}
          otherUserName={otherUser?.full_name}
          onEnd={handleEndCall}
        />
      </div>
    );
  }

  // Feedback Modal
  if (feedbackModal) {
    const otherUser = getOtherUser(feedbackModal.vdate);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Rate Your V-Date</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setFeedbackModal(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <img 
                src={otherUser?.profile_photo_url || '/placeholder.svg'} 
                alt={otherUser?.full_name || 'User'} 
                className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
              />
              <p className="font-medium">{otherUser?.full_name || 'Your Match'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-center">
                How was your experience?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackModal({ ...feedbackModal, rating: star })}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`h-8 w-8 ${
                        star <= feedbackModal.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Share your thoughts (optional)
              </label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                placeholder="How did the conversation go?"
                value={feedbackModal.feedback}
                onChange={(e) => setFeedbackModal({ ...feedbackModal, feedback: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleSubmitFeedback}
              >
                Submit Feedback
              </Button>
              <Button 
                variant="outline"
                onClick={() => setFeedbackModal(null)}
              >
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


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
                <div className="text-center py-8">Loading connections...</div>
              ) : connectedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No connections available to schedule V-Dates with.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Accept interests from other users to create connections first.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Connection</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Select a connected user...</option>
                      {connectedUsers.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.full_name}
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
                      min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                      disabled={submitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 1 hour from now
                    </p>
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
                      disabled={submitting || !selectedUser || !scheduledTime}
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
                    const minutesUntil = (scheduledDate.getTime() - now.getTime()) / (1000 * 60);
                    const canJoin = minutesUntil <= 5 && minutesUntil > -vdate.duration;

                    return (
                      <div key={vdate.id} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <img 
                          src={otherUser?.profile_photo_url || '/placeholder.svg'} 
                          alt={otherUser?.full_name || 'User'} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{otherUser?.full_name || 'Unknown User'}</h4>
                          <p className="text-sm text-gray-600">
                            {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {vdate.duration} min
                          </p>
                          {canJoin ? (
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              Ready to join now!
                            </p>
                          ) : minutesUntil > 0 ? (
                            <p className="text-xs text-gray-500 mt-1">
                              Available to join 5 minutes before scheduled time
                            </p>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className={`text-white ${canJoin ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 'bg-gray-400'}`}
                            onClick={() => handleJoinVDate(vdate)}
                            disabled={!canJoin}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            {canJoin ? 'Join Now' : 'Join'}
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
                    
                    const statusColors: Record<string, string> = {
                      completed: 'text-green-600 bg-green-50',
                      missed: 'text-red-600 bg-red-50',
                      cancelled: 'text-gray-600 bg-gray-50'
                    };

                    const statusLabels: Record<string, string> = {
                      completed: 'Completed',
                      missed: 'Missed',
                      cancelled: 'Cancelled'
                    };

                    return (
                      <div key={vdate.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={otherUser?.profile_photo_url || '/placeholder.svg'} 
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
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusColors[vdate.status] || ''}`}>
                          {statusLabels[vdate.status] || vdate.status}
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
              Schedule virtual dates with your connections in a safe and comfortable environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Calendar className="h-5 w-5" style={{ color: '#E30613' }} />
                  Schedule V-Date
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4 flex-grow">
                  Schedule a virtual date with someone you're connected with.
                </p>
                <Button
                  onClick={() => setActiveSection('schedule')}
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
                <CardTitle className="flex items-center gap-2 text-black">
                  <Clock className="h-5 w-5" style={{ color: '#E30613' }} />
                  Upcoming V-Dates
                  {upcomingVDates.length > 0 && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {upcomingVDates.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4 flex-grow">
                  View and join your scheduled virtual dates.
                </p>
                <Button
                  onClick={() => setActiveSection('upcoming')}
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
                <CardTitle className="flex items-center gap-2 text-black">
                  <Video className="h-5 w-5" style={{ color: '#E30613' }} />
                  V-Date History
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4 flex-grow">
                  Review your past virtual dating experiences.
                </p>
                <Button
                  onClick={() => setActiveSection('history')}
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
                    How V-Dates Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-red-600 font-bold">1</span>
                      </div>
                      <h3 className="font-semibold mb-2">Schedule</h3>
                      <p className="text-gray-600 text-sm">
                        Pick a connection and choose a convenient time for both of you.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-red-600 font-bold">2</span>
                      </div>
                      <h3 className="font-semibold mb-2">Get Reminded</h3>
                      <p className="text-gray-600 text-sm">
                        Receive notifications 24 hours, 1 hour, and 15 minutes before.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-red-600 font-bold">3</span>
                      </div>
                      <h3 className="font-semibold mb-2">Join Call</h3>
                      <p className="text-gray-600 text-sm">
                        Click "Join" when it's time - video call opens right in your browser.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-red-600 font-bold">4</span>
                      </div>
                      <h3 className="font-semibold mb-2">Rate & Connect</h3>
                      <p className="text-gray-600 text-sm">
                        After the call, rate your experience and continue the conversation.
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
