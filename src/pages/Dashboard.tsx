import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Users, Video, Loader2, Crown, Sparkles, ChevronRight, MapPin, Briefcase, Eye, UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    profileViews: 237,
    interestsSent: 10,
    messageCount: 4,
    vDatesCount: 1,
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
            .limit(20);

        // Fetch new members
        const { data: newData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .order('created_at', { ascending: false })
          .limit(4);

        // Fetch recommended matches
        const { data: matchesData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .limit(4);

          const transformProfile = (p: any, type: string) => {
            const formatHeight = (height: any) => {
              if (!height) return "160 cm";
              if (typeof height === 'number') {
                return `${height} cm`;
              }
              if (typeof height === 'string' && !isNaN(Number(height))) {
                return `${height} cm`;
              }
              return height;
            };

            return {
              id: p.id,
              name: p.first_name || (oppositeGender === 'female' ? 'Female Profile' : 'Male Profile'),
              age: p.age || 25,
              gender: p.gender,
              location: `${p.city || 'Mumbai'}, ${p.state || 'Maharashtra'}`,
              profession: p.occupation || 'Professional',
              avatarUrl: p.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
              subscription_type: p.subscription_type || (Math.random() > 0.5 ? 'premium' : 'free'),
              gotra: p.gotra || 'Bharadwaja Gotra',
              community: p.community || (Math.random() > 0.5 ? 'Iyer' : 'Deshastha'),
              height: formatHeight(p.height),
              matchPercentage: Math.floor(Math.random() * 20) + 80,
              lastSeen: 'Active now'
            };
          };
  
          setOnlineMembers(onlineData?.map((p, i) => ({ ...transformProfile(p, 'online') })) || []);
        setNewMembers(newData?.map(p => transformProfile(p, 'new')) || []);
        setRecommendedMatches(matchesData?.map(p => transformProfile(p, 'recommended')) || []);

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
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#e11d48] to-[#f97316] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex justify-between items-center">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <h1 className="text-4xl font-bold">
                  Welcome back, {profile?.first_name || 'User'}!
                </h1>
              </div>
              <p className="text-xl text-white/90">Your perfect match is waiting for you</p>
            </div>
            <div className="relative z-10 hidden md:block">
              <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold uppercase tracking-wider text-sm">Free Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Profile Views', value: stats.profileViews, icon: Eye, color: 'text-rose-500', bg: 'bg-rose-50' },
            { label: 'Interests Sent', value: stats.interestsSent, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
            { label: 'Messages', value: stats.messageCount, icon: MessageCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'V-Dates', value: stats.vDatesCount, icon: Video, color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-4xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Online Now Section */}
        <section className="mb-12 bg-[#f0fdfa]/30 p-8 rounded-3xl border border-[#ccfbf1]/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-[#10b981] rounded-full animate-pulse" />
                <h2 className="text-2xl font-bold text-teal-900">Online Now</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-1.5 rounded-full border border-teal-100 shadow-sm hidden sm:block">
                  <span className="text-sm font-bold text-[#10b981]">{onlineMembers.length} Online</span>
                </div>
                <Link to="/online-profiles">
                  <Button variant="outline" className="rounded-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 h-9 px-5">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
          <div className="flex flex-wrap gap-x-8 gap-y-10">
            {onlineMembers.length > 0 ? (
              onlineMembers.map((member, i) => (
                <div 
                  key={member.id} 
                  className="flex flex-col items-center w-[100px] cursor-pointer group"
                  onClick={() => navigate(`/profile/${member.id}`)}
                >
                  <div className="relative mb-3">
                    <div className="p-1 rounded-full border-2 border-[#10b981] shadow-lg shadow-teal-100 transform group-hover:scale-110 transition-transform duration-300">
                      <Avatar className="h-20 w-20 border-2 border-white">
                        <AvatarImage src={member.avatarUrl} alt={member.name} className="object-cover" />
                        <AvatarFallback className="bg-teal-50 text-teal-600 font-bold">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-900 text-center line-clamp-1">{member.name}</span>
                  <span className="text-[10px] text-teal-600 font-medium capitalize">{member.gender}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic w-full">No members online right now.</p>
            )}
          </div>
        </section>

        {/* Two-Column Layout for Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* New Members */}
          <section className="bg-white rounded-[32px] border border-rose-100/50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-rose-500" />
                <h2 className="text-2xl font-serif font-bold text-rose-800">New Members</h2>
              </div>
              <Link to="/search">
                <Button variant="destructive" className="rounded-full px-6 bg-[#f43f5e] hover:bg-rose-600 shadow-lg shadow-rose-100">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {newMembers.map((member) => (
                <div key={member.id} className="p-4 rounded-2xl hover:bg-rose-50/50 transition-all flex items-center gap-4 cursor-pointer group border border-transparent hover:border-rose-100/50">
                  <Avatar className="h-20 w-20 rounded-2xl border-2 border-rose-50 shadow-md">
                    <AvatarImage src={member.avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-rose-50 text-rose-600">{member.name[0]}</AvatarFallback>
                  </Avatar>
                    <div className="flex-grow">
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-0.5 group-hover:text-rose-600 transition-colors">{member.name}</h4>
                              <div className="mb-2">
                                  <p className="text-sm text-gray-600 font-medium">{member.age} yrs • {member.height}</p>
                                <p className="text-xs text-rose-500 font-semibold">{member.profession}</p>
                              </div>

                      <div className="flex gap-2">
                      <Badge className="bg-rose-50 text-rose-600 border-none font-medium px-3 py-1 text-[10px] rounded-full">
                        {member.gotra}
                      </Badge>
                      <Badge className={`border-none font-bold uppercase tracking-wider px-3 py-1 text-[9px] rounded-full ${
                        member.subscription_type === 'premium' ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {member.subscription_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-100">
                      <Heart className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-100">
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Matches */}
          <section className="bg-white rounded-[32px] border border-orange-100/50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-orange-500" />
                <h2 className="text-2xl font-serif font-bold text-orange-800">Recommended Matches</h2>
              </div>
              <Link to="/matches">
                <Button variant="destructive" className="rounded-full px-6 bg-[#f97316] hover:bg-orange-600 shadow-lg shadow-orange-100">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {recommendedMatches.map((member, i) => (
                <div key={member.id} className={`p-4 rounded-2xl transition-all flex items-center gap-4 cursor-pointer group border ${
                  i === 2 ? 'bg-orange-50/50 border-orange-100 shadow-sm' : 'hover:bg-orange-50/30 border-transparent hover:border-orange-100/30'
                }`}>
                  <Avatar className="h-20 w-20 rounded-2xl border-2 border-orange-50 shadow-md">
                    <AvatarImage src={member.avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-orange-50 text-orange-600">{member.name[0]}</AvatarFallback>
                  </Avatar>
                    <div className="flex-grow">
                      <h4 className="text-xl font-serif font-bold text-gray-900 mb-0.5 group-hover:text-orange-600 transition-colors">{member.name}</h4>
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 font-medium">{member.age} yrs • {member.height}</p>
                            <p className="text-xs text-orange-600 font-semibold">{member.profession}</p>
                          </div>
                      <div className="flex gap-2 items-center flex-wrap">
                      <Badge className="bg-orange-50 text-orange-700 border-none font-medium px-3 py-1 text-[10px] rounded-full">
                        {member.gotra}
                      </Badge>
                      <Badge className="bg-[#10b981] text-white border-none font-bold px-3 py-1 text-[10px] rounded-full">
                        {member.matchPercentage}% Match
                      </Badge>
                      <Badge className={`border-none font-bold uppercase tracking-wider px-3 py-1 text-[9px] rounded-full ${
                        member.subscription_type === 'premium' ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {member.subscription_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-400 hover:text-rose-600">
                        <Heart className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-400 hover:text-rose-600">
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button className="bg-[#f97316] hover:bg-orange-600 text-white rounded-full px-6 h-10 shadow-md">
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
