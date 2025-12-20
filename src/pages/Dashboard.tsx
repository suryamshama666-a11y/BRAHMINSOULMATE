import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Users, Video, Eye, Loader2, Sparkles, UserPlus, Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    profileViews: 0,
    interestsSent: 0,
    messageCount: 0,
    vDatesCount: 0,
  });
  const [onlineMembers, setOnlineMembers] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<UserProfile[]>([]);
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
          .limit(12);

        // Fetch potential matches
        const { data: matchesData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .limit(4);

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
        setOnlineMembers((onlineData as any[]) || []);
        setMatches((matchesData as any[]) || []);

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
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-8 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
              Welcome back, {profile?.first_name || profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Member'}!
            </h1>
            <p className="text-red-100 text-lg">Your journey to finding the perfect soulmate continues here.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Profile Views', value: stats.profileViews, icon: Eye, color: 'bg-red-500' },
            { label: 'Interests Sent', value: stats.interestsSent, icon: Heart, color: 'bg-amber-500' },
            { label: 'Messages', value: stats.messageCount, icon: MessageCircle, color: 'bg-red-500' },
            { label: 'V-Dates', value: stats.vDatesCount, icon: Video, color: 'bg-amber-500' },
          ].map((stat, i) => (
            <Card key={i} className="border-2 border-red-100/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-red-600">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* Online Members Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-2xl font-serif font-bold text-gray-800">Online Members</h2>
                </div>
                <Link to="/search?filter=online" className="text-sm font-bold text-red-600 hover:text-red-700">
                  VIEW ALL
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {onlineMembers.length > 0 ? (
                  onlineMembers.map((member) => (
                    <Link to={`/profile/${member.id}`} key={member.id} className="flex flex-col items-center group">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-white shadow group-hover:scale-105 transition-transform">
                          <AvatarImage src={member.profile_picture_url || `https://i.pravatar.cc/150?u=${member.id}`} />
                          <AvatarFallback className="bg-red-50 text-red-600 font-bold">{member.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <span className="text-xs font-semibold mt-2 text-gray-700 truncate w-full text-center">
                        {member.first_name}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 italic col-span-full text-sm">No members online right now.</p>
                )}
              </div>
            </section>

            {/* Recommended Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-800">Recommended for You</h2>
                <Link to="/matches" className="text-sm font-bold text-red-600 hover:text-red-700">
                  VIEW ALL
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <Card key={match.id} className="border-2 border-red-50 overflow-hidden hover:shadow-lg transition-shadow bg-white rounded-2xl">
                    <CardContent className="p-0 flex h-40">
                      <div className="w-1/3 overflow-hidden">
                        <img 
                          src={match.profile_picture_url || `https://i.pravatar.cc/300?u=${match.id}`} 
                          alt={match.first_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-2/3 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 truncate">{match.first_name} {match.last_name}</h3>
                          <p className="text-xs text-gray-500 font-medium truncate">{match.subcaste || 'Brahmin'} • {match.city || 'Mumbai'}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary" className="bg-red-50 text-red-700 text-[10px] px-2 py-0">
                              {match.gotra || 'Gotra'}
                            </Badge>
                          </div>
                        </div>
                        <Button className="w-full h-8 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg">
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Quick Actions / Sidebar */}
          <div className="space-y-6">
            <Card className="border-2 border-red-100/50 bg-white rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-serif font-bold text-gray-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
                <Link to="/search">
                  <Button variant="outline" className="w-full justify-start gap-3 border-red-100 hover:bg-red-50 text-gray-700 font-semibold">
                    <Users className="h-4 w-4 text-red-500" />
                    Search Profiles
                  </Button>
                </Link>
                <Link to="/v-dates">
                  <Button variant="outline" className="w-full justify-start gap-3 border-amber-100 hover:bg-amber-50 text-gray-700 font-semibold">
                    <Video className="h-4 w-4 text-amber-500" />
                    Video Dates
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="outline" className="w-full justify-start gap-3 border-red-100 hover:bg-red-50 text-gray-700 font-semibold">
                    <MessageCircle className="h-4 w-4 text-red-500" />
                    Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-red-600 to-amber-600 text-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-yellow-300" />
                <h3 className="font-bold text-lg">Premium Membership</h3>
              </div>
              <p className="text-red-50 text-sm mb-6 leading-relaxed">
                Unlock unlimited matches, priority messaging, and advanced horoscope matching.
              </p>
              <Link to="/premium">
                <Button className="w-full bg-white text-red-600 hover:bg-red-50 font-bold rounded-xl h-11">
                  Upgrade Now
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
