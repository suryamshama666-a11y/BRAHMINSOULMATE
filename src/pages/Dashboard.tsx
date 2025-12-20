import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Calendar, Users, Eye, Star,
  Video, Crown, UserPlus, Loader2, Sparkles, TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    profileViews: 0,
    interestsSent: 0,
    messageCount: 0,
    vDatesCount: 0,
  });
  const [recentMembers, setRecentMembers] = useState<UserProfile[]>([]);
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

        // Fetch recent members
        const { data: recentData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .order('created_at', { ascending: false })
          .limit(6);

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

        // Fetch real activity stats
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
        setRecentMembers((recentData as any[]) || []);
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

  const statsDisplay = [
    { title: 'Profile Views', value: stats.profileViews, icon: Eye, gradient: 'from-[#D32F2F] to-[#FF5252]' },
    { title: 'Interests Sent', value: stats.interestsSent, icon: Heart, gradient: 'from-[#C2185B] to-[#F06292]' },
    { title: 'Messages', value: stats.messageCount, icon: MessageCircle, gradient: 'from-[#7B1FA2] to-[#BA68C8]' },
    { title: 'V-Dates', value: stats.vDatesCount, icon: Video, gradient: 'from-[#E64A19] to-[#FF8A65]' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#D32F2F]" />
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Initialising Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF5]">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#D32F2F] to-[#F57C00] text-white rounded-[2.5rem] p-10 shadow-2xl">
            <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-white/10 rounded-full blur-[120px]"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Premium Matchmaking</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight">
                  Suprabhatam, {profile?.first_name || profile?.name?.split(' ')[0] || 'Member'}
                </h1>
                <p className="text-red-50 text-lg max-w-md">
                  Discover meaningful connections within the Brahmin community through our refined matchmaking.
                </p>
              </div>
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-inner">
                <Badge className="bg-yellow-400 text-[#1A1A1A] px-6 py-2 font-black mb-4 shadow-lg border-0">
                  <Crown className="h-4 w-4 mr-2" />
                  {profile?.subscription_type === 'premium' ? 'GOLD ELITE' : 'CLASSIC MEMBER'}
                </Badge>
                <Link to="/premium">
                  <Button variant="outline" className="text-white border-white/40 hover:bg-white/20 rounded-xl px-8 transition-all font-bold">
                    View Benefits
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsDisplay.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white group rounded-3xl overflow-hidden border-b-4 border-transparent hover:border-red-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{stat.title}</p>
                    <p className="text-3xl font-black text-[#1A1A1A]">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:rotate-6 transition-all`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* Online Members Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-2xl font-serif font-black text-[#1A1A1A]">Online Members</h2>
                </div>
                <Link to="/search?filter=online" className="text-sm font-bold text-[#D32F2F] hover:text-[#B71C1C] transition-colors">VIEW ALL</Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                {(onlineMembers.length > 0 ? onlineMembers : Array.from({ length: 6 })).map((member: any, i) => (
                  <Link to={member?.id ? `/profile/${member.id}` : '#'} key={member?.id || i} className="flex flex-col items-center group cursor-pointer">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-4 border-white shadow-xl group-hover:scale-105 transition-all duration-300 ring-2 ring-red-50">
                        <AvatarImage src={member?.profile_picture_url || `https://i.pravatar.cc/150?u=${i + 40}`} />
                        <AvatarFallback className="bg-red-50 text-red-600 font-bold">{member?.first_name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                    </div>
                    <span className="text-[11px] font-black mt-3 text-gray-700 group-hover:text-red-600 transition-colors uppercase tracking-tight truncate w-full text-center">
                      {member?.first_name || 'Active'}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Recommended Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-black text-[#1A1A1A]">Recommended for You</h2>
                <Link to="/matches" className="text-sm font-bold text-[#D32F2F] hover:text-[#B71C1C] transition-colors">VIEW ALL</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {matches.map((match) => (
                  <Card key={match.id} className="border-0 shadow-md hover:shadow-2xl transition-all rounded-[2.5rem] overflow-hidden bg-white group border-t-4 border-red-50">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="sm:w-2/5 aspect-square sm:aspect-auto sm:h-auto overflow-hidden">
                        <img 
                          src={match.profile_picture_url || `https://i.pravatar.cc/300?u=${match.id}`} 
                          alt={match.first_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="sm:w-3/5 p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-black text-[#1A1A1A] mb-1">{match.first_name} {match.last_name}</h3>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4">{match.subcaste} • {match.work_location || 'Mumbai'}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-red-50 text-red-700 border-0 text-[10px] font-black uppercase">{match.gotra || 'Gotra'}</Badge>
                            <Badge className="bg-amber-50 text-amber-700 border-0 text-[10px] font-black uppercase">High Match</Badge>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <Button className="flex-grow rounded-2xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-black text-xs h-11 shadow-lg shadow-red-100">
                            Connect
                          </Button>
                          <Button variant="outline" size="icon" className="rounded-2xl border-gray-100 hover:border-red-200 hover:text-red-600 h-11 w-11 shadow-sm">
                            <Heart className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <Card className="border-0 shadow-2xl rounded-[3rem] bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-white p-10 overflow-hidden relative group">
              <div className="relative z-10">
                <Badge className="bg-red-600 text-white mb-4 font-black">NEW</Badge>
                <h3 className="text-2xl font-black mb-3 leading-tight">Video Matchmaking</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">Schedule virtual meetings with your potential soulmate from the comfort of your home.</p>
                <Link to="/v-dates">
                  <Button className="w-full bg-white text-black hover:bg-gray-100 rounded-2xl font-black h-12 shadow-xl group-hover:scale-[1.02] transition-transform">
                    Schedule V-Date
                  </Button>
                </Link>
              </div>
              <div className="absolute right-[-20%] bottom-[-20%] w-60 h-60 bg-red-600/20 rounded-full blur-[100px]"></div>
            </Card>

            <Card className="border-0 shadow-sm rounded-[2.5rem] bg-white p-8">
              <h3 className="text-lg font-black mb-8 text-[#1A1A1A] border-l-4 border-red-600 pl-4 uppercase tracking-wider">Newest Members</h3>
              <div className="space-y-8">
                {recentMembers.slice(0, 5).map((member) => (
                  <Link to={`/profile/${member.id}`} key={member.id} className="flex items-center gap-5 group">
                    <Avatar className="h-14 w-14 rounded-2xl shadow-lg ring-2 ring-red-50 group-hover:ring-red-200 transition-all">
                      <AvatarImage src={member.profile_picture_url || `https://i.pravatar.cc/100?u=${member.id}`} />
                      <AvatarFallback className="bg-red-50 text-red-600 font-bold">{member.first_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-black text-[#1A1A1A] truncate group-hover:text-red-600 transition-colors">{member.first_name} {member.last_name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{member.subcaste || 'Brahmin'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
