import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu, X, Bell, MessageCircle, Heart, Search, User
} from 'lucide-react';
import NavbarLinks from './navbar/NavbarLinks';
import MobileMenu from './navbar/MobileMenu';
import AuthButtons from './navbar/AuthButtons';
import Logo from './navbar/Logo';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Navbar() {
  const { user, profile } = useAuth();
  const isAuthenticated = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Get user display properties safely with optional chaining
  const userDisplayName = isAuthenticated && (profile?.name || user?.email || 'User');
  const userImageUrl = isAuthenticated && (profile?.profilePicture || '/placeholder.svg');
  const userInitial = userDisplayName ? userDisplayName.charAt(0) : 'U';

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-b from-white to-[#FFF1E6] border-b border-[#FF4500]/10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-display font-semibold text-[#FF4500] hidden sm:block">
                BrahminSoulmate
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-1">
              <NavbarLinks />
            </div>
          )}

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
                    {profile?.unreadMessages > 0 && (
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
                    {profile?.newMatches > 0 && (
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
                    {profile?.notifications > 0 && (
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
              <AuthButtons />
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-[#FF4500]/70 hover:text-[#FF4500] hover:bg-[#FFF1E6]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <MobileMenu onClose={closeMobileMenu} />
      )}
    </nav>
  );
}
