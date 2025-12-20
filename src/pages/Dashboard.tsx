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
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);

        const userGender = profile?.gender || 'male';
        const oppositeGender = userGender === 'male' ? 'female' : 'male';

        // Fetch recent members of opposite gender
        const { data: recentData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .order('created_at', { ascending: false })
          .limit(6);

        // Fetch potential matches
        const { data: matchesData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .limit(5);

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
        setRecentMembers((recentData as UserProfile[]) || []);
        setMatches((matchesData as UserProfile[]) || []);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, profile?.gender]);

  const statsDisplay = [
    { title: 'Profile Views', value: stats.profileViews, icon: Eye, gradient: 'from-[#FF6B6B] to-[#FF8E8E]' },
    { title: 'Interests Sent', value: stats.interestsSent, icon: Heart, gradient: 'from-[#FF4E50] to-[#F9D423]' },
    { title: 'Messages', value: stats.messageCount, icon: MessageCircle, gradient: 'from-[#6a11cb] to-[#2575fc]' },
    { title: 'V-Dates', value: stats.vDatesCount, icon: Video, gradient: 'from-[#00b09b] to-[#96c93d]' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#FF4500]" />
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Initialising Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="relative overflow-hidden bg-[#1A1A1A] text-white rounded-[2.5rem] p-10 shadow-2xl">
            <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-[#FF4500] rounded-full blur-[120px] opacity-20"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-orange-500 rounded-full blur-[120px] opacity-10"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Exclusive Platform</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight">
                  Suprabhatam, {profile?.first_name || profile?.name?.split(' ')[0] || 'Member'}
                </h1>
                <p className="text-gray-400 text-lg max-w-md">
                  Discover meaningful connections within the Brahmin community through our refined matchmaking.
                </p>
              </div>
              <div className="flex flex-col items-center bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-inner">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 font-bold mb-4 shadow-lg border-0">
                  <Crown className="h-4 w-4 mr-2" />
                  {profile?.subscription_type === 'premium' ? 'GOLD ELITE' : 'CLASSIC MEMBER'}
                </Badge>
                <Link to="/premium">
                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-xl px-8 transition-all">
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
            <Card key={index} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white group rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">{stat.title}</p>
                    <p className="text-3xl font-black text-[#1A1A1A]">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-[10px] text-green-500 font-bold">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+12% FROM LAST WEEK</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* Online Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-black text-[#1A1A1A]">Online Now</h2>
                <div className="h-px flex-grow mx-6 bg-gray-100 hidden sm:block"></div>
                <Badge variant="outline" className="text-[#FF4500] border-[#FF4500]/20 font-bold">
                  LIVE
                </Badge>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center group cursor-pointer">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-white ring-2 ring-[#FF4500]/10 group-hover:ring-[#FF4500] transition-all duration-300 shadow-md">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${i + 20}`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-bold mt-2 text-gray-500 group-hover:text-[#1A1A1A] transition-colors uppercase">Active</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommendations */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-black text-[#1A1A1A]">Handpicked for You</h2>
                <Link to="/matches" className="text-sm font-bold text-[#FF4500] hover:underline">VIEW ALL</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <Card key={match.id} className="border-0 shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden bg-white group">
                    <CardContent className="p-0 flex">
                      <div className="w-1/3 aspect-[3/4] overflow-hidden">
                        <img 
                          src={match.profile_picture || `https://i.pravatar.cc/300?u=${match.id}`} 
                          alt={match.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="w-2/3 p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-black text-[#1A1A1A] line-clamp-1">{match.name || 'Member'}</h3>
                          <p className="text-xs text-gray-500 font-medium mb-3">{match.subcaste} • {match.city || 'Location'}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-gray-50 text-gray-600 border-0 text-[10px] font-bold">{match.gotra}</Badge>
                            <Badge className="bg-rose-50 text-rose-600 border-0 text-[10px] font-bold">Match Score: 88%</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-grow rounded-xl bg-[#1A1A1A] hover:bg-black text-white font-bold text-xs h-9">
                            Connect
                          </Button>
                          <Button size="icon" variant="outline" className="rounded-xl border-gray-100 hover:border-rose-200 hover:text-rose-500 h-9 w-9">
                            <Heart className="h-4 w-4" />
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
          <div className="space-y-8">
            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-[#FF4500] text-white p-8 overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-2">V-Date Feature</h3>
                <p className="text-white/80 text-sm mb-6">Connect with potential matches through secure video calls.</p>
                <Link to="/v-dates">
                  <Button className="w-full bg-white text-[#FF4500] hover:bg-gray-100 rounded-2xl font-black shadow-lg">
                    Schedule Now
                  </Button>
                </Link>
              </div>
              <div className="absolute right-[-20%] bottom-[-20%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </Card>

            <Card className="border-0 shadow-sm rounded-[2rem] bg-white p-6">
              <CardTitle className="text-lg font-black mb-6 text-[#1A1A1A]">Recent Activity</h3CardTitle>
              <div className="space-y-6">
                {recentMembers.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center gap-4 group cursor-pointer">
                    <Avatar className="h-12 w-12 rounded-xl group-hover:scale-105 transition-transform">
                      <AvatarImage src={member.profile_picture || `https://i.pravatar.cc/100?u=${member.id}`} />
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-black text-[#1A1A1A] truncate">{member.name || 'New Member'}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Just Joined</p>
                    </div>
                    <div className="w-2 h-2 bg-[#FF4500] rounded-full"></div>
                  </div>
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
