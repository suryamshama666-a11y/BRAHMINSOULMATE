import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home, Search, Heart, MessageCircle, Calendar,
  Users, Video, ChevronDown, DollarSign, Info,
  HelpCircle, Star, BookOpen, Settings, User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConnectionsDropdown from './ConnectionsDropdown';

const NavbarLinks = () => {
  const location = useLocation();

  const mainLinks = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/matches', label: 'Matches', icon: Heart },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/v-dates', label: 'V-Dates', icon: Video },
  ];

  const moreLinks = [
    { path: '/account', label: 'Account', icon: Settings },
    { path: '/plans', label: 'Plans', icon: DollarSign },
    { path: '/astrological-services', label: 'Astrological Services', icon: Star },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/help', label: 'Help', icon: HelpCircle },
    { path: '/about', label: 'About', icon: Info },
    { path: '/success-stories', label: 'Success Stories', icon: Star },
    { path: '/how-it-works', label: 'How it Works', icon: BookOpen },
    { path: '/free-vs-paid', label: 'Free vs Paid', icon: DollarSign },
  ];

  return (
    <nav className="flex items-center space-x-1">
      {mainLinks.map(({ path, label, icon: Icon }) => {
        const isActive = location.pathname === path;
        
        return (
          <Link key={path} to={path}>
            <Button
              variant="ghost"
              size="nav"
              className={`
                flex items-center space-x-2 rounded-md transition-colors font-medium
                focus:outline-none focus:ring-1 focus:ring-[#FF4500]
                ${isActive 
                  ? 'bg-[#FFF1E6] text-[#FF4500] hover:bg-[#FFE4D6] border border-[#FF4500]/20' 
                  : 'text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden lg:block">{label}</span>
            </Button>
          </Link>
        );
      })}

      {/* Connections Dropdown */}
      <ConnectionsDropdown />

      {/* More Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="nav"
            className={`
              flex items-center space-x-1 rounded-md transition-colors font-medium
              text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20
              focus:outline-none focus:ring-1 focus:ring-[#FF4500]
            `}
          >
            <span>More</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-white rounded-lg shadow-lg border-2 border-gray-200 z-50"
        >
          {moreLinks.map(({ path, label, icon: Icon }) => (
            <DropdownMenuItem key={path} className="focus:bg-[#FFF1E6] focus:text-[#FF4500]">
              <Link
                to={path}
                className="flex items-center space-x-2 px-3 py-2.5 w-full text-[17px] text-neutral-800 hover:text-[#FF4500]"
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default NavbarLinks;