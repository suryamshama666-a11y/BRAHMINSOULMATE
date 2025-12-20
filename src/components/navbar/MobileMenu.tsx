import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Home, Search, Heart, MessageCircle, Calendar,
  Users, Video, Settings, LogOut, User, DollarSign,
  Info, HelpCircle, Star, BookOpen, Briefcase
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu = ({ onClose }: MobileMenuProps) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const mainLinks = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/matches', label: 'Matches', icon: Heart },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/v-dates', label: 'V-Dates', icon: Video },
  ];

  const accountLinks = [
    { path: '/account', label: 'Account', icon: Settings },
    { path: '/plans', label: 'Plans', icon: DollarSign },
    { path: '/astrological-services', label: 'Astrological Services', icon: Star },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/events', label: 'Events', icon: Calendar },
  ];

  const infoLinks = [
    { path: '/help', label: 'Help', icon: HelpCircle },
    { path: '/about', label: 'About', icon: Info },
    { path: '/success-stories', label: 'Success Stories', icon: Star },
    { path: '/how-it-works', label: 'How it Works', icon: BookOpen },
    { path: '/free-vs-paid', label: 'Free vs Paid', icon: DollarSign },
  ];

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const renderLinks = (links: typeof mainLinks) => {
    return links.map(({ path, label, icon: Icon }) => {
      const isActive = location.pathname === path;
      
      return (
        <Link key={path} to={path} onClick={onClose}>
            <Button
              variant="ghost"
              className={`
                w-full justify-start space-x-3 py-3 text-base transition-colors
                focus:outline-none focus:border-amber-500
                ${isActive 
                  ? 'bg-[#FFF1E6] text-[#FF4500] hover:bg-[#FFE4D6] border border-[#FF4500]/20' 
                  : 'text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20'
                }
              `}
            >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Button>
        </Link>
      );
    });
  };

  return (
    <div className="fixed inset-x-0 top-16 bg-white border-b border-[#FF4500]/10 shadow-lg max-h-[85vh] overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <h3 className="px-3 text-base font-semibold text-neutral-600 uppercase tracking-wider mb-2">
            Main Menu
          </h3>
          {renderLinks(mainLinks)}
        </div>

        <Separator className="border-[#FF4500]/10" />

        {/* Account Links */}
        <div className="space-y-1">
          <h3 className="px-3 text-base font-semibold text-neutral-600 uppercase tracking-wider mb-2">
            Account
          </h3>
          {renderLinks(accountLinks)}
        </div>

        <Separator className="border-[#FF4500]/10" />

        {/* Information Links */}
        <div className="space-y-1">
          <h3 className="px-3 text-base font-semibold text-neutral-600 uppercase tracking-wider mb-2">
            Information
          </h3>
          {renderLinks(infoLinks)}
        </div>

        <Separator className="border-[#FF4500]/10" />

        {/* Logout Button */}
        <div className="pt-2">
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 py-3 text-base text-[#FF4500] hover:text-[#FF4500] hover:bg-[#FFF1E6]"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;