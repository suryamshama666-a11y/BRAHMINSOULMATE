import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Users, Video, Loader2, Crown, Sparkles, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProfileCard from '@/components/ProfileCard';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    profileViews: 0,
    interestsSent: 0,
    messageCount: 0,
    vDatesCount: 0,
  });
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);
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
          .limit(3);

        // Fetch potential matches
        const { data: matchesData } = await supabase
          .from('profiles')
          .select('*')
          .eq('gender', oppositeGender)
          .limit(3);

        // Fetch activity stats from user_activity table
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
        
        // Transform profiles for ProfileCard
        const transformProfile = (p: any) => ({
          id: p.id,
          name: p.first_name + (p.last_name ? ` ${p.last_name}` : ''),
          age: p.age || 25,
          gender: p.gender,
          height: p.height || 165,
          location: `${p.city || 'Mumbai'}, ${p.state || 'Maharashtra'}`,
          education: p.education || 'Graduate',
          profession: p.occupation || 'Professional',
          caste: p.subcaste || 'Brahmin',
          gotra: p.gotra,
          avatarUrl: p.profile_picture_url,
          subscription_type: p.subscription_type || 'free',
          lastSeen: 'Active now'
        });

        setOnlineMembers(onlineData?.map(transformProfile) || []);
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
        {/* Welcome Section - EXACTLY AS PER BACKUP */}
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

        {/* Stats Grid - AS PER BACKUP BUT WITH DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Profile Views', value: stats.profileViews, icon: Heart, color: 'bg-red-500' },
            { label: 'Messages', value: stats.messageCount, icon: MessageCircle, color: 'bg-amber-500' },
            { label: 'Matches', value: stats.interestsSent, icon: Users, color: 'bg-red-500' },
            { label: 'V-Dates', value: stats.vDatesCount, icon: Video, color: 'bg-amber-500' },
          ].map((stat, i) => (
            <Card key={i} className="border-2 border-red-100/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-red-600">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} shadow-lg shadow-red-500/20`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommended for You Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-500" />
              Recommended for You
            </h2>
            <Link to="/matches" className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center group">
              VIEW ALL
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedMatches.length > 0 ? (
              recommendedMatches.map((match) => (
                <ProfileCard 
                  key={match.id} 
                  profile={match} 
                  variant="match" 
                />
              ))
            ) : (
              <p className="text-gray-500 italic col-span-full">Finding compatible matches for you...</p>
            )}
          </div>
        </section>

        {/* Online Members Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              <h2 className="text-2xl font-serif font-bold text-gray-800">Online Members</h2>
            </div>
            <Link to="/online-profiles" className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center group">
              VIEW ALL
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onlineMembers.length > 0 ? (
              onlineMembers.map((member) => (
                <ProfileCard 
                  key={member.id} 
                  profile={member} 
                  variant="online" 
                />
              ))
            ) : (
              <p className="text-gray-500 italic col-span-full">No members online right now.</p>
            )}
          </div>
        </section>

        {/* Quick Actions - AS PER BACKUP (GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/search">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50 bg-white">
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
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-amber-100/50 bg-white">
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
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50 bg-white">
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

        {/* Premium Membership Card - AS PER BACKUP STYLING */}
        <Card className="border-0 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl shadow-xl p-8 relative overflow-hidden group mb-12">
          <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-yellow-400 p-4 rounded-2xl shadow-lg">
                <Crown className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-2xl mb-2">Premium Membership</h3>
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
