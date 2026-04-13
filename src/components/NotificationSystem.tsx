import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, Heart, Eye, UserPlus, Video, 
  Users, Clock, CheckCircle, EyeOff, Globe 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotificationData = {
  newMessages: number;
  newHellos: number;
  newViews: number;
  interestedInYou: number;
  newVideoDates: number;
  chatStatus: 'Available' | 'Busy' | 'Away';
  privateMode: boolean;
  profileDisplay: 'Visible' | 'Hidden';
};

type NotificationSystemProps = {
  data?: NotificationData;
  compact?: boolean;
};

export default function NotificationSystem({ 
  data = {
    newMessages: 26,
    newHellos: 30,
    newViews: 8,
    interestedInYou: 30,
    newVideoDates: 0,
    chatStatus: 'Available',
    privateMode: false,
    profileDisplay: 'Visible'
  },
  compact = false 
}: NotificationSystemProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(data);

  const notificationItems = [
    {
      id: 'messages',
      label: 'New Messages',
      count: notifications.newMessages,
      icon: MessageCircle,
      color: 'bg-blue-500',
      route: '/messages',
      description: 'Unread messages from matches'
    },
    {
      id: 'hellos',
      label: 'New Hellos',
      count: notifications.newHellos,
      icon: UserPlus,
      color: 'bg-green-500',
      route: '/connections/hellos',
      description: 'New hello requests received'
    },
    {
      id: 'views',
      label: 'New Views',
      count: notifications.newViews,
      icon: Eye,
      color: 'bg-purple-500',
      route: '/profile/views',
      description: 'People who viewed your profile'
    },
    {
      id: 'interested',
      label: 'Interested in You',
      count: notifications.interestedInYou,
      icon: Heart,
      color: 'bg-red-500',
      route: '/connections/interests',
      description: 'People who showed interest'
    },
    {
      id: 'videoDates',
      label: 'New Video Dates',
      count: notifications.newVideoDates,
      icon: Video,
      color: 'bg-orange-500',
      route: '/v-dates',
      description: 'Video date requests'
    }
  ];

  const statusItems = [
    {
      id: 'chatStatus',
      label: 'Chat Status',
      value: notifications.chatStatus,
      icon: notifications.chatStatus === 'Available' ? CheckCircle : Clock,
      color: notifications.chatStatus === 'Available' ? 'text-green-600' : 'text-yellow-600'
    },
    {
      id: 'privateMode',
      label: 'Private Mode',
      value: notifications.privateMode ? 'Enabled' : 'Disabled',
      icon: notifications.privateMode ? EyeOff : Eye,
      color: notifications.privateMode ? 'text-red-600' : 'text-green-600'
    },
    {
      id: 'profileDisplay',
      label: 'Profile Display',
      value: notifications.profileDisplay,
      icon: Globe,
      color: notifications.profileDisplay === 'Visible' ? 'text-green-600' : 'text-red-600'
    }
  ];

  const handleNotificationClick = (route: string) => {
    navigate(route);
  };

  const togglePrivateMode = () => {
    setNotifications(prev => ({
      ...prev,
      privateMode: !prev.privateMode
    }));
  };

  const changeChatStatus = () => {
    const statuses: Array<'Available' | 'Busy' | 'Away'> = ['Available', 'Busy', 'Away'];
    const currentIndex = statuses.indexOf(notifications.chatStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    setNotifications(prev => ({
      ...prev,
      chatStatus: nextStatus
    }));
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {notificationItems.filter(item => item.count > 0).map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => handleNotificationClick(item.route)}
            className="relative p-2"
          >
            <item.icon className="h-4 w-4" />
            {item.count > 0 && (
              <Badge className={`absolute -top-1 -right-1 h-5 w-5 p-0 text-xs ${item.color} text-white`}>
                {item.count > 99 ? '99+' : item.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Activity Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notificationItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item.route)}
              className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors bg-white hover:bg-blue-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${item.color} text-white`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <Badge variant={item.count > 0 ? "default" : "secondary"} className="text-lg font-bold">
                  {item.count}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Status Section */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 text-sm">Account Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${item.color}`}>
                    {item.value}
                  </span>
                  {item.id === 'privateMode' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePrivateMode}
                      className="h-6 px-2 text-xs"
                    >
                      Toggle
                    </Button>
                  )}
                  {item.id === 'chatStatus' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={changeChatStatus}
                      className="h-6 px-2 text-xs"
                    >
                      Change
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 text-sm">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/messages')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              View All Messages
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/connections')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Connections
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View My Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
