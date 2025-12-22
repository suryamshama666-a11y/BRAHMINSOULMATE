import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu, X, Bell, MessageCircle, Heart, Search, User, 
  Crown, Sparkles, LogOut, Settings, LayoutDashboard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavbarLinks from './navbar/NavbarLinks';
import MobileMenu from './navbar/MobileMenu';
import AuthButtons from './navbar/AuthButtons';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const isAuthenticated = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const userDisplayName = isAuthenticated && (profile?.name || user?.email?.split('@')[0] || 'Member');
  const userImageUrl = isAuthenticated && (profile?.profile_picture || '/placeholder.svg');
  const userInitial = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'U';

  const isPremium = profile?.subscription_type === 'premium';

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-500 w-full",
      scrolled 
        ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] py-2" 
        : "bg-white py-4"
    )}>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <div className="h-10 w-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <Heart className="h-5 w-5 text-[#FF4500] fill-[#FF4500]" />
                </div>
                {isPremium && (
                  <div className="absolute -top-1 -right-1">
                    <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500 filter drop-shadow-sm" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex flex-col">
                <span className="text-xl font-serif font-black tracking-tighter text-[#1A1A1A] leading-none">
                  BRAHMIN
                </span>
                <span className="text-[10px] font-bold tracking-[0.3em] text-[#FF4500] leading-none mt-1">
                  SOULMATE
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100">
              <NavbarLinks />
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Action Icons */}
                <div className="hidden sm:flex items-center space-x-1 mr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-xl transition-all"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {(profile as any)?.unreadMessages > 0 && (
                      <span className="absolute top-2 right-2 h-2 w-2 bg-[#FF4500] rounded-full border-2 border-white"></span>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-xl transition-all"
                    onClick={() => navigate('/matches')}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-xl transition-all"
                    onClick={() => navigate('/notifications')}
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-1 h-auto hover:bg-gray-100 rounded-2xl transition-all border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-center space-x-3 px-1">
                        <div className="relative">
                          <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                            <AvatarImage src={userImageUrl} alt={userDisplayName} />
                            <AvatarFallback className="bg-[#1A1A1A] text-white text-xs font-bold">
                              {userInitial}
                            </AvatarFallback>
                          </Avatar>
                          {isPremium && (
                            <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 shadow-sm border border-white">
                              <Crown className="h-2 w-2 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="hidden md:flex flex-col items-start mr-2">
                          <span className="text-sm font-black text-[#1A1A1A] leading-none mb-1">{userDisplayName}</span>
                          <span className="text-[10px] font-bold text-[#FF4500] uppercase tracking-widest leading-none">
                            {isPremium ? 'Gold Elite' : 'Classic'}
                          </span>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-gray-100 shadow-2xl">
                    <DropdownMenuLabel className="font-serif font-black text-[#1A1A1A] px-4 py-3">Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-50" />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="rounded-xl py-3 px-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                      <LayoutDashboard className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="font-bold text-sm">Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl py-3 px-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                      <User className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="font-bold text-sm">My Profile</span>
                    </DropdownMenuItem>
                    {!isPremium && (
                      <DropdownMenuItem onClick={() => navigate('/plans')} className="rounded-xl py-3 px-4 cursor-pointer bg-orange-50 hover:bg-orange-100 focus:bg-orange-100 text-[#FF4500]">
                        <Crown className="h-4 w-4 mr-3" />
                        <span className="font-black text-sm">Upgrade to Gold</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl py-3 px-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                      <Settings className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="font-bold text-sm">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-50" />
                    <DropdownMenuItem onClick={() => signOut()} className="rounded-xl py-3 px-4 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-500">
                      <LogOut className="h-4 w-4 mr-3" />
                      <span className="font-bold text-sm">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <AuthButtons />
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 top-[73px] bg-white z-50 animate-in slide-in-from-top duration-300">
          <MobileMenu onClose={closeMobileMenu} />
        </div>
      )}
    </nav>
  );
}
