import { useState } from 'react';
import { toast } from 'sonner';
import { Profile } from '@/types/profile';
import { UserProfile } from '@/types';

// Create a unified type that works with both Profile and UserProfile structures
type AnyProfileType = Profile | UserProfile | any;

export const useProfileInteractions = (profile: AnyProfileType) => {
  const [liked, setLiked] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);

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
    toast.success(`Opening chat with ${profile.name}`, {
      position: "top-center",
      duration: 2000
    });
    // Logic to open chat window or redirect to messages
  };

  // Handle video call
  const handleVideoCall = () => {
    toast.success(`Requesting video call with ${profile.name}`, {
      position: "top-center", 
      duration: 2000
    });
    // Logic to initiate video call
  };

  // Handle phone call
  const handlePhone = () => {
    toast.success(`Requesting phone details for ${profile.name}`, {
      position: "top-center",
      duration: 2000
    });
    // Logic to request phone number or initiate call
  };

  // Handle calendar (for scheduling)
  const handleCalendar = () => {
    toast.success(`Opening scheduler to plan a date with ${profile.name}`, {
      position: "top-center",
      duration: 2000
    });
    // Logic to open calendar/scheduler
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