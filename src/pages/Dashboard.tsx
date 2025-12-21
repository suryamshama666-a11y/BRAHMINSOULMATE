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

        // Mock online profiles data
        const mockOnlineProfiles = oppositeGender === 'female' ? [
          { id: 'online1', first_name: 'Priya', age: 26, gender: 'female', city: 'Mumbai', state: 'Maharashtra', occupation: 'Software Engineer', profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', subscription_type: 'premium', gotra: 'Kashyap Gotra' },
          { id: 'online2', first_name: 'Anjali', age: 24, gender: 'female', city: 'Bangalore', state: 'Karnataka', occupation: 'Doctor', profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', subscription_type: 'free', gotra: 'Bharadwaja Gotra' },
          { id: 'online3', first_name: 'Kavya', age: 27, gender: 'female', city: 'Chennai', state: 'Tamil Nadu', occupation: 'Teacher', profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', subscription_type: 'premium', gotra: 'Vasishtha Gotra' },
          { id: 'online4', first_name: 'Meera', age: 25, gender: 'female', city: 'Pune', state: 'Maharashtra', occupation: 'CA', profile_picture_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', subscription_type: 'free', gotra: 'Atri Gotra' },
          { id: 'online5', first_name: 'Divya', age: 28, gender: 'female', city: 'Hyderabad', state: 'Telangana', occupation: 'Architect', profile_picture_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', subscription_type: 'premium', gotra: 'Gautam Gotra' },
          { id: 'online6', first_name: 'Sneha', age: 23, gender: 'female', city: 'Delhi', state: 'Delhi', occupation: 'Designer', profile_picture_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150', subscription_type: 'free', gotra: 'Jamadagni Gotra' },
        ] : [
          { id: 'online1', first_name: 'Rahul', age: 28, gender: 'male', city: 'Mumbai', state: 'Maharashtra', occupation: 'Software Engineer', profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', subscription_type: 'premium', gotra: 'Kashyap Gotra' },
          { id: 'online2', first_name: 'Aditya', age: 30, gender: 'male', city: 'Bangalore', state: 'Karnataka', occupation: 'Doctor', profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', subscription_type: 'free', gotra: 'Bharadwaja Gotra' },
          { id: 'online3', first_name: 'Vikram', age: 27, gender: 'male', city: 'Chennai', state: 'Tamil Nadu', occupation: 'Lawyer', profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', subscription_type: 'premium', gotra: 'Vasishtha Gotra' },
          { id: 'online4', first_name: 'Arjun', age: 29, gender: 'male', city: 'Pune', state: 'Maharashtra', occupation: 'CA', profile_picture_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', subscription_type: 'free', gotra: 'Atri Gotra' },
          { id: 'online5', first_name: 'Karthik', age: 26, gender: 'male', city: 'Hyderabad', state: 'Telangana', occupation: 'Architect', profile_picture_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', subscription_type: 'premium', gotra: 'Gautam Gotra' },
          { id: 'online6', first_name: 'Sanjay', age: 31, gender: 'male', city: 'Delhi', state: 'Delhi', occupation: 'Business', profile_picture_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150', subscription_type: 'free', gotra: 'Jamadagni Gotra' },
        ];

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
  
          // Use mock data if no online members from database
          const onlineProfilesToUse = onlineData && onlineData.length > 0 ? onlineData : mockOnlineProfiles;
          setOnlineMembers(onlineProfilesToUse.map((p, i) => ({ ...transformProfile(p, 'online') })));
          
          // Use mock data if no new members from database
          const mockNewMembers = oppositeGender === 'female' ? [
            { id: 'new1', first_name: 'Lakshmi', age: 25, gender: 'female', city: 'Coimbatore', state: 'Tamil Nadu', occupation: 'Engineer', profile_picture_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150', subscription_type: 'premium', gotra: 'Kashyap Gotra', height: 162 },
            { id: 'new2', first_name: 'Radha', age: 24, gender: 'female', city: 'Mysore', state: 'Karnataka', occupation: 'Pharmacist', profile_picture_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', subscription_type: 'free', gotra: 'Bharadwaja Gotra', height: 158 },
            { id: 'new3', first_name: 'Geetha', age: 26, gender: 'female', city: 'Kochi', state: 'Kerala', occupation: 'Banker', profile_picture_url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150', subscription_type: 'premium', gotra: 'Vasishtha Gotra', height: 160 },
            { id: 'new4', first_name: 'Sita', age: 27, gender: 'female', city: 'Jaipur', state: 'Rajasthan', occupation: 'Professor', profile_picture_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150', subscription_type: 'free', gotra: 'Atri Gotra', height: 165 },
          ] : [
            { id: 'new1', first_name: 'Suresh', age: 29, gender: 'male', city: 'Coimbatore', state: 'Tamil Nadu', occupation: 'Engineer', profile_picture_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', subscription_type: 'premium', gotra: 'Kashyap Gotra', height: 175 },
            { id: 'new2', first_name: 'Ganesh', age: 28, gender: 'male', city: 'Mysore', state: 'Karnataka', occupation: 'Pharmacist', profile_picture_url: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150', subscription_type: 'free', gotra: 'Bharadwaja Gotra', height: 172 },
            { id: 'new3', first_name: 'Mohan', age: 30, gender: 'male', city: 'Kochi', state: 'Kerala', occupation: 'Banker', profile_picture_url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150', subscription_type: 'premium', gotra: 'Vasishtha Gotra', height: 178 },
            { id: 'new4', first_name: 'Krishna', age: 27, gender: 'male', city: 'Jaipur', state: 'Rajasthan', occupation: 'Professor', profile_picture_url: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150', subscription_type: 'free', gotra: 'Atri Gotra', height: 170 },
          ];
          const newProfilesToUse = newData && newData.length > 0 ? newData : mockNewMembers;
          setNewMembers(newProfilesToUse.map(p => transformProfile(p, 'new')));
          
          // Use mock data if no recommended matches from database
          const mockRecommendedMatches = oppositeGender === 'female' ? [
            { id: 'rec1', first_name: 'Ananya', age: 25, gender: 'female', city: 'Ahmedabad', state: 'Gujarat', occupation: 'Data Scientist', profile_picture_url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150', subscription_type: 'premium', gotra: 'Gautam Gotra', height: 163 },
            { id: 'rec2', first_name: 'Pooja', age: 26, gender: 'female', city: 'Lucknow', state: 'Uttar Pradesh', occupation: 'Marketing Manager', profile_picture_url: 'https://images.unsplash.com/photo-1464863979621-258859e62245?w=150', subscription_type: 'free', gotra: 'Jamadagni Gotra', height: 157 },
            { id: 'rec3', first_name: 'Nisha', age: 24, gender: 'female', city: 'Indore', state: 'Madhya Pradesh', occupation: 'HR Manager', profile_picture_url: 'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=150', subscription_type: 'premium', gotra: 'Vishwamitra Gotra', height: 161 },
            { id: 'rec4', first_name: 'Swati', age: 27, gender: 'female', city: 'Nagpur', state: 'Maharashtra', occupation: 'Consultant', profile_picture_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150', subscription_type: 'free', gotra: 'Agastya Gotra', height: 159 },
          ] : [
            { id: 'rec1', first_name: 'Ravi', age: 29, gender: 'male', city: 'Ahmedabad', state: 'Gujarat', occupation: 'Data Scientist', profile_picture_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', subscription_type: 'premium', gotra: 'Gautam Gotra', height: 176 },
            { id: 'rec2', first_name: 'Amit', age: 30, gender: 'male', city: 'Lucknow', state: 'Uttar Pradesh', occupation: 'Marketing Manager', profile_picture_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150', subscription_type: 'free', gotra: 'Jamadagni Gotra', height: 174 },
            { id: 'rec3', first_name: 'Deepak', age: 28, gender: 'male', city: 'Indore', state: 'Madhya Pradesh', occupation: 'HR Manager', profile_picture_url: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=150', subscription_type: 'premium', gotra: 'Vishwamitra Gotra', height: 177 },
            { id: 'rec4', first_name: 'Nikhil', age: 31, gender: 'male', city: 'Nagpur', state: 'Maharashtra', occupation: 'Consultant', profile_picture_url: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=150', subscription_type: 'free', gotra: 'Agastya Gotra', height: 173 },
          ];
          const recommendedProfilesToUse = matchesData && matchesData.length > 0 ? matchesData : mockRecommendedMatches;
          setRecommendedMatches(recommendedProfilesToUse.map(p => transformProfile(p, 'recommended')));

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
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
