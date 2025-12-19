import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, X, Bell, MessageCircle, Heart, Search, User,
  Home, Video, ChevronDown, DollarSign, Info, Eye,
  HelpCircle, Star, BookOpen, Settings, Users, Calendar
} from 'lucide-react';

export default function OriginalNavbar() {
  const { user, profile } = useAuth();
  const isAuthenticated = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userDisplayName = isAuthenticated ? (profile?.name || user?.email?.split('@')[0] || 'User') : 'User';
  const userImageUrl = isAuthenticated ? (profile?.profilePicture || '/placeholder.svg') : '/placeholder.svg';
  const userInitial = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'U';

  const mainLinks = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/matches', label: 'Matches', icon: Heart },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/v-dates', label: 'V-Dates', icon: Video },
  ];

  const connectionsLinks = [
    { name: 'My Favorites', href: '/my-favorites', icon: Star },
    { name: 'My Interests', href: '/my-interests', icon: Heart },
    { name: 'Interested in Me', href: '/interests-received', icon: Heart },
    { name: 'Who Viewed You', href: '/connections/who-viewed', icon: Eye },
  ];

  const moreLinks = [
    { path: '/account', label: 'Account', icon: Settings },
    { path: '/plans', label: 'Plans', icon: DollarSign },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/help', label: 'Help', icon: HelpCircle },
    { path: '/about', label: 'About', icon: Info },
    { path: '/success-stories', label: 'Success Stories', icon: Star },
    { path: '/how-it-works', label: 'How it Works', icon: BookOpen },
    { path: '/free-vs-paid', label: 'Free vs Paid', icon: DollarSign },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-b from-white to-[#FFF1E6] border-b border-[#FF4500]/10">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-[#FF4500] hidden sm:block">
                BrahminSoulmate
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 flex-1 justify-center">
            <Link to="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF4500] ${
                  location.pathname === '/dashboard'
                    ? 'bg-[#FFF1E6] text-[#FF4500] hover:bg-[#FFE4D6] border border-[#FF4500]/20'
                    : 'text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20'
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden lg:block">Home</span>
              </Button>
            </Link>

            <Link to="/search">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF4500] ${
                  location.pathname === '/search'
                    ? 'bg-[#FFF1E6] text-[#FF4500] hover:bg-[#FFE4D6] border border-[#FF4500]/20'
                    : 'text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20'
                }`}
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:block">Search</span>
              </Button>
            </Link>

            <Link to="/matches">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF4500] ${
                  location.pathname === '/matches'
                    ? 'bg-[#FFF1E6] text-[#FF4500] hover:bg-[#FFE4D6] border border-[#FF4500]/20'
                    : 'text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20'
                }`}
              >
                <Heart className="h-4 w-4" />
                <span className="hidden lg:block">Matches</span>
              </Button>
            </Link>

            <Link to="/messages">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF4500] ${
                  location.pathname === '/messages'
                    ? 'bg-[#FFF1E6] text-[#FF4500] hover:bg-[#FFE4D6] border border-[#FF4500]/20'
                    : 'text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden lg:block">Messages</span>
              </Button>
            </Link>

            <Link to="/profile">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF4500] ${
                  location.pathname === '/profile' || location.pathname.startsWith('/profile/')
                    ? 'bg-[#FFF1E6] text-[#FF4500] hover:bg-[#FFE4D6] border border-[#FF4500]/20'
                    : 'text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:block">Profile</span>
              </Button>
            </Link>

            {/* Connections Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md transition-colors text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20 focus:outline-none focus:ring-1 focus:ring-[#FF4500] cursor-pointer text-sm font-medium"
                >
                  <Users className="h-4 w-4" />
                  <span>Connections</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]"
              >
                {connectionsLinks.map(({ path, label, icon: Icon }) => (
                  <DropdownMenuItem key={path} className="focus:bg-[#FFF1E6] focus:text-[#FF4500] cursor-pointer">
                    <Link
                      to={path}
                      className="flex items-center space-x-2 px-2 py-1.5 w-full text-neutral-800 hover:text-[#FF4500]"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md transition-colors text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6] hover:border hover:border-[#FF4500]/20 focus:outline-none focus:ring-1 focus:ring-[#FF4500] cursor-pointer text-sm font-medium"
                >
                  <span>More</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]"
              >
                {moreLinks.map(({ path, label, icon: Icon }) => (
                  <DropdownMenuItem key={path} className="focus:bg-[#FFF1E6] focus:text-[#FF4500] cursor-pointer">
                    <Link
                      to={path}
                      className="flex items-center space-x-2 px-2 py-1.5 w-full text-neutral-800 hover:text-[#FF4500]"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Icons */}
                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-[#FF4500]/70 hover:text-[#FF4500] hover:bg-[#FFF1E6]"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {profile?.unreadMessages && profile.unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#FF4500] text-white text-xs rounded-full flex items-center justify-center">
                        {profile.unreadMessages}
                      </span>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-[#FF4500]/70 hover:text-[#FF4500] hover:bg-[#FFF1E6]"
                    onClick={() => navigate('/matches')}
                  >
                    <Heart className="h-5 w-5" />
                    {profile?.newMatches && profile.newMatches > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#FF4500] text-white text-xs rounded-full flex items-center justify-center">
                        {profile.newMatches}
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-[#FF4500]/70 hover:text-[#FF4500] hover:bg-[#FFF1E6]"
                    onClick={() => navigate('/notifications')}
                  >
                    <Bell className="h-5 w-5" />
                    {profile?.notifications && profile.notifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#FF4500] text-white text-xs rounded-full flex items-center justify-center">
                        {profile.notifications}
                      </span>
                    )}
                  </Button>
                </div>

                {/* User Menu */}
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-sm font-medium text-[#FF4500]/80 hover:text-[#FF4500] hover:bg-[#FFF1E6]"
                    onClick={() => navigate('/profile')}
                  >
                    <Avatar className="h-8 w-8 border-2 border-[#FF4500]/20">
                      <AvatarImage src={userImageUrl} alt={userDisplayName} />
                      <AvatarFallback className="bg-[#FFF1E6] text-[#FF4500]">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block">{userDisplayName}</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <button
                    style={{
                      backgroundColor: location.pathname === '/login' ? '#FF4500' : '#FFFFFF',
                      color: location.pathname === '/login' ? '#FFFFFF' : '#000000',
                      border: '2px solid #FF4500',
                      borderRadius: '9999px',
                      padding: '6px 12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Login
                  </button>
                </Link>
                
                <Link to="/register">
                  <button
                    style={{
                      backgroundColor: location.pathname === '/register' ? '#FF4500' : '#FFFFFF',
                      color: location.pathname === '/register' ? '#FFFFFF' : '#000000',
                      border: '2px solid #FF4500',
                      borderRadius: '9999px',
                      padding: '6px 12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Register
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FF4500]/70 hover:text-[#FF4500] hover:bg-[#FFF1E6]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#FF4500]/10 shadow-lg">
          <div className="p-4 space-y-2">
            {mainLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start space-x-2 text-neutral-800 hover:text-[#FF4500] hover:bg-[#FFF1E6]"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}