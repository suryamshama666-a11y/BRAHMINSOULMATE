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
      route: '/my-favorites',
      description: 'Profiles you marked as favorite',
      color: 'bg-yellow-500'
    },
    {
      id: 'interests',
      label: 'My Interests',
      count: data.myInterests,
      icon: Heart,
      route: '/my-interests',
      description: 'People you showed interest in',
      color: 'bg-red-500'
    },
    {
      id: 'interested-in-me',
      label: 'Interested in Me',
      count: data.interestedInMe,
      icon: Heart,
      route: '/interests-received',
      description: 'People who showed interest in you',
      color: 'bg-pink-500',
      isNew: data.interestedInMe > 0
    },
    {
      id: 'who-viewed',
      label: 'Who Viewed You',
      count: data.profileViews,
      icon: Eye,
      route: '/connections/who-viewed',
      description: 'People who viewed your profile',
      color: 'bg-blue-500'
    },
    {
      id: 'you-viewed',
      label: 'You Viewed',
      count: 0,
      icon: Eye,
      route: '/connections/you-viewed',
      description: 'Profiles you recently viewed',
      color: 'bg-indigo-500'
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
      route: '/interests-received',
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
          size="nav"
          className="relative flex items-center space-x-2 rounded-md transition-colors font-medium text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20 focus:outline-none focus:ring-1 focus:ring-[#FF4500]"
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
            <DropdownMenuItem asChild className="focus:bg-[#FFF1E6] focus:text-[#FF4500]">
                  <Link
                    to={item.route}
                    className="flex items-center justify-between w-full px-4 py-3 text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-full ${item.color} text-white shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[14px] text-gray-900 group-hover:text-[#FF4500]">
                              {item.label}
                            </span>
                            {item.isNew && (
                              <Badge className="bg-red-500 text-white text-[10px] h-4 px-1.5 py-0 shrink-0 border-none">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="text-[12px] text-gray-500 leading-tight group-hover:text-gray-600">
                            {item.description}
                          </p>
                      </div>
                    </div>
                    <div className="flex items-center ml-4 shrink-0">
                      <Badge 
                        variant={item.isNew ? "default" : "secondary"} 
                        className={`font-bold h-6 min-w-[24px] flex items-center justify-center text-[11px] rounded-full ${item.isNew ? 'bg-red-500 text-white border-transparent' : 'bg-gray-100 text-gray-600 border-none'}`}
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
            <div className="grid grid-cols-1 gap-2">
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