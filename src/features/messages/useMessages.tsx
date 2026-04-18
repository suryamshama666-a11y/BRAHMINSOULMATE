
import { useState, useEffect } from 'react';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { transformRealTimeMessage } from './types';
import { messagesService } from '@/services/api';
import { Conversation, UserProfile } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useProfile();
  
  const {
    messages: rtMessages,
    sendMessage,
    markAsRead,
  } = useRealTimeMessages({ userId: user?.id || '' });

  // Transform real-time messages to frontend format
  const messages = rtMessages.map(transformRealTimeMessage);

  const [selectedConversation, setSelectedConversationState] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mobileViewChat, setMobileViewChat] = useState(false);

  // Fetch conversations using React Query for consistency
  const { data: conversations = [], isLoading: loading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await messagesService.getConversations();
      return response.data || [];
    }
  });

  const fetchMessages = async (partnerId: string) => {
    // Standard loading via service
    await messagesService.getConversation(partnerId);
  };
  
  // Handle URL parameters for conversation selection
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setSelectedConversationState(conversationId);
      setMobileViewChat(true);
      fetchMessages(conversationId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  const setSelectedConversation = (partnerId: string) => {
    setSelectedConversationState(partnerId);
    
    // Update URL without navigation
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('conversation', partnerId);
    window.history.replaceState({}, '', `/messages?${newSearchParams.toString()}`);
    
    fetchMessages(partnerId);
    
    // Mark messages as read when conversation is selected
  };
  
  // Get conversation partner from the conversations list
  const conversationPartner = selectedConversation 
    ? conversations.find(c => c.partner_id === selectedConversation)?.partner_profile ?? null
    : null;
  
  const conversationMessages = messages;
    
  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    const result = await sendMessage(selectedConversation, newMessage);
    if (result) {
      setNewMessage('');
      toast.success('Message sent');
    }
  };
  
  // Calculate unread message count for a conversation
  const getUnreadCount = (partnerId: string) => {
    const conversation = conversations.find(c => c.partner_id === partnerId);
    return conversation?.unread_count || 0;
  };
  
  // Handle video call
  const handleVideoCall = () => {
    const typedProfile = profile as UserProfile | null;
    if (!typedProfile?.subscription_type || typedProfile.subscription_type === 'free') {
      toast.error("Video calling is only available for premium members", {
        description: "Upgrade your account to access video calling features",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/plans'),
        },
      });
      return;
    }
    
    if (conversationPartner) {
      const partner = conversationPartner as UserProfile;
      navigate(`/video-call/${partner.user_id}`);
      toast.success(`Starting video call with ${partner.first_name || 'User'}`);
    }
  };
  
  // Handle phone call
  const handlePhoneCall = () => {
    const typedProfile = profile as UserProfile | null;
    if (!typedProfile?.subscription_type || typedProfile.subscription_type === 'free') {
      toast.error("Phone calling is only available for premium members", {
        description: "Upgrade your account to access phone calling features",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/plans'),
        },
      });
      return;
    }
    
    if (conversationPartner) {
      const partner = conversationPartner as UserProfile;
      navigate(`/call/${partner.user_id}`);
      toast.success(`Initiating phone call with ${partner.first_name || 'User'}`);
    }
  };
  
  // Handle view profile
  const handleViewProfile = () => {
    if (conversationPartner) {
      const partner = conversationPartner as UserProfile;
      navigate(`/profile/${partner.id}`);
      toast.success(`Viewing ${partner.first_name || 'User'}'s profile`);
    }
  };

  return {
    messages: conversationMessages,
    setMessages: () => {}, // Not needed with real-time updates
    selectedConversation,
    setSelectedConversation,
    newMessage,
    setNewMessage,
    mobileViewChat,
    setMobileViewChat,
    conversationPartner: conversations.find(c => c.partner_id === selectedConversation)?.partner_profile,
    conversationPartners: conversations.map(c => c.partner_id),
    conversationMessages,
    handleSendMessage,
    getUnreadCount,
    handleVideoCall,
    handlePhoneCall,
    handleViewProfile,
    user,
    profiles: conversations.map(c => c.partner_profile),
    loading,
  };
};
