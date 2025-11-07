
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageCircle, Video } from 'lucide-react';

interface OnlineStatsProps {
  onlineCount: number;
}

export const OnlineStats = ({ onlineCount }: OnlineStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border-2 border-green-100/50">
        <CardContent className="p-6 text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-600">{onlineCount}</h3>
          <p className="text-gray-600">Members Online</p>
        </CardContent>
      </Card>
      
      <Card className="border-2 border-blue-100/50">
        <CardContent className="p-6 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-blue-600">24</h3>
          <p className="text-gray-600">Active Chats</p>
        </CardContent>
      </Card>
      
      <Card className="border-2 border-purple-100/50">
        <CardContent className="p-6 text-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-purple-600">8</h3>
          <p className="text-gray-600">Video Calls</p>
        </CardContent>
      </Card>
    </div>
  );
};
