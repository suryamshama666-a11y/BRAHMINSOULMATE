import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  Heart, Star, MapPin, Briefcase, GraduationCap,
  MessageCircle, Phone, Video, Gift, Crown, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProfileCard from '@/components/ProfileCard';
import { useAIMatching } from '@/services/aiMatchingService';

// Custom ConnectIcon component for the pointing fingers
const ConnectIcon = ({ className }: { className?: string }) => (
  <svg
    width="18"
    height="14"
    viewBox="0 0 24 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-all duration-300`}
  >
    {/* Left Hand - Index Finger */}
    <path
      d="M2,8 L9,8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M9,5.5 C9,5.5 9,7 9,8 C9,9 9,10.5 9,10.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Right Hand - Index Finger */}
    <path
      d="M22,8 L15,8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M15,5.5 C15,5.5 15,7 15,8 C15,9 15,10.5 15,10.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Lightning/Spark between fingers - more visible */}
    <path
      d="M12,8 L10.5,5.5 L13.5,8 L10.5,10.5 L12,8 Z"
      fill="#FFD700"
      stroke="#FFA500"
      strokeWidth="1"
      className="drop-shadow-sm"
    />
  </svg>
);

const Matches = () => {
  const { user } = useAuth();
  const { getAIMatches, getMatchExplanation } = useAIMatching();
  const [activeTab, setActiveTab] = useState('recommended');
  const [connectedProfiles, setConnectedProfiles] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [aiMatches, setAIMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAILoading] = useState(false);

  // Fallback matches data
  const fallbackMatches = [
    {
      id: '1',
      name: 'Priya Sharma',
      age: 28,
      gender: 'female',
      height: 165,
      location: { city: 'Mumbai', state: 'Maharashtra' },
      employment: { profession: 'Software Engineer' },
      education: 'B.Tech Computer Science',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: true,
      compatibility_score: 95,
      last_active: new Date().toISOString(),
      subscription_type: 'premium',
      photos: ['/api/placeholder/300/400']
    },
    {
      id: '2', 
      name: 'Anita Patel',
      age: 26,
      gender: 'female',
      height: 160,
      location: { city: 'Ahmedabad', state: 'Gujarat' },
      employment: { profession: 'Doctor' },
      education: 'MBBS',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: true,
      compatibility_score: 92,
      last_active: new Date().toISOString(),
      subscription_type: 'premium',
      photos: ['/api/placeholder/300/400']
    },
    {
      id: '3',
      name: 'Kavya Iyer',
      age: 25,
      gender: 'female',
      height: 158,
      location: { city: 'Chennai', state: 'Tamil Nadu' },
      employment: { profession: 'Teacher' },
      education: 'M.Ed',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: false,
      compatibility_score: 88,
      last_active: new Date().toISOString(),
      subscription_type: 'free',
      photos: ['/api/placeholder/300/400']
    },
    {
      id: '4',
      name: 'Meera Gupta',
      age: 27,
      gender: 'female',
      height: 162,
      location: { city: 'Delhi', state: 'Delhi' },
      employment: { profession: 'Marketing Manager' },
      education: 'MBA Marketing',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: true,
      compatibility_score: 90,
      last_active: new Date().toISOString(),
      subscription_type: 'premium',
      photos: ['/api/placeholder/300/400']
    },
    {
      id: '5',
      name: 'Sneha Reddy',
      age: 24,
      gender: 'female',
      height: 155,
      location: { city: 'Hyderabad', state: 'Telangana' },
      employment: { profession: 'Data Analyst' },
      education: 'M.Sc Statistics',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: true,
      compatibility_score: 87,
      last_active: new Date().toISOString(),
      subscription_type: 'free',
      photos: ['/api/placeholder/300/400']
    },
    {
      id: '6',
      name: 'Riya Joshi',
      age: 29,
      gender: 'female',
      height: 168,
      location: { city: 'Pune', state: 'Maharashtra' },
      employment: { profession: 'Architect' },
      education: 'B.Arch',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: false,
      compatibility_score: 85,
      last_active: new Date().toISOString(),
      subscription_type: 'premium',
      photos: ['/api/placeholder/300/400']
    },
    {
      id: '7',
      name: 'Pooja Singh',
      age: 26,
      gender: 'female',
      height: 163,
      location: { city: 'Bangalore', state: 'Karnataka' },
      employment: { profession: 'Product Manager' },
      education: 'B.Tech + MBA',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: true,
      compatibility_score: 93,
      last_active: new Date().toISOString(),
      subscription_type: 'premium',
      photos: ['/api/placeholder/300/400']
    },
    {
      id: '8',
      name: 'Divya Nair',
      age: 25,
      gender: 'female',
      height: 157,
      location: { city: 'Kochi', state: 'Kerala' },
      employment: { profession: 'Nurse' },
      education: 'B.Sc Nursing',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: true,
      compatibility_score: 89,
      last_active: new Date().toISOString(),
      subscription_type: 'free',
      photos: ['/api/placeholder/300/400']
    },
    {
      id: '9',
      name: 'Shreya Agarwal',
      age: 27,
      gender: 'female',
      height: 161,
      location: { city: 'Jaipur', state: 'Rajasthan' },
      employment: { profession: 'CA' },
      education: 'Chartered Accountant',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: true,
      compatibility_score: 91,
      last_active: new Date().toISOString(),
      subscription_type: 'premium',
      photos: ['/api/placeholder/300/400']
    },
    {
      id: '10',
      name: 'Neha Verma',
      age: 28,
      gender: 'female',
      height: 159,
      location: { city: 'Lucknow', state: 'Uttar Pradesh' },
      employment: { profession: 'Bank Manager' },
      education: 'MBA Finance',
      religion: 'Hindu',
      caste: 'Brahmin',
      isVerified: false,
      compatibility_score: 86,
      last_active: new Date().toISOString(),
      subscription_type: 'free',
      photos: ['/api/placeholder/300/400']
    }
  ];

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Always load fallback matches
        setMatches(fallbackMatches);
        setAIMatches([]);
        
      } catch (error) {
        console.error('Error loading matches:', error);
        setMatches(fallbackMatches);
        setAIMatches([]);
      } finally {
        setLoading(false);
        setAILoading(false);
      }
    };

    loadMatches();
  }, []);

  // Enhanced matches with AI scores
  const recommendedMatches = aiMatches.slice(0, 6).map(aiMatch => {
    const profile = matches.find(m => m.id === aiMatch.profileId);
    return profile ? { ...profile, aiScore: aiMatch.score, matchReasons: aiMatch.reasons } : null;
  }).filter(Boolean);
  
  const mutualMatches = matches.slice(6, 10);
  const recentMatches = matches.slice(10, 14);
  const aiRecommendations = aiMatches.slice(0, 8);

  const handleSendInterest = (profileName: string, profileId: string) => {
    const isConnected = connectedProfiles.includes(profileId);

    if (!isConnected) {
      setConnectedProfiles(prev => [...prev, profileId]);
      toast.success(`Interest sent to ${profileName}`, {
        position: "top-center",
        duration: 2000,
      });
    } else {
      setConnectedProfiles(prev => prev.filter(id => id !== profileId));
      toast.info(`Interest withdrawn from ${profileName}`);
    }
  };

  const getMatchPercentage = () => Math.floor(Math.random() * 30) + 70;

  const renderMatches = (matchList: any[], title: string) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[4/5] bg-gray-200 animate-pulse"></div>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (matchList.length === 0) {
      return (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No matches found</h3>
          <p className="text-gray-500">Complete your profile to get better matches!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchList.map((profile) => (
          <ProfileCard 
            key={profile.id}
            profile={{
              id: profile.id,
              name: profile.name,
              age: profile.age,
              gender: profile.gender || 'male',
              height: profile.height || 170,
              religion: profile.religion || 'Hindu',
              caste: profile.caste || 'Brahmin',
              gotra: profile.family?.gotra || profile.gotra,
              location: `${profile.location?.city || 'Location not specified'}, ${profile.location?.state || ''}`,
              education: profile.education?.[0]?.degree || profile.education || 'Education not specified',
              profession: profile.employment?.profession || profile.profession || 'Profession not specified',
              subscription_type: profile.subscription_type || 'free',
              lastActive: profile.lastActive || '1 hour ago',
              matchPercentage: getMatchPercentage(),
              rashi: profile.horoscope?.rashi
            }}
            variant="match"
            onAction={(action, profileId) => {
              switch (action) {
                case 'expressInterest':
                  handleSendInterest(profile.name, profileId);
                  break;
              }
            }}
          />
        ))}
      </div>
    );
  };

  const renderAIMatches = (aiMatchList: any[], title: string) => {
    if (aiLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-2 border-purple-200">
              <div className="aspect-[4/5] bg-gradient-to-br from-purple-100 to-blue-100 animate-pulse"></div>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-purple-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-purple-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-blue-200 rounded animate-pulse w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (aiMatchList.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
            <Star className="h-12 w-12 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">AI is analyzing your preferences</h3>
          <p className="text-gray-500">Complete your profile for better AI recommendations!</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* AI Insights Header */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-600 rounded-full p-2">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-800">AI-Powered Matching</h3>
                <p className="text-sm text-purple-600">Matches based on advanced compatibility analysis</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{Math.round(aiMatchList.reduce((acc, match) => acc + match.score, 0) / aiMatchList.length)}%</div>
                <div className="text-xs text-purple-500">Avg Match</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{aiMatchList.length}</div>
                <div className="text-xs text-blue-500">AI Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{aiMatchList.filter(m => m.score > 80).length}</div>
                <div className="text-xs text-green-500">High Match</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{aiMatchList.filter(m => m.breakdown.premium > 0.9).length}</div>
                <div className="text-xs text-orange-500">Premium</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiMatchList.map((aiMatch) => {
            const profile = matches.find(m => m.id === aiMatch.profileId);
            if (!profile) return null;

            return (
              <Card key={aiMatch.profileId} className="overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg">
                {/* AI Score Badge */}
                <div className="relative">
                  <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                        <AvatarImage src={profile.images?.[0]} />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-400 to-blue-400 text-white">
                          {profile.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  {/* AI Score Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {Math.round(aiMatch.score)}% AI Match
                  </div>

                  {/* Premium Badge */}
                  {profile.subscription_type === 'premium' && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="space-y-3">
                    {/* Profile Info */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
                      <p className="text-gray-600">{profile.age} years • {profile.height || 170}cm</p>
                    </div>

                    {/* AI Match Reasons */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-purple-700">Why this is a great match:</h4>
                      <div className="space-y-1">
                        {aiMatch.reasons.slice(0, 2).map((reason, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <Star className="h-3 w-3 text-yellow-500 mr-1 flex-shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compatibility Breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Compatibility:</span>
                        <span className="font-semibold text-purple-600">{Math.round(aiMatch.breakdown.compatibility * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preferences:</span>
                        <span className="font-semibold text-blue-600">{Math.round(aiMatch.breakdown.preferences * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Interests:</span>
                        <span className="font-semibold text-green-600">{Math.round(aiMatch.breakdown.interests * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="font-semibold text-orange-600">{Math.round(aiMatch.breakdown.location * 100)}%</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={() => handleSendInterest(profile.name, profile.id)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Interest
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                        onClick={async () => {
                          const explanation = await getMatchExplanation(user.id, profile.id);
                          if (explanation) {
                            toast.success(`Detailed match analysis: ${explanation.score}% compatibility`);
                          }
                        }}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 
            className="text-4xl font-serif font-bold mb-2"
            style={{ color: '#E30613' }}
          >
            Your Matches
          </h1>
          <p className="text-gray-600">Discover profiles that match your preferences</p>
        </div>

        {/* Match Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-red-100/50">
            <CardContent className="p-6 text-center">
              <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-white fill-current" />
              </div>
              <h3 className="text-2xl font-bold text-primary">{recommendedMatches.length}</h3>
              <p className="text-gray-600">Recommended</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-white fill-current" />
              </div>
              <h3 className="text-2xl font-bold text-primary">{mutualMatches.length}</h3>
              <p className="text-gray-600">Mutual Interest</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-white fill-current" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">{recentMatches.length}</h3>
              <p className="text-gray-600">Recent Views</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-6 border-2 border-red-100/50">
          <CardHeader className="bg-orange-50">
            <div className="flex space-x-1 flex-wrap">
              {[
                { id: 'ai', label: '🤖 AI Matches', count: aiRecommendations.length, premium: true },
                { id: 'recommended', label: 'Recommended', count: recommendedMatches.length },
                { id: 'mutual', label: 'Mutual Interest', count: mutualMatches.length },
                { id: 'recent', label: 'Recent Views', count: recentMatches.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-red-800 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                  {tab.premium && (
                    <Crown className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
                  )}
                  {aiLoading && tab.id === 'ai' && (
                    <Loader2 className="h-3 w-3 animate-spin ml-1 inline" />
                  )}
                </button>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Match Content */}
        <div className="mb-8">
          {activeTab === 'ai' && renderAIMatches(aiRecommendations, 'AI-Powered Matches')}
          {activeTab === 'recommended' && renderMatches(recommendedMatches, 'Recommended Matches')}
          {activeTab === 'mutual' && renderMatches(mutualMatches, 'Mutual Interest')}
          {activeTab === 'recent' && renderMatches(recentMatches, 'Recent Views')}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Matches;
