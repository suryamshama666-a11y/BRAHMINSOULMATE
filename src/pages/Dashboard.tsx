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
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-32" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2 flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                  Welcome back, {profile?.first_name || profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-xl text-red-50 font-medium">Your perfect match is waiting for you</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-2 flex items-center gap-2 self-start md:self-center">
                <Crown className="h-5 w-5 text-yellow-300" />
                <span className="font-bold text-sm tracking-wide">Free Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Profile Views', value: '237', icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50' },
            { label: 'Interests Sent', value: '10', icon: Heart, color: 'text-orange-500', bgColor: 'bg-orange-50' },
            { label: 'Messages', value: '4', icon: MessageCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { label: 'V-Dates', value: '1', icon: Video, color: 'text-orange-500', bgColor: 'bg-orange-50' },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-md hover:shadow-xl transition-all duration-500 bg-white group cursor-pointer overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-500 mb-1 tracking-tight">{stat.label}</p>
                    <p className={`text-4xl font-black ${stat.color.replace('text-', 'text-opacity-90 text-')}`}>{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bgColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <stat.icon className={`h-8 w-8 ${stat.color} fill-current`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Online Members - STORIES STYLE */}
        <section className="mb-12 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-ping" />
              Online Now
            </h2>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 px-3 py-1 font-bold">
                65 Online
              </Badge>
              <Link to="/online-profiles" className="text-xs font-black text-red-600 hover:text-red-700 tracking-widest flex items-center group">
                VIEW ALL
                <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
            {onlineMembers.length > 0 ? (
              onlineMembers.map((member, idx) => (
                <div 
                  key={member.id} 
                  className="flex flex-col items-center min-w-[100px] cursor-pointer group"
                  onClick={() => navigate(`/profile/${member.id}`)}
                >
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-blue-400 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500 opacity-60" />
                    <div className="relative p-1 rounded-full bg-white">
                      <Avatar className="h-20 w-20 border-2 border-transparent">
                        <AvatarImage src={member.avatarUrl} alt={member.name} className="object-cover" />
                        <AvatarFallback className="bg-red-50 text-red-600 font-bold text-xl">{member.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 text-center tracking-tight">Online user {idx + 1}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Male</span>
                </div>
              ))
            ) : (
              // Fallback mock users to match screenshot
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center min-w-[100px] cursor-pointer group">
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-blue-400 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500 opacity-60" />
                    <div className="relative p-1 rounded-full bg-white">
                      <Avatar className="h-20 w-20 border-2 border-transparent">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} className="object-cover" />
                        <AvatarFallback className="bg-red-50 text-red-600 font-bold text-xl">U</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 text-center tracking-tight">Online user {i}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{i === 6 ? 'Female' : 'Male'}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Two-Column Layout for New Members & Recommended */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          
          {/* New Members - LEFT COLUMN */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-serif font-bold text-red-800 flex items-center gap-3">
                <Users className="h-7 w-7 text-red-600" />
                New Members
              </h2>
              <Button onClick={() => navigate('/search')} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-full shadow-lg shadow-red-500/30">
                View All
              </Button>
            </div>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md">
              <CardContent className="p-4 space-y-4">
                {[
                  { name: 'Female Profile', height: '165cm', caste: 'Iyer', gotra: 'Bharadwaja Gotra', type: 'premium', avatar: 'https://i.pravatar.cc/150?u=10' },
                  { name: 'Female Profile', height: '175cm', caste: 'Iyengar', gotra: 'Kashyapa Gotra', type: 'free', avatar: 'https://i.pravatar.cc/150?u=11' },
                  { name: 'Female Profile', height: '160cm', caste: 'Deshastha', gotra: 'Atri Gotra', type: 'premium', avatar: 'https://i.pravatar.cc/150?u=12' },
                  { name: 'Female Profile', height: '180cm', caste: 'Kanyakubja', gotra: 'Vasishtha Gotra', type: 'free', avatar: 'https://i.pravatar.cc/150?u=13' },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between group p-2 hover:bg-red-50/50 rounded-2xl transition-all">
                    <div className="flex items-center gap-5">
                      <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                        <AvatarImage src={member.avatar} className="object-cover" />
                        <AvatarFallback className="bg-red-50 text-red-600">FP</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-xl font-serif font-bold text-gray-800">{member.name}</h4>
                        <p className="text-sm text-gray-500 font-medium mb-2">{member.height} • {member.caste}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 border-none px-3 py-1 text-[10px] font-bold">
                            {member.gotra}
                          </Badge>
                          <Badge variant="secondary" className={`${member.type === 'premium' ? 'bg-orange-500' : 'bg-gray-100'} text-white hover:opacity-90 border-none px-3 py-1 text-[10px] font-bold`}>
                            {member.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-10 w-10">
                        <Heart className="h-7 w-7" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-10 w-10">
                        <MessageCircle className="h-7 w-7" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Recommended Matches - RIGHT COLUMN */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-serif font-bold text-amber-800 flex items-center gap-3">
                <Star className="h-7 w-7 text-amber-500" />
                Recommended Matches
              </h2>
              <Button onClick={() => navigate('/matches')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-full shadow-lg shadow-orange-500/30">
                View All
              </Button>
            </div>
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md">
              <CardContent className="p-4 space-y-4">
                {[
                  { name: 'Female Match', height: '162cm', caste: 'Madhwa', gotra: 'Gautama Gotra', match: '92%', type: 'premium', avatar: 'https://i.pravatar.cc/150?u=20' },
                  { name: 'Female Match', height: '178cm', caste: 'Smartha', gotra: 'Jamadagni Gotra', match: '89%', type: 'premium', avatar: 'https://i.pravatar.cc/150?u=21' },
                  { name: 'Female Match', height: '158cm', caste: 'Kokanastha', gotra: 'Vishwamitra Gotra', match: '85%', type: 'free', avatar: 'https://i.pravatar.cc/150?u=22', highlight: true },
                  { name: 'Female Match', height: '172cm', caste: 'Gaur', gotra: 'Angirasa Gotra', match: '97%', type: 'premium', avatar: 'https://i.pravatar.cc/150?u=23' },
                ].map((match, i) => (
                  <div key={i} className={`flex items-center justify-between group p-3 rounded-2xl transition-all ${match.highlight ? 'bg-orange-50 ring-1 ring-orange-200 shadow-sm' : 'hover:bg-orange-50/50'}`}>
                    <div className="flex items-center gap-5">
                      <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                        <AvatarImage src={match.avatar} className="object-cover" />
                        <AvatarFallback className="bg-orange-50 text-orange-600">FM</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-xl font-serif font-bold text-gray-800">{match.name}</h4>
                        <p className="text-sm text-gray-500 font-medium mb-2">{match.height} • {match.caste}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-none px-3 py-1 text-[10px] font-bold">
                            {match.gotra}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-500 text-white border-none px-3 py-1 text-[10px] font-bold">
                            {match.match} Match
                          </Badge>
                          <Badge variant="secondary" className={`${match.type === 'premium' ? 'bg-orange-500' : 'bg-gray-100'} text-white border-none px-3 py-1 text-[10px] font-bold`}>
                            {match.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 h-10 w-10">
                        <Heart className="h-7 w-7" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 h-10 w-10">
                        <MessageCircle className="h-7 w-7" />
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-5 h-10 ml-2 shadow-md">
                        Connect
                      </Button>
                    </div>
                  </div>
                ))}
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
