import { useState } from 'react';
import { toast } from "sonner";
import { Profile } from "@/types/profile";
import { UserProfile } from '@/types';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Create a unified type that works with both Profile and UserProfile structures
type AnyProfileType = Profile | UserProfile | any;

export const useProfileInteractions = (profile: AnyProfileType) => {
  const [liked, setLiked] = useState(false);
  const [isMessaging, ] = useState(false);
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  // Handle like/interest
  const handleLike = () => {
    setLiked(!liked);
    const message = liked 
      ? `Interest removed from ${profile.name}'s profile` 
      : `Interest sent to ${profile.name}`;
    
    toast.success(message, {
      position: "top-center",
      duration: 3000
    });
  };

  // Handle message
  const handleMessage = () => {
    logger.log('Handling message for profile:', profile.id);
    
    if (!isPremium) {
      toast.error("Messaging is only available for premium members", {
        description: "Upgrade your account to access messaging features",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/plans'),
        },
      });
      return;
    }
    
    // Navigate to messages with the profile ID
    navigate(`/messages?partner=${profile.userId || profile.id}`);
    toast.success(`Starting conversation with ${profile.name}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  // Handle video call
  const handleVideoCall = () => {
    logger.log('Handling video call for profile:', profile.id);
    
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
    
    // Use profile.id for routing consistency
    navigate(`/video-call/${profile.id || profile.userId}`);
    toast.success(`Initiating video call with ${profile.name}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  // Handle phone call
  const handlePhone = () => {
    logger.log('Handling phone call for profile:', profile.id);
    
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
    
    // Show notification with heartbeat animation when connecting
    const toastId = toast.loading(`Connecting you with ${profile.name}...`);
    
    // Simulate connection delay
    setTimeout(() => {
      toast.dismiss(toastId);
      // Use profile.id for routing consistency
      navigate(`/call/${profile.id || profile.userId}`);
      toast.success(`Connected with ${profile.name}'s phone number`, {
        position: "top-center",
        duration: 3000,
      });
    }, 1500);
  };

  // Handle calendar (for scheduling)
  const handleCalendar = () => {
    logger.log('Handling calendar/schedule for profile:', profile.id);
    
    if (!isPremium) {
      toast.error("Meeting scheduling is only available for premium members", {
        description: "Upgrade your account to schedule meetings",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/plans'),
        },
      });
      return;
    }
    
    // Navigate to V-Dates/Schedule page
    navigate(`/v-dates`);
    toast.success(`Opening scheduling calendar for ${profile.name}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  return {
    liked,
    isMessaging,
    handleLike,
    handleMessage,
    handleVideoCall,
    handlePhone,
    handleCalendar
  };
};

export default useProfileInteractions;
