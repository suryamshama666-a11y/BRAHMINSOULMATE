import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProfilesService } from '@/services/api/profiles.service';
import { UserProfile } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { OnlineStats } from './components/OnlineStats';
import { OnlineSearchBar } from './components/OnlineSearchBar';
import { OnlineProfileCard } from './components/OnlineProfileCard';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

const _PROFILES_PER_PAGE = 9;

const Online = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [_loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);
  const [showFilters, setShowFilters] = useState(true);

  const itemsPerPageOptions = [9, 15, 21];

  // Items per page validation - ensure current value is in available options
  // Reset to first option if current value is not in available options
  const validatedItemsPerPage = itemsPerPageOptions.includes(itemsPerPage) 
    ? itemsPerPage 
    : itemsPerPageOptions[0];
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        const result = await ProfilesService.getOnlineProfiles(50);
        if (result.data) {
          setProfiles(result.data);
        }
      } catch (error) {
        console.error('Error loading profiles:', error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  // All profiles fetched from getOnlineProfiles are considered online
  const onlineProfiles = profiles;

  const handleStartChat = (profileId: string, profileName: string) => {
    navigate(`/messages?conversation=${profileId}`);
    toast.success(`Starting chat with ${profileName}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  const handleVideoCall = (profileId: string, profileName: string) => {
    if (!isPremium) {
      toast.error("Video calling is only available for premium members", {
        description: "Upgrade your account to access video calling features",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/plans'),
        },
      });
      return;
    }
    navigate(`/video-call/${profileId}`);
    toast.success(`Starting video call with ${profileName}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  const handlePhoneCall = (profileId: string, profileName: string) => {
    if (!isPremium) {
      toast.error("Phone calling is only available for premium members", {
        description: "Upgrade your account to access phone calling features",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/plans'),
        },
      });
      return;
    }
    navigate(`/call/${profileId}`);
    toast.success(`Initiating phone call with ${profileName}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  const handleSendInterest = (profileName: string) => {
    toast.success(`Interest sent to ${profileName}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  const filteredProfiles = onlineProfiles.filter(profile => {
    const searchMatch = profile.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = typeof profile.location !== 'string' && profile.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch || cityMatch;
  });

    const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
    const currentProfiles = filteredProfiles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">
              Online Now
            </h1>
            <p className="text-gray-600">Connect with members who are currently online</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <OnlineStats onlineCount={onlineProfiles.length} />

        <div className="flex flex-col lg:flex-row gap-8">
          {showFilters && (
            <div className="w-full lg:w-1/4">
              <OnlineSearchBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
            </div>
          )}

            <div className={`flex-1 ${!showFilters ? 'w-full' : ''}`}>
              {/* Online Profiles Grid */}
                <div className={cn(
                  "grid gap-6",
                  showFilters 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" 
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                )}>
              {currentProfiles.map((profile) => (
                <OnlineProfileCard
                  key={profile.id}
                  profile={profile as any}
                  onStartChat={handleStartChat}
                  onVideoCall={handleVideoCall}
                  onPhoneCall={handlePhoneCall}
                  onSendInterest={handleSendInterest}
                />
              ))}
            </div>

            {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(val) => {
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                  itemsPerPageOptions={itemsPerPageOptions}
                />
              </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Online;
