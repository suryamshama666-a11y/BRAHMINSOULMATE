
import { useState, useEffect } from 'react';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { transformRealTimeMessage } from './types';

export const useMessages = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useProfile();
  
  const {
    messages: rtMessages,
    conversations,
    loading,
    fetchMessages,
    sendMessage,
    markAsRead,
    fetchConversations,
  } = useRealTimeMessages();

  // Transform real-time messages to frontend format
  const messages = rtMessages.map(transformRealTimeMessage);

  const [selectedConversation, setSelectedConversationState] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mobileViewChat, setMobileViewChat] = useState(false);
  
  // Handle URL parameters for conversation selection
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setSelectedConversationState(conversationId);
      setMobileViewChat(true);
      fetchMessages(conversationId);
    }
  }, [searchParams]);
  
  // Load conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  // Enhanced setSelectedConversation to mark messages as read and update URL
  const setSelectedConversation = (partnerId: string) => {
    setSelectedConversationState(partnerId);
    
    // Update URL without navigation
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('conversation', partnerId);
    window.history.replaceState({}, '', `/messages?${newSearchParams.toString()}`);
    
    // Fetch messages for this conversation
    fetchMessages(partnerId);
    
    // Mark messages as read
    rtMessages
      .filter(msg => msg.sender_id === partnerId && msg.receiver_id === user?.id && !msg.read_at)
      .forEach(msg => markAsRead(msg.id));
  };
  
  // Get the conversation partner's profile
  const conversationPartner = selectedConversation 
    ? conversations.find(c => c.partner_id === selectedConversation)?.partner_profile
    : null;
  
  // Get conversation partners
  const conversationPartners = conversations.map(c => c.partner_id);
  
  // Get messages for the selected conversation
  const conversationMessages = messages;
    
  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    const result = await sendMessage(selectedConversation, newMessage);
    if (result?.data) {
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
    if (!profile?.subscription_type || profile.subscription_type === 'free') {
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
      navigate(`/video-call/${conversationPartner.user_id}`);
      toast.success(`Starting video call with ${conversationPartner.first_name}`);
    }
  };
  
  // Handle phone call
  const handlePhoneCall = () => {
    if (!profile?.subscription_type || profile.subscription_type === 'free') {
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
      navigate(`/call/${conversationPartner.user_id}`);
      toast.success(`Initiating phone call with ${conversationPartner.first_name}`);
    }
  };
  
  // Handle view profile
  const handleViewProfile = () => {
    if (conversationPartner) {
      navigate(`/profile/${conversationPartner.id}`);
      toast.success(`Viewing ${conversationPartner.first_name}'s profile`);
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
    conversationPartner,
    conversationPartners,
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
