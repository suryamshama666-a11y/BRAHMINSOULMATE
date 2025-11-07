import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Users, Video } from 'lucide-react';

const Dashboard = () => {
  const { profile, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-6">
            <h1 className="text-3xl font-serif font-bold mb-2">
              Welcome back, {profile?.name || user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-red-100">Find your perfect match today</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-red-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Profile Views</p>
                  <p className="text-3xl font-bold text-red-600">0</p>
                </div>
                <div className="p-3 rounded-full bg-red-500">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Messages</p>
                  <p className="text-3xl font-bold text-red-600">0</p>
                </div>
                <div className="p-3 rounded-full bg-amber-500">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Matches</p>
                  <p className="text-3xl font-bold text-red-600">0</p>
                </div>
                <div className="p-3 rounded-full bg-red-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">V-Dates</p>
                  <p className="text-3xl font-bold text-red-600">0</p>
                </div>
                <div className="p-3 rounded-full bg-amber-500">
                  <Video className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/search">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50">
              <CardContent className="p-6 text-center">
                <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Search Profiles</h3>
                <p className="text-gray-600 text-sm">Find your perfect match</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/v-dates">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-amber-100/50">
              <CardContent className="p-6 text-center">
                <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Video Dates</h3>
                <p className="text-gray-600 text-sm">Meet virtually first</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/messages">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-100/50">
              <CardContent className="p-6 text-center">
                <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Messages</h3>
                <p className="text-gray-600 text-sm">Connect with matches</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;