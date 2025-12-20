import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { OnlineStats } from './components/OnlineStats';
import { OnlineSearchBar } from './components/OnlineSearchBar';
import { OnlineProfileCard } from './components/OnlineProfileCard';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 9;

const Online = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        const result = await api.getProfiles({ page: 1, limit: 20 });
        const profilesData = Array.isArray(result) ? result : result.data || [];
        setProfiles(profilesData);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  // Filter to show only "online" users (simulate with even index profiles)
  const onlineProfiles = profiles.filter((_, index) => index % 2 === 0);

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

  const filteredProfiles = onlineProfiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.location.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const currentProfiles = filteredProfiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">
            Online Now
          </h1>
          <p className="text-gray-600">Connect with members who are currently online</p>
        </div>

        <OnlineStats onlineCount={onlineProfiles.length} />

        <OnlineSearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />

        {/* Online Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProfiles.map((profile) => (
            <OnlineProfileCard
              key={profile.id}
              profile={profile}
              onStartChat={handleStartChat}
              onVideoCall={handleVideoCall}
              onPhoneCall={handlePhoneCall}
              onSendInterest={handleSendInterest}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Online;
