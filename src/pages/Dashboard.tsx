import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Calendar, Users, Eye, Star,
  Video, Crown, UserPlus, Loader2, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { profile, user } = useAuth();
  interface MemberProfile {
    id: string;
    gender: string;
    height: number;
    gotra: string;
    subcaste: string;
    subscription_type: string;
  }

  const [stats, setStats] = useState({
    profileViews: 0,
    interestsSent: 0,
    messageCount: 0,
    vDatesCount: 0,
    matchesCount: 0
  });
  const [recentMembers, setRecentMembers] = useState<MemberProfile[]>([]);
  const [matches, setMatches] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const userGender = profile?.gender || 'male';
        const oppositeGender = userGender === 'male' ? 'female' : 'male';

        const mockRecentMembers = [
          {
            id: '1',
            gender: oppositeGender,
            height: 165,
            gotra: 'Bharadwaja',
            subcaste: 'Iyer',
            subscription_type: 'premium'
          },
          {
            id: '2',
            gender: oppositeGender,
            height: 175,
            gotra: 'Kashyapa',
            subcaste: 'Iyengar',
            subscription_type: 'free'
          },
          {
            id: '3',
            gender: oppositeGender,
            height: 160,
            gotra: 'Atri',
            subcaste: 'Deshastha',
            subscription_type: 'premium'
          },
          {
            id: '4',
            gender: oppositeGender,
            height: 180,
            gotra: 'Vasishtha',
            subcaste: 'Kanyakubja',
            subscription_type: 'free'
          }
        ];

        const mockMatches = [
          {
            id: '5',
            gender: oppositeGender,
            height: 162,
            gotra: 'Gautama',
            subcaste: 'Madhwa',
            subscription_type: 'premium'
          },
          {
            id: '6',
            gender: oppositeGender,
            height: 178,
            gotra: 'Jamadagni',
            subcaste: 'Smartha',
            subscription_type: 'premium'
          },
          {
            id: '7',
            gender: oppositeGender,
            height: 158,
            gotra: 'Vishwamitra',
            subcaste: 'Kokanastha',
            subscription_type: 'free'
          },
          {
            id: '8',
            gender: oppositeGender,
            height: 172,
            gotra: 'Angirasa',
            subcaste: 'Gaur',
            subscription_type: 'premium'
          }
        ];

        setStats({
          profileViews: Math.floor(Math.random() * 500) + 100,
          interestsSent: Math.floor(Math.random() * 20) + 5,
          messageCount: Math.floor(Math.random() * 15) + 2,
          vDatesCount: Math.floor(Math.random() * 5) + 1,
          matchesCount: mockMatches.length
        });

        setRecentMembers(mockRecentMembers);
        setMatches(mockMatches);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const statsDisplay = [
    { title: 'Profile Views', value: stats.profileViews.toString(), icon: Eye, gradient: 'from-rose-400 via-rose-500 to-pink-600' },
    { title: 'Interests Sent', value: stats.interestsSent.toString(), icon: Heart, gradient: 'from-orange-400 via-red-500 to-rose-600' },
    { title: 'Messages', value: stats.messageCount.toString(), icon: MessageCircle, gradient: 'from-amber-400 via-orange-500 to-red-500' },
    { title: 'V-Dates', value: stats.vDatesCount.toString(), icon: Video, gradient: 'from-red-400 via-orange-500 to-amber-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <span className="text-lg text-gray-700 font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50/40 via-white to-orange-50/40">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-orange-600 text-white rounded-3xl p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -ml-48 -mb-48"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                  <h1 className="text-4xl font-serif font-bold">
                    Welcome, {profile?.first_name || profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
                  </h1>
                </div>
                <p className="text-rose-100 text-lg">Your perfect match is waiting for you</p>
              </div>
              <Badge className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 font-semibold shadow-lg border-2 border-white/40 hover:bg-white/30 transition-all">
                <Crown className="h-5 w-5 mr-2 text-yellow-300" />
                {profile?.subscription_type === 'premium' ? 'Premium Member' : 'Free Member'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <Card key={index} className="group relative overflow-hidden border-2 border-transparent hover:border-red-200 hover:shadow-2xl transition-all duration-500 bg-white">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                    <p className={`text-4xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <Card className="border-2 border-emerald-100 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>
            <CardHeader className="bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50/30">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-emerald-700 text-xl">
                  <div className="h-4 w-4 bg-emerald-500 rounded-full mr-3 animate-pulse shadow-lg shadow-emerald-300"></div>
                  Online Now
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-800 font-semibold px-4 py-1.5 shadow-sm">
                  {Math.floor(Math.random() * 50) + 20} Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {Array.from({ length: 6 }, (_, index) => {
                  const gender = Math.random() > 0.5 ? 'male' : 'female';
                  const profileId = `online-${index + 1}`;
                  return (
                    <Link 
                      key={index} 
                      to={`/profile/${profileId}`}
                      className="text-center group cursor-pointer"
                    >
                      <div className="relative inline-block transition-all group-hover:scale-110 duration-300">
                        <Avatar className="h-20 w-20 border-4 border-emerald-400 group-hover:border-emerald-600 transition-all shadow-lg group-hover:shadow-2xl">
                          <AvatarImage 
                            src={`https://randomuser.me/api/portraits/${gender}/${Math.floor(Math.random() * 50) + 1}.jpg`}
                            alt={`Online user ${index + 1}`}
                          />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">{gender === 'male' ? 'M' : 'F'}</AvatarFallback>
                        </Avatar>
                        <div 
                          className="absolute h-4 w-4 bg-emerald-500 border-4 border-white rounded-full animate-pulse shadow-lg"
                          style={{
                            top: '75%',
                            right: '8%',
                            transform: 'translate(50%, -50%)'
                          }}
                        ></div>
                      </div>
                      <p className="text-sm font-semibold mt-3 group-hover:text-emerald-600 transition-colors">{gender === 'male' ? 'Male' : 'Female'}</p>
                      <p className="text-xs text-gray-500">{Math.floor(Math.random() * 10) + 20} yrs</p>
                    </Link>
                  );
                })}
              </div>
              <div className="text-center mt-8">
                <Link to="/online-profiles">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all px-8 py-3 rounded-full font-semibold border-0 outline-none ring-0 focus:ring-0 focus:outline-none">
                    View All Online Profiles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-2 border-red-100 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-rose-500 to-pink-600"></div>
            <CardHeader className="bg-gradient-to-br from-red-50 via-rose-50/50 to-orange-50/30 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-red-700 text-xl font-bold">
                  <UserPlus className="h-6 w-6 mr-3 text-red-600" />
                  New Members
                </CardTitle>
                <Link to="/new-members">
                  <Button className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col">
                {recentMembers.map((member, index) => (
                  <div key={member.id}>
                    <div className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-300 group border-2 border-transparent hover:border-red-100">
                      <Link to={`/profile/${member.id}`}>
                        <Avatar className="h-16 w-16 border-3 border-red-200 group-hover:border-red-400 transition-all shadow-md group-hover:shadow-xl group-hover:scale-110 duration-300">
                          <AvatarImage 
                            src={`https://randomuser.me/api/portraits/${member.gender === 'male' ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`} 
                            alt={`Profile ${member.id}`} 
                          />
                          <AvatarFallback className="bg-red-100 text-red-700 font-bold">{member.gender === 'male' ? 'M' : 'F'}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1">
                        <Link to={`/profile/${member.id}`}>
                          <h4 className="font-bold text-lg hover:text-red-600 transition-colors">
                            {member.gender === 'male' ? 'Male' : 'Female'} Profile
                          </h4>
                        </Link>
                        <p className="text-sm text-gray-600 font-medium">
                          {member.height}cm • {member.subcaste}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="secondary" className="text-xs font-semibold bg-red-100 text-red-700">
                            {member.gotra} Gotra
                          </Badge>
                          <Badge className={member.subscription_type === 'premium' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-gray-100 text-gray-700'} variant={member.subscription_type === 'premium' ? 'default' : 'outline'}>
                            {member.subscription_type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            const heart = e.currentTarget.querySelector('svg');
                            if (heart) {
                              heart.classList.toggle('fill-[#FF4500]');
                            }
                            console.log('Added to favorites:', member.id);
                          }}
                          className="p-2 rounded-full hover:bg-red-50 text-[#FF4500] hover:text-[#FF6B32] focus:outline-none transition-all hover:scale-110 duration-200"
                          title="Add to favorites"
                        >
                          <Heart className="h-6 w-6 transition-all" />
                        </button>
                        <Link 
                          to={`/messages?partner=${member.id}`}
                          className="p-2 rounded-full hover:bg-orange-50 text-[#FF4500] hover:text-[#FF6B32] focus:outline-none transition-all hover:scale-110 duration-200"
                          title="Send message"
                        >
                          <MessageCircle className="h-6 w-6" />
                        </Link>
                      </div>
                    </div>
                    {index < recentMembers.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-red-200 to-transparent my-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-100 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
            <CardHeader className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-red-50/30 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-amber-700 text-xl font-bold">
                  <Star className="h-6 w-6 mr-3 text-amber-600 fill-amber-400" />
                  Recommended Matches
                </CardTitle>
                <Link to="/matches">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col">
                {matches.map((match, index) => (
                  <div key={match.id}>
                    <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 group border-2 border-transparent hover:border-amber-100">
                      <Link to={`/profile/${match.id}`}>
                        <Avatar className="h-16 w-16 border-3 border-amber-200 group-hover:border-amber-400 transition-all shadow-md group-hover:shadow-xl group-hover:scale-110 duration-300">
                          <AvatarImage 
                            src={`https://randomuser.me/api/portraits/${match.gender === 'male' ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`} 
                            alt={`Match ${match.id}`} 
                          />
                          <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">{match.gender === 'male' ? 'M' : 'F'}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link to={`/profile/${match.id}`}>
                              <h4 className="font-bold text-lg hover:text-amber-600 transition-colors">
                                {match.gender === 'male' ? 'Male' : 'Female'} Match
                              </h4>
                            </Link>
                            <p className="text-sm text-gray-600 font-medium">{match.height}cm • {match.subcaste}</p>
                            <div className="flex items-center mt-1 space-x-2">
                              <span className="text-sm text-amber-700 font-medium">{match.gotra} Gotra</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-green-600 font-bold">{Math.floor(Math.random() * 20) + 80}% Match</span>
                            </div>
                          </div>
                          <Link to={`/profile/${match.id}`}>
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                              Connect
                            </Button>
                          </Link>
                        </div>
                        <div className="flex items-center justify-end mt-2 space-x-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              const heart = e.currentTarget.querySelector('svg');
                              if (heart) {
                                heart.classList.toggle('fill-[#FF4500]');
                              }
                              console.log('Added to favorites:', match.id);
                            }}
                            className="p-2 rounded-full hover:bg-red-50 text-[#FF4500] hover:text-[#FF6B32] focus:outline-none transition-all hover:scale-110 duration-200"
                            title="Add to favorites"
                          >
                            <Heart className="h-5 w-5 transition-all" />
                          </button>
                          <Link 
                            to={`/messages?partner=${match.id}`}
                            className="p-2 rounded-full hover:bg-orange-50 text-[#FF4500] hover:text-[#FF6B32] focus:outline-none transition-all hover:scale-110 duration-200"
                            title="Send message"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </Link>
                          </div>
                        </div>
                      </div>
                      {index < matches.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent my-2" />
                    )}
                  </div>
                ))}
                {matches.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No matches found yet. Complete your profile to get better matches!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/search">
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-red-200 bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-red-600 transition-colors">Search Profiles</h3>
                <p className="text-gray-600 text-sm font-medium">Find your perfect match</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/v-dates">
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-amber-200 bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-amber-600 transition-colors">Video Dates</h3>
                <p className="text-gray-600 text-sm font-medium">Meet virtually first</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/events">
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-orange-200 bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-amber-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="bg-gradient-to-br from-red-600 via-orange-500 to-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-orange-600 transition-colors">Events</h3>
                <p className="text-gray-600 text-sm font-medium">Community gatherings</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;