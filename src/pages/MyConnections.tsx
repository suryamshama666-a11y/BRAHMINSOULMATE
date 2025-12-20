import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, Star, UserPlus, Eye, Filter 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import ProfileCard from '@/components/ProfileCard';

type ConnectionProfile = {
  id: string;
  full_name: string;
  age: number;
  location: string;
  education: string;
  profession: string;
  profilePicture: string;
  compatibility: number;
  lastSeen: string;
  isOnline: boolean;
  isPremium: boolean;
  status: 'sent' | 'received' | 'mutual' | 'viewed';
  timestamp: string;
};

const mockConnections: ConnectionProfile[] = [
  {
    id: '1',
    full_name: 'Priya Sharma',
    age: 28,
    location: 'Mumbai, Maharashtra',
    education: 'MBA',
    profession: 'Software Engineer',
    profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
    compatibility: 95,
    lastSeen: 'Online now',
    isOnline: true,
    isPremium: true,
    status: 'received',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    full_name: 'Anjali Patel',
    age: 26,
    location: 'Bangalore, Karnataka',
    education: 'M.Tech',
    profession: 'Data Scientist',
    profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
    compatibility: 88,
    lastSeen: '5 minutes ago',
    isOnline: false,
    isPremium: false,
    status: 'sent',
    timestamp: '1 day ago'
  },
  {
    id: '3',
    full_name: 'Kavya Iyer',
    age: 25,
    location: 'Chennai, Tamil Nadu',
    education: 'CA',
    profession: 'Chartered Accountant',
    profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
    compatibility: 92,
    lastSeen: '2 minutes ago',
    isOnline: false,
    isPremium: true,
    status: 'mutual',
    timestamp: '3 days ago'
  }
];

export default function MyConnections() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [connections] = useState(mockConnections);

  const getConnectionsByType = (type: string) => {
    switch (type) {
      case 'favorites':
        return connections.filter(c => c.status === 'mutual');
      case 'interests':
        return connections.filter(c => c.status === 'sent');
      case 'interested-in-me':
        return connections.filter(c => c.status === 'received');
      case 'views':
        return connections.filter(c => c.status === 'viewed');
      default:
        return connections;
    }
  };

  const tabData = [
    { id: 'favorites', label: 'My Favorites', icon: Star, count: getConnectionsByType('favorites').length },
    { id: 'interests', label: 'My Interests', icon: Heart, count: getConnectionsByType('interests').length },
    { id: 'interested-in-me', label: 'Interested in Me', icon: Heart, count: getConnectionsByType('interested-in-me').length },
    { id: 'views', label: 'Profile Views', icon: Eye, count: getConnectionsByType('views').length }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Connections</h1>
              <p className="text-gray-600">Manage your favorites, interests, and profile interactions</p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {tabData.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabData.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <tab.icon className="h-5 w-5" />
                  {tab.label} ({tab.count})
                </h2>
              </div>

                  {getConnectionsByType(tab.id).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {getConnectionsByType(tab.id).map((connection) => (
                    <ProfileCard 
                      key={connection.id}
                      profile={connection}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <tab.icon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No {tab.label.toLowerCase()} yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start connecting with people to see them here
                    </p>
                    <Link to="/search">
                      <Button className="bg-red-600 hover:bg-red-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Find Connections
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
