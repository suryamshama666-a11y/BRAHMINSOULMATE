import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Users, Video, Loader2, Crown, Sparkles, ChevronRight, MapPin, Briefcase
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    profileViews: 0,
    interestsSent: 0,
    messageCount: 0,
    vDatesCount: 0,
  });
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);
  const [newMembers, setNewMembers] = useState<any[]>([]);
  const [recommendedMatches, setRecommendedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);

        const userGender = profile?.gender || 'male';
        const oppositeGender = userGender === 'male' ? 'female' : 'male';

        // Fetch online members (active in last 60 mins)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: onlineData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .gt('last_active', oneHourAgo)
          .order('last_active', { ascending: false })
          .limit(10);

        // Fetch new members
        const { data: newData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recommended matches
        const { data: matchesData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .limit(5);

        // Fetch activity stats
        const { data: activityData } = await supabase
          .from('user_activity')
          .select('action, count')
          .eq('user_id', user.id);

        const activityStats = {
          profileViews: activityData?.find(a => a.action === 'profile_view')?.count || 0,
          interestsSent: activityData?.find(a => a.action === 'interest_sent')?.count || 0,
          messageCount: activityData?.find(a => a.action === 'message_sent')?.count || 0,
          vDatesCount: activityData?.find(a => a.action === 'vdate_joined')?.count || 0,
        };

        setStats(activityStats);
        
        const transformProfile = (p: any) => ({
          id: p.id,
          name: p.first_name + (p.last_name ? ` ${p.last_name}` : ''),
          age: p.age || 25,
          gender: p.gender,
          location: `${p.city || 'Mumbai'}, ${p.state || 'Maharashtra'}`,
          profession: p.occupation || 'Professional',
          avatarUrl: p.profile_picture_url,
          subscription_type: p.subscription_type || 'free',
          lastSeen: 'Active now'
        });

        setOnlineMembers(onlineData?.map(transformProfile) || []);
        setNewMembers(newData?.map(transformProfile) || []);
        setRecommendedMatches(matchesData?.map(transformProfile) || []);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, profile?.gender]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-32" />
            <div className="relative z-10">
              <h1 className="text-3xl font-serif font-bold mb-2">
                Welcome, {profile?.first_name || profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-red-100">Find your perfect match today</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Profile Views', value: stats.profileViews, icon: Heart, color: 'bg-red-500' },
            { label: 'Messages', value: stats.messageCount, icon: MessageCircle, color: 'bg-amber-500' },
            { label: 'Matches', value: stats.interestsSent, icon: Users, color: 'bg-red-500' },
            { label: 'V-Dates', value: stats.vDatesCount, icon: Video, color: 'bg-amber-500' },
          ].map((stat, i) => (
            <Card key={i} className="border-2 border-red-100/50 hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-red-600">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-full ${stat.color} shadow-lg shadow-red-500/20`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Online Members - CIRCULAR STORIES STYLE */}
        <section className="mb-10 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Online Members
            </h2>
            <Link to="/online-profiles" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center group">
              VIEW ALL
              <ChevronRight className="h-3 w-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {onlineMembers.length > 0 ? (
              onlineMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex flex-col items-center min-w-[80px] cursor-pointer group"
                  onClick={() => navigate(`/profile/${member.id}`)}
                >
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 mb-2">
                    <Avatar className="h-16 w-16 border-2 border-white">
                      <AvatarImage src={member.avatarUrl} alt={member.name} className="object-cover" />
                      <AvatarFallback className="bg-red-100 text-red-600 font-bold">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 truncate w-20 text-center">{member.name.split(' ')[0]}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No members online right now.</p>
            )}
          </div>
        </section>

        {/* Two-Column Layout for New Members & Recommended */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
            {/* New Members - LEFT COLUMN */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-bold text-gray-800">New Members</h2>
                <Link to="/new-members" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center group">
                  VIEW ALL
                  <ChevronRight className="h-3 w-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            <Card className="border-2 border-red-100/50 overflow-hidden shadow-sm">
              <CardContent className="p-0 divide-y divide-red-50">
                {newMembers.length > 0 ? (
                  newMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="p-4 flex items-center gap-4 hover:bg-red-50/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/profile/${member.id}`)}
                    >
                      <Avatar className="h-12 w-12 border border-red-200">
                        <AvatarImage src={member.avatarUrl} className="object-cover" />
                        <AvatarFallback className="bg-red-50 text-red-600">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">{member.name}, {member.age}</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {member.location.split(',')[0]}</span>
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {member.profession}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100 h-8 w-8 p-0 rounded-full">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 italic">No new members yet.</div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Recommended Matches - RIGHT COLUMN */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Recommended
              </h2>
              <Link to="/matches" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center group">
                VIEW ALL
                <ChevronRight className="h-3 w-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <Card className="border-2 border-amber-100/50 overflow-hidden shadow-sm">
              <CardContent className="p-0 divide-y divide-amber-50">
                {recommendedMatches.length > 0 ? (
                  recommendedMatches.map((match) => (
                    <div 
                      key={match.id} 
                      className="p-4 flex items-center gap-4 hover:bg-amber-50/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/profile/${match.id}`)}
                    >
                      <Avatar className="h-12 w-12 border border-amber-200">
                        <AvatarImage src={match.avatarUrl} className="object-cover" />
                        <AvatarFallback className="bg-amber-50 text-amber-600">{match.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-gray-800 truncate group-hover:text-amber-600 transition-colors">{match.name}, {match.age}</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {match.location.split(',')[0]}</span>
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {match.profession}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 h-8 w-8 p-0 rounded-full">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 italic">Finding matches...</div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link to="/search">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50 bg-white/90">
              <CardContent className="p-6 text-center">
                <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-serif font-bold text-lg mb-2">Search Profiles</h3>
                <p className="text-gray-600 text-sm">Find your perfect match</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/v-dates">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-amber-100/50 bg-white/90">
              <CardContent className="p-6 text-center">
                <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-serif font-bold text-lg mb-2">Video Dates</h3>
                <p className="text-gray-600 text-sm">Meet virtually first</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/messages">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50 bg-white/90">
              <CardContent className="p-6 text-center">
                <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-serif font-bold text-lg mb-2">Messages</h3>
                <p className="text-gray-600 text-sm">Connect with matches</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Premium Membership */}
        <Card className="border-0 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl shadow-xl p-8 relative overflow-hidden group mb-8">
          <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-yellow-400 p-4 rounded-2xl shadow-lg">
                <Crown className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-2xl mb-2 text-white">Premium Membership</h3>
                <p className="text-red-50 font-medium">Unlock unlimited matches, priority messaging, and advanced horoscope matching.</p>
              </div>
            </div>
            <Link to="/premium">
              <Button className="bg-white text-red-600 hover:bg-red-50 font-bold px-8 h-12 rounded-xl shadow-lg transition-transform hover:scale-105">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
