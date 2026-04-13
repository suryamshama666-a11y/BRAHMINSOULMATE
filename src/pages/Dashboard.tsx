import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Users, Video, Crown, Sparkles, MapPin, Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton, StatsCardSkeleton, AvatarSkeleton } from '@/components/ui/skeleton';
import { getMockOnlineProfiles, getMockNewProfiles, getMockRecommendedProfiles } from '@/data/fixtures/mockProfiles';

// Type definitions
interface MemberProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  profession: string;
  avatarUrl: string;
  subscription_type: string;
  gotra: string;
  community: string;
  height: string;
  matchPercentage: number;
  lastSeen: string;
}

interface RawProfile {
  id: string;
  first_name?: string;
  age?: number;
  gender?: string;
  city?: string;
  state?: string;
  occupation?: string;
  profile_picture_url?: string;
  subscription_type?: string;
  gotra?: string;
  community?: string;
  height?: number | string;
}

interface DashboardStats {
  profileViews: number;
  interestsSent: number;
  messageCount: number;
  vDatesCount: number;
}

const Dashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    profileViews: 0,
    interestsSent: 0,
    messageCount: 0,
    vDatesCount: 0,
  });
  const [onlineMembers, setOnlineMembers] = useState<MemberProfile[]>([]);
  const [newMembers, setNewMembers] = useState<MemberProfile[]>([]);
  const [recommendedMatches, setRecommendedMatches] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedMembers, setLikedMembers] = useState<Set<string>>(new Set());
  const [interestSentMembers, setInterestSentMembers] = useState<Set<string>>(new Set());

  const handleLike = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const handleMessage = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/messages?chat=${memberId}`);
  };

  const handleConnect = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInterestSentMembers(prev => {
      const newSet = new Set(prev);
      newSet.add(memberId);
      return newSet;
    });
  };

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

        // Fetch real stats in parallel
        const [profileViewsRes, interestsRes, messagesRes, vdatesRes] = await Promise.all([
          supabase.from('profile_views').select('id', { count: 'exact', head: true }).eq('viewed_id', user.id),
          supabase.from('interests').select('id', { count: 'exact', head: true }).eq('sender_id', user.id),
          supabase.from('messages').select('id', { count: 'exact', head: true }).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
          supabase.from('vdates').select('id', { count: 'exact', head: true }).or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
        ]);

        setStats({
          profileViews: profileViewsRes.count ?? 0,
          interestsSent: interestsRes.count ?? 0,
          messageCount: messagesRes.count ?? 0,
          vDatesCount: vdatesRes.count ?? 0,
        });

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

          const transformProfile = (p: RawProfile): MemberProfile => {
            const formatHeight = (height: number | string | undefined): string => {
              if (!height) return "160 cm";
              if (typeof height === 'number') return `${height} cm`;
              if (!isNaN(Number(height))) return `${height} cm`;
              return height;
            };

            return {
              id: p.id,
              name: p.first_name || (oppositeGender === 'female' ? 'Female Profile' : 'Male Profile'),
              age: p.age || 25,
              gender: p.gender || oppositeGender,
              location: `${p.city || 'Mumbai'}, ${p.state || 'Maharashtra'}`,
              profession: p.occupation || 'Professional',
              avatarUrl: p.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
              subscription_type: p.subscription_type || 'free',
              gotra: p.gotra || 'Bharadwaja Gotra',
              community: p.community || 'Brahmin',
              height: formatHeight(p.height),
              matchPercentage: 85,
              lastSeen: 'Active now'
            };
          };
  
          // Use mock data as fallback if no real data from database
          const mockOnline = getMockOnlineProfiles(oppositeGender);
          const onlineProfilesToUse = onlineData && onlineData.length > 0 ? onlineData : mockOnline;
          setOnlineMembers(onlineProfilesToUse.map((p) => transformProfile(p as RawProfile)));
          
          const mockNew = getMockNewProfiles(oppositeGender);
          const newProfilesToUse = newData && newData.length > 0 ? newData : mockNew;
          setNewMembers(newProfilesToUse.map(p => transformProfile(p as RawProfile)));
          
          const mockRecommended = getMockRecommendedProfiles(oppositeGender);
          const recommendedProfilesToUse = matchesData && matchesData.length > 0 ? matchesData : mockRecommended;
          setRecommendedMatches(recommendedProfilesToUse.map(p => transformProfile(p as RawProfile)));

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
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          {/* Welcome Section Skeleton */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl p-8 animate-pulse">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>

          {/* Online Now Section Skeleton */}
          <section className="mb-12 bg-gray-50 p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
            <div className="flex justify-between">
              {[...Array(8)].map((_, i) => (
                <AvatarSkeleton key={i} />
              ))}
            </div>
          </section>

          {/* Two Column Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {[1, 2].map((section) => (
              <section key={section} className="bg-white rounded-[32px] border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-10 w-24 rounded-full" />
                </div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-20 w-20 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <Skeleton className="h-9 w-24 rounded-full" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <Footer />
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
                  Welcome, {profile?.first_name || 'User'}!
                </h1>
              </div>
              <p className="text-xl text-white/90">Your perfect match is waiting for you</p>
            </div>
            <div className="relative z-10 hidden md:block">
              <div className={`backdrop-blur-md rounded-full px-6 py-3 border flex items-center gap-2 ${
                profile?.subscription_type === 'premium'
                  ? 'bg-yellow-400/30 border-yellow-300/50'
                  : 'bg-white/20 border-white/30'
              }`}>
                <Crown className={`h-5 w-5 ${
                  profile?.subscription_type === 'premium'
                    ? 'text-yellow-300 fill-yellow-300'
                    : 'text-yellow-400 fill-yellow-400'
                }`} />
                <span className="font-bold uppercase tracking-wider text-sm">
                  {profile?.subscription_type === 'premium' 
                    ? 'Premium Member' 
                    : 'Free Member'}
                </span>
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
          <div className="flex justify-between">
            {onlineMembers.length > 0 ? (
              onlineMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => navigate(`/profile/${member.id}`)}
                >
                  <div className="relative mb-3">
                    <div className="p-1 rounded-full border-2 border-[#10b981] shadow-lg shadow-teal-100 transform group-hover:scale-110 transition-transform duration-300">
                      <img 
                        src={member.avatarUrl} 
                        alt={member.name} 
                        className="h-20 w-20 rounded-full object-cover border-2 border-white"
                      />
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
              <Link to="/new-members">
                <Button variant="destructive" className="rounded-full px-6 bg-[#f43f5e] hover:bg-rose-600 shadow-lg shadow-rose-100">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {newMembers.map((member) => (
                <div key={member.id} className="p-4 rounded-2xl hover:bg-rose-50/50 transition-all flex items-center gap-4 cursor-pointer group border border-transparent hover:border-rose-100/50">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 rounded-2xl border-2 border-rose-50 shadow-md">
                      <AvatarImage src={member.avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-rose-50 text-rose-600">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <Badge className={`mt-2 border-none font-bold uppercase tracking-wider px-3 py-1 text-[9px] rounded-full ${
                      member.subscription_type === 'premium' ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {member.subscription_type}
                    </Badge>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-xl font-serif font-bold text-gray-900 mb-0.5 group-hover:text-rose-600 transition-colors">{member.name}</h4>
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 font-medium">{member.age} yrs • {member.height}</p>
                      <p className="text-xs text-rose-500 font-semibold">{member.profession}</p>
                      <p className="text-xs text-orange-500 font-medium flex items-center gap-1"><MapPin className="h-3 w-3 text-orange-500" />{member.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-rose-50 text-rose-600 border-none font-medium px-3 py-1 text-[10px] rounded-full">
                        {member.gotra}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 items-end self-start">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`rounded-full flex items-center gap-1 ${likedMembers.has(member.id) ? 'text-red-600 bg-red-50' : 'text-rose-400 hover:text-rose-600 hover:bg-rose-100'}`}
                        onClick={(e) => handleLike(member.id, e)}
                      >
                        <Heart className={`h-5 w-5 ${likedMembers.has(member.id) ? 'fill-red-600' : ''}`} />
                        <span className="text-xs">{likedMembers.has(member.id) ? 'Liked' : 'Like'}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-100 flex items-center gap-1"
                        onClick={(e) => handleMessage(member.id, e)}
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-xs">Message</span>
                      </Button>
                    </div>
                    <Button 
                      className={`rounded-full px-6 h-9 shadow-md mt-4 ${
                        interestSentMembers.has(member.id) 
                          ? 'bg-green-500 hover:bg-green-600 text-white cursor-default' 
                          : 'bg-[#f43f5e] hover:bg-rose-600 text-white'
                      }`}
                      onClick={(e) => !interestSentMembers.has(member.id) && handleConnect(member.id, e)}
                    >
                      {interestSentMembers.has(member.id) ? 'Interest Sent' : 'Connect'}
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
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 rounded-2xl border-2 border-orange-50 shadow-md">
                      <AvatarImage src={member.avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-orange-50 text-orange-600">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <Badge className={`mt-2 border-none font-bold uppercase tracking-wider px-3 py-1 text-[9px] rounded-full ${
                      member.subscription_type === 'premium' ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {member.subscription_type}
                    </Badge>
                  </div>
                    <div className="flex-grow">
                      <h4 className="text-xl font-serif font-bold text-gray-900 mb-0.5 group-hover:text-orange-600 transition-colors">{member.name}</h4>
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 font-medium">{member.age} yrs • {member.height}</p>
                            <p className="text-xs text-orange-600 font-semibold">{member.profession}</p>
                            <p className="text-xs text-orange-500 font-medium flex items-center gap-1"><MapPin className="h-3 w-3 text-orange-500" />{member.location}</p>
                          </div>
                      <div className="flex gap-2 items-center flex-wrap">
                      <Badge className="bg-orange-50 text-orange-700 border-none font-medium px-3 py-1 text-[10px] rounded-full">
                        {member.gotra}
                      </Badge>
                      <Badge className="bg-[#10b981] text-white border-none font-bold px-3 py-1 text-[10px] rounded-full">
                        {member.matchPercentage}% Match
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 items-end self-start">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`rounded-full flex items-center gap-1 ${likedMembers.has(member.id) ? 'text-red-600 bg-red-50' : 'text-rose-400 hover:text-rose-600 hover:bg-rose-100'}`}
                        onClick={(e) => handleLike(member.id, e)}
                      >
                        <Heart className={`h-5 w-5 ${likedMembers.has(member.id) ? 'fill-red-600' : ''}`} />
                        <span className="text-xs">{likedMembers.has(member.id) ? 'Liked' : 'Like'}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-100 flex items-center gap-1"
                        onClick={(e) => handleMessage(member.id, e)}
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-xs">Message</span>
                      </Button>
                    </div>
                    <Button 
                      className={`rounded-full px-6 h-9 shadow-md mt-4 ${
                        interestSentMembers.has(member.id) 
                          ? 'bg-green-500 hover:bg-green-600 text-white cursor-default' 
                          : 'bg-[#f97316] hover:bg-orange-600 text-white'
                      }`}
                      onClick={(e) => !interestSentMembers.has(member.id) && handleConnect(member.id, e)}
                    >
                      {interestSentMembers.has(member.id) ? 'Interest Sent' : 'Connect'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link to="/search">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50 bg-white/90 rounded-2xl">
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
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-amber-100/50 bg-white/90 rounded-2xl">
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
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50 bg-white/90 rounded-2xl">
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

        {/* Premium Membership - Only show for free members */}
        {profile?.subscription_type !== 'premium' && (
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
              <Link to="/plans">
                <Button className="bg-white text-red-600 hover:bg-red-50 font-bold px-8 h-12 rounded-xl shadow-lg transition-transform hover:scale-105">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
