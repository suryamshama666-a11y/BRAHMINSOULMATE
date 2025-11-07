import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Calendar, Users, Eye, Star,
  Video, Crown, UserPlus, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    profileViews: 0,
    interestsSent: 0,
    messageCount: 0,
    vDatesCount: 0,
    matchesCount: 0
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data for recent members
        const mockRecentMembers = [
          {
            id: '1',
            gender: 'female',
            height: 165,
            religion: 'Hindu',
            caste: 'Brahmin',
            subscription_type: 'premium'
          },
          {
            id: '2',
            gender: 'male',
            height: 175,
            religion: 'Hindu',
            caste: 'Brahmin',
            subscription_type: 'free'
          },
          {
            id: '3',
            gender: 'female',
            height: 160,
            religion: 'Hindu',
            caste: 'Brahmin',
            subscription_type: 'premium'
          },
          {
            id: '4',
            gender: 'male',
            height: 180,
            religion: 'Hindu',
            caste: 'Brahmin',
            subscription_type: 'free'
          }
        ];

        // Mock data for matches
        const mockMatches = [
          {
            id: '5',
            gender: 'female',
            height: 162,
            caste: 'Brahmin',
            subscription_type: 'premium'
          },
          {
            id: '6',
            gender: 'male',
            height: 178,
            caste: 'Brahmin',
            subscription_type: 'premium'
          },
          {
            id: '7',
            gender: 'female',
            height: 158,
            caste: 'Brahmin',
            subscription_type: 'free'
          }
        ];

        // Mock stats
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
    { title: 'Profile Views', value: stats.profileViews.toString(), icon: Eye, color: 'from-red-400 to-red-600' },
    { title: 'Interests Sent', value: stats.interestsSent.toString(), icon: Heart, color: 'from-amber-400 to-amber-600' },
    { title: 'Messages', value: stats.messageCount.toString(), icon: MessageCircle, color: 'from-red-500 to-amber-500' },
    { title: 'V-Dates', value: stats.vDatesCount.toString(), icon: Video, color: 'from-amber-500 to-red-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="text-lg text-gray-700">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50/30 via-white to-amber-50/40">
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2">
                  Welcome back, {profile?.name || user?.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-red-100">Find your perfect match today</p>
              </div>
              <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold shadow-lg border-2 border-white">
                <Crown className="h-4 w-4 mr-1 text-amber-500" />
                {profile?.subscription_type === 'premium' ? 'Premium Member' : 'Free Member'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <Card key={index} className="overflow-hidden border-2 border-red-100/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Online Profiles Section */}
        <div className="mb-8">
          <Card className="border-2 border-green-100/50">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-green-700">
                  <div className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Online Now
                </CardTitle>
                <Badge className="bg-green-100 text-green-800">
                  {Math.floor(Math.random() * 50) + 20} Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }, (_, index) => {
                  const gender = Math.random() > 0.5 ? 'male' : 'female';
                  return (
                    <div key={index} className="text-center">
                      <div className="relative inline-block">
                        <Avatar className="h-16 w-16 border-2 border-green-500">
                          <AvatarImage 
                            src={`https://randomuser.me/api/portraits/${gender}/${Math.floor(Math.random() * 50) + 1}.jpg`}
                            alt={`Online user ${index + 1}`}
                          />
                          <AvatarFallback>{gender === 'male' ? 'M' : 'F'}</AvatarFallback>
                        </Avatar>
                        <div 
                          className="absolute h-3 w-3 bg-green-500 border-2 border-white rounded-full"
                          style={{
                            top: '75%',
                            right: '8%',
                            transform: 'translate(50%, -50%)'
                          }}
                        ></div>
                      </div>
                      <p className="text-sm font-medium mt-2">{gender === 'male' ? 'Male' : 'Female'}</p>
                      <p className="text-xs text-gray-500">{Math.floor(Math.random() * 10) + 20} yrs</p>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-4">
                <Link to="/online-profiles">
                  <Button variant="outline" className="bg-white text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white">
                    View All Online Profiles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Members & Recommended Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Members Card */}
          <Card className="border-2 border-red-100/50">
            <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-red-700">
                  <UserPlus className="h-5 w-5 mr-2" />
                  New Members
                </CardTitle>
                <Link to="/new-members">
                  <Button variant="outline" className="bg-white text-[#DC2626] border-2 border-[#DC2626] hover:bg-[#DC2626] hover:text-white px-4 py-2 rounded-full font-semibold">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-red-50/50 transition-colors">
                    <Link to={`/profile/${member.id}`}>
                      <Avatar className="h-12 w-12 border-2 border-red-200">
                        <AvatarImage 
                          src={`https://randomuser.me/api/portraits/${member.gender === 'male' ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`} 
                          alt={`Profile ${member.id}`} 
                        />
                        <AvatarFallback>{member.gender === 'male' ? 'M' : 'F'}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <Link to={`/profile/${member.id}`}>
                        <h4 className="font-semibold hover:text-red-600">
                          {member.gender === 'male' ? 'Male' : 'Female'} Profile
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-600">
                        {member.height}cm • {member.religion}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {member.caste}
                        </Badge>
                        <Badge variant={member.subscription_type === 'premium' ? 'default' : 'outline'} className="text-xs">
                          {member.subscription_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-[#FF4500] hover:text-[#FF6B32] focus:outline-none transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                      <button className="text-[#FF4500] hover:text-[#FF6B32] focus:outline-none transition-colors">
                        <MessageCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Matches */}
          <Card className="border-2 border-amber-100/50">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-red-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-amber-700">
                  <Star className="h-5 w-5 mr-2" />
                  Recommended Matches
                </CardTitle>
                <Link to="/matches">
                  <Button variant="outline" className="bg-white text-[#DC2626] border-2 border-[#DC2626] hover:bg-[#DC2626] hover:text-white px-4 py-2 rounded-full font-semibold">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {matches.map(match => (
                  <div key={match.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-amber-50/50 transition-colors">
                    <Link to={`/profile/${match.id}`}>
                      <Avatar className="h-12 w-12 border-2 border-amber-200">
                        <AvatarImage 
                          src={`https://randomuser.me/api/portraits/${match.gender === 'male' ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`} 
                          alt={`Match ${match.id}`} 
                        />
                        <AvatarFallback>{match.gender === 'male' ? 'M' : 'F'}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <Link to={`/profile/${match.id}`}>
                        <h4 className="font-semibold hover:text-amber-600">
                          {match.gender === 'male' ? 'Male' : 'Female'} Match
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-600">{match.height}cm • {match.caste}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(Math.random() * 20) + 80}% Match
                        </Badge>
                        <Badge variant={match.subscription_type === 'premium' ? 'default' : 'outline'} className="text-xs">
                          {match.subscription_type}
                        </Badge>
                      </div>
                    </div>
                    <Link to={`/profile/${match.id}`}>
                      <Button variant="default" size="sm" className="rounded-full">
                        Connect
                      </Button>
                    </Link>
                  </div>
                ))}
                {matches.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No matches found yet. Complete your profile to get better matches!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/search">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50 hover:border-red-300/50">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-red-500 to-amber-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Search Profiles</h3>
                <p className="text-gray-600 text-sm">Find your perfect match</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/v-dates">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-amber-100/50 hover:border-amber-300/50">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-amber-500 to-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Video Dates</h3>
                <p className="text-gray-600 text-sm">Meet virtually first</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/events">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50 hover:border-red-300/50">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-red-600 to-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Events</h3>
                <p className="text-gray-600 text-sm">Community gatherings</p>
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