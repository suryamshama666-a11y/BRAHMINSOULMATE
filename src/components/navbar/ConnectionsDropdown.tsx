import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Users, Heart, Star, UserPlus, Eye, MessageCircle, 
  ChevronDown, Clock, CheckCircle 
} from 'lucide-react';

type ConnectionsData = {
  myFavorites: number;
  myInterests: number;
  interestedInMe: number;
  profileViews: number;
  newMessages: number;
  newHellos: number;
};

type ConnectionsDropdownProps = {
  data?: ConnectionsData;
};

export default function ConnectionsDropdown({ 
  data = {
    myFavorites: 12,
    myInterests: 8,
    interestedInMe: 30,
    profileViews: 247,
    newMessages: 26,
    newHellos: 30
  }
}: ConnectionsDropdownProps) {
  
  const connectionItems = [
    {
      id: 'favorites',
      label: 'My Favorites',
      count: data.myFavorites,
      icon: Star,
      route: '/my-connections?tab=favorites',
      description: 'Profiles you marked as favorite',
      color: 'bg-yellow-500'
    },
    {
      id: 'interests',
      label: 'My Interests',
      count: data.myInterests,
      icon: Heart,
      route: '/my-connections?tab=interests',
      description: 'People you showed interest in',
      color: 'bg-red-500'
    },
    {
      id: 'interested-in-me',
      label: 'Interested in Me',
      count: data.interestedInMe,
      icon: Heart,
      route: '/my-connections?tab=interested-in-me',
      description: 'People who showed interest in you',
      color: 'bg-pink-500',
      isNew: data.interestedInMe > 0
    },
    {
      id: 'profile-views',
      label: 'Profile Views',
      count: data.profileViews,
      icon: Eye,
      route: '/my-connections?tab=views',
      description: 'People who viewed your profile',
      color: 'bg-blue-500'
    },
    {
      id: 'messages',
      label: 'Messages',
      count: data.newMessages,
      icon: MessageCircle,
      route: '/messages',
      description: 'New messages from connections',
      color: 'bg-green-500',
      isNew: data.newMessages > 0
    },
    {
      id: 'hellos',
      label: 'New Hellos',
      count: data.newHellos,
      icon: UserPlus,
      route: '/my-connections?tab=hellos',
      description: 'New hello requests received',
      color: 'bg-purple-500',
      isNew: data.newHellos > 0
    }
  ];

  const totalNotifications = data.interestedInMe + data.newMessages + data.newHellos;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="default"
          className="relative flex items-center space-x-2 px-4 py-3 rounded-md transition-colors text-lg font-medium text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20 focus:outline-none focus:ring-1 focus:ring-[#FF4500]"
        >
          <Users className="h-5 w-5" />
          <span>Connections</span>
          <ChevronDown className="h-4 w-4" />
          {totalNotifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white">
              {totalNotifications > 99 ? '99+' : totalNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50"
      >
        <DropdownMenuLabel className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">My Connections</span>
            <Badge variant="secondary" className="text-xs">
              {totalNotifications} new
            </Badge>
          </div>
        </DropdownMenuLabel>

        {connectionItems.map((item, index) => (
          <div key={item.id}>
            <DropdownMenuItem className="focus:bg-[#FFF1E6] focus:text-[#FF4500] p-0">
              <Link
                to={item.route}
                className="flex items-center justify-between w-full px-4 py-3 text-neutral-800 hover:text-[#FF4500] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${item.color} text-white`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.isNew && (
                        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge 
                    variant={item.isNew ? "default" : "secondary"} 
                    className={`font-bold ${item.isNew ? 'bg-red-500 text-white' : ''}`}
                  >
                    {item.count}
                  </Badge>
                </div>
              </Link>
            </DropdownMenuItem>
            {index < connectionItems.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}

        <DropdownMenuSeparator />
        
        {/* Quick Actions */}
        <div className="p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              Quick Actions
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/my-connections">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 hover:bg-blue-50 hover:border-blue-300"
              >
                <Users className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
            <Link to="/search">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 hover:bg-green-50 hover:border-green-300"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Find More
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="px-4 py-2 bg-green-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Online Now</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Active</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}