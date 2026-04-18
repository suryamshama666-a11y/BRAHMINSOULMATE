import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Video,
  Clock,
  User,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  Info,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { vdatesService } from '@/services/api/vdates.service';
import { interestsService } from '@/services/api/interests.service';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';

const VDates: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'overview' | 'schedule' | 'upcoming' | 'history'>('overview');
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const [upcomingVDates, setUpcomingVDates] = useState<any[]>([]);
  const [vdateHistory, setVdateHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ vdateId: string; rating: number; feedback: string } | null>(null);

  // Form states
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use any casting for connections query to handle schema drift
      const { data: connections } = await (supabase as any)
        .from('connections')
        .select(`
          *,
          user1:user_id_1 (*),
          user2:user_id_2 (*)
        `)
        .eq('status', 'connected');

      if (connections) {
        const otherUsers = connections.map((conn: any) => {
          const other = conn.user_id_1 === user.id ? conn.user2 : conn.user1;
          return {
            user_id: other?.user_id || other?.id,
            full_name: other?.display_name || other?.first_name ? `${other?.first_name} ${other?.last_name || ''}` : 'User',
            profile_photo_url: other?.profile_picture_url || other?.profile_photo_url || null
          };
        });
        setConnectedUsers(otherUsers);
      }

      const upcoming = await vdatesService.getUpcomingVDates();
      setUpcomingVDates(upcoming);

      const history = await vdatesService.getVDateHistory();
      setVdateHistory(history);
    } catch (error) {
      console.error('Error fetching V-Date data:', error);
      toast.error('Failed to load V-Date information');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleVDate = async () => {
    if (!selectedUser || !scheduledTime) {
      toast.error('Please select a user and time');
      return;
    }

    setSubmitting(true);
    try {
      await vdatesService.scheduleVDate(selectedUser, scheduledTime, duration);
      toast.success('V-Date scheduled successfully!');
      setActiveSection('upcoming');
      fetchData();
      // Reset form
      setSelectedUser('');
      setScheduledTime('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule V-Date');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinVDate = (vdateId: string) => {
    navigate(`/vdate-call/${vdateId}`);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackModal || feedbackModal.rating === 0) return;

    try {
      await vdatesService.submitFeedback(
        feedbackModal.vdateId,
        feedbackModal.rating,
        feedbackModal.feedback
      );
      toast.success('Feedback submitted! Thank you.');
      setFeedbackModal(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback');
    }
  };

  const getOtherUser = (vdate: any) => {
    return vdate.otherUser;
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  const statusLabels: Record<string, string> = {
    pending: 'Awaiting Confirmation',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed'
  };

  if (feedbackModal) {
    const vdate = vdateHistory.find(v => v.id === feedbackModal.vdateId);
    const otherUser = vdate ? getOtherUser(vdate) : null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Rate your V-Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-2">
                <AvatarImage src={otherUser?.profile_picture_url || otherUser?.profile_photo_url} />
                <AvatarFallback>{(otherUser?.display_name || otherUser?.full_name || 'U')[0]}</AvatarFallback>
              </Avatar>
              <p className="font-medium">{otherUser?.display_name || otherUser?.full_name || 'Your Match'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-center text-black">
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
              <label className="block text-sm font-medium mb-2 text-black">
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
                className="text-black"
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
              <CardTitle className="text-black">Schedule New V-Date</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading connections...</div>
              ) : connectedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">No connections available to schedule V-Dates with.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Accept interests from other users to create connections first.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black">Select Connection</label>
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
                    <label className="block text-sm font-medium mb-2 text-black">Date & Time</label>
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
                    <label className="block text-sm font-medium mb-2 text-black">Duration</label>
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
              <CardTitle className="text-black">Upcoming V-Dates</CardTitle>
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
                    const canJoin = minutesUntil <= 5 && minutesUntil > - (vdate.duration || 30);

                    return (
                      <div key={vdate.id} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={otherUser?.profile_picture_url || otherUser?.profile_photo_url} />
                          <AvatarFallback>{(otherUser?.display_name || otherUser?.full_name || 'U')[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-black">{otherUser?.display_name || otherUser?.full_name || 'Unknown User'}</h4>
                          <p className="text-sm text-gray-600">
                            {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {(vdate as any).duration || 30} min
                          </p>
                          {canJoin ? (
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              Ready to join now!
                            </p>
                          ) : (
                            <p className="text-xs text-blue-600 mt-1">
                              {minutesUntil > 60 
                                ? `Starts in ${Math.floor(minutesUntil / 60)}h ${Math.floor(minutesUntil % 60)}m`
                                : `Starts in ${Math.floor(minutesUntil)} minutes`}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm"
                            disabled={!canJoin}
                            className={`${canJoin ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300'} text-white`}
                            onClick={() => handleJoinVDate(vdate.id)}
                          >
                            Join Call
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-red-600"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to cancel this V-Date?')) {
                                try {
                                  await vdatesService.cancelVDate(vdate.id);
                                  toast.success('V-Date cancelled');
                                  fetchData();
                                } catch (error: any) {
                                  toast.error(error.message || 'Failed to cancel');
                                }
                              }
                            }}
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
              <CardTitle className="text-black">V-Date History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : vdateHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No past V-Dates found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vdateHistory.map((vdate) => {
                    const otherUser = getOtherUser(vdate);
                    const scheduledDate = new Date(vdate.scheduled_time);
                    const rating = vdate.viewer_rating || vdate.participant_rating;

                    return (
                      <div key={vdate.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={otherUser?.profile_picture_url || otherUser?.profile_photo_url} />
                          <AvatarFallback>{(otherUser?.display_name || otherUser?.full_name || 'U')[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-black">{otherUser?.display_name || otherUser?.full_name || 'Unknown User'}</h4>
                          <p className="text-sm text-gray-600">
                            {scheduledDate.toLocaleDateString()} • {(vdate as any).duration || 30} min
                          </p>
                          {rating && (
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[vdate.status] || ''}`}>
                            {statusLabels[vdate.status] || vdate.status}
                          </span>
                          {!rating && vdate.status === 'completed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs text-black"
                              onClick={() => setFeedbackModal({ vdateId: vdate.id, rating: 0, feedback: '' })}
                            >
                              Leave Feedback
                            </Button>
                          )}
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
                <CardTitle className="flex items-center gap-2 text-black font-semibold">
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
                <CardTitle className="flex items-center gap-2 text-black font-semibold">
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
                <CardTitle className="flex items-center gap-2 text-black font-semibold">
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

export default VDates;
