import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { MessageList } from '@/features/messages/MessageList';
import { EnhancedChatPanel } from '@/features/messages/EnhancedChatPanel';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '@/features/messages/hooks/useMessages';
import { useProfile } from '@/hooks/useProfile';
import { ChatHeader } from '@/features/messages/components/ChatHeader';
import { MessageBubble } from '@/features/messages/components/MessageBubble';
import { ChatInput } from '@/features/messages/components/ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations } from '@/features/messages/hooks/useConversations';
import { ConversationList } from '@/features/messages/components/ConversationList';
import { toast } from 'sonner';
import { EnhancedMessage } from '@/hooks/useEnhancedMessages';
import { Message, Conversation, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';

const Messages: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [mobileViewChat, setMobileViewChat] = useState(false);
  const { profile: currentUserProfile, updateLastActive } = useProfile();
  const {
    conversations,
    isLoading: isLoadingConversations,
    blockUser,
    unblockUser,
    toggleShortlist,
    reportUser,
  } = useConversations();

  // Only fetch messages for the selected conversation
  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    sendMessage,
    uploadFile,
    sendVoiceMessage,
  } = useMessages(selectedConversation);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Memoize the conversation partner to prevent unnecessary re-renders
  const conversationPartner = useMemo(() => 
    conversations.find(conv => conv.partner_id === selectedConversation)?.partner_profile,
    [conversations, selectedConversation]
  );

  // Memoize filtered messages for the current conversation
  const conversationMessages = useMemo(() => 
    messages.filter(msg => 
      (msg.sender_id === selectedConversation && msg.receiver_id === user?.id) ||
      (msg.sender_id === user?.id && msg.receiver_id === selectedConversation)
    ),
    [messages, selectedConversation, user?.id]
  );

  // Update user's last active status
  useEffect(() => {
    if (user) {
      // Update user's last active status
      updateLastActive();

      // Scroll to bottom on new messages
      scrollToBottom();
    }
  }, [user, messages, updateLastActive]);

  // Set up interval for updating last active status
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUserProfile?.user_id) {
        updateLastActive();
      }
    }, 60000); // Update last active status every minute

    return () => clearInterval(interval);
  }, [currentUserProfile?.user_id, updateLastActive]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to top when component mounts or conversation changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedConversation]);

  // Scroll to bottom helper function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Memoized handler functions to prevent unnecessary re-renders
  const handleSelectConversation = useCallback((partnerId: string) => {
    setSelectedConversation(partnerId);
    setMobileViewChat(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setMobileViewChat(false);
    setSelectedConversation(null);
  }, []);

  const handlePhoneCall = useCallback(() => {
    // Integration with voice call system
    if (conversationPartner?.name) {
      toast.info(`Starting phone call with ${conversationPartner.name}`);
    }
  }, [conversationPartner]);

  const handleVideoCall = useCallback(() => {
    // Integration with video call system
    if (conversationPartner?.name) {
      toast.info(`Starting video call with ${conversationPartner.name}`);
    }
  }, [conversationPartner]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!selectedConversation) return;
    
    try {
      await sendMessage({
        content: text,
        message_type: 'text',
        receiver_id: selectedConversation,
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  }, [selectedConversation, sendMessage]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!selectedConversation) return;
    
    try {
      await uploadFile({
        file,
        receiver_id: selectedConversation,
      });
    } catch (error) {
      toast.error('Failed to upload file');
    }
  }, [selectedConversation, uploadFile]);

  const handleVoiceMessage = useCallback(async (blob: Blob) => {
    if (!selectedConversation) return;
    
    try {
      await sendVoiceMessage({
        audio: blob,
        receiver_id: selectedConversation,
      });
    } catch (error) {
      toast.error('Failed to send voice message');
    }
  }, [selectedConversation, sendVoiceMessage]);

  // Transform messages to match EnhancedMessage type - memoized to prevent unnecessary transformations
  const enhancedMessages = useMemo<EnhancedMessage[]>(() => 
    messages.map((message) => ({
      ...message,
      message_type: message.content_type,
      status: 'delivered',
      read_at: undefined,
    })) || [],
    [messages]
  );

  // DEVELOPMENT MODE: Bypass authentication check and provide dummy data
  // Remove this in production
  const DEVELOPMENT_MODE = true; // Set to false in production
  
  if (!user && !DEVELOPMENT_MODE) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Please log in to view your messages</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Dummy data for development testing
  const dummyConversations = DEVELOPMENT_MODE && !user ? [
    {
      id: 'conv1',
      partner_id: 'user1',
      partner_profile: {
        id: 'user1',
        name: 'Priya Sharma',
        profile_image: 'https://i.pravatar.cc/150?img=1',
        last_active: new Date().toISOString(),
        is_online: true,
        user_id: 'user1',
        age: 26,
        location: 'Mumbai',
      },
      last_message: {
        id: 'msg1',
        content: 'Hello, how are you?',
        sender_id: 'user1',
        created_at: new Date().toISOString(),
        read_at: null,
      },
      unread_count: 2,
    },
    {
      id: 'conv2',
      partner_id: 'user2',
      partner_profile: {
        id: 'user2',
        name: 'Rahul Desai',
        profile_image: 'https://i.pravatar.cc/150?img=2',
        last_active: new Date(Date.now() - 3600000).toISOString(),
        is_online: false,
        user_id: 'user2',
        age: 28,
        location: 'Delhi',
      },
      last_message: {
        id: 'msg2',
        content: 'When can we schedule a call?',
        sender_id: 'current-user',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        read_at: new Date(Date.now() - 80000000).toISOString(),
      },
      unread_count: 0,
    },
    {
      id: 'conv3',
      partner_id: 'user3',
      partner_profile: {
        id: 'user3',
        name: 'Ananya Patel',
        profile_image: 'https://i.pravatar.cc/150?img=3',
        last_active: new Date(Date.now() - 7200000).toISOString(),
        is_online: false,
        user_id: 'user3',
        age: 25,
        location: 'Bangalore',
      },
      last_message: {
        id: 'msg3',
        content: 'I liked your profile, would like to know more about your family background.',
        sender_id: 'user3',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        read_at: new Date(Date.now() - 170000000).toISOString(),
      },
      unread_count: 0,
    }
  ] : conversations;
  
  const dummyMessages = DEVELOPMENT_MODE && !user && selectedConversation ? [
    {
      id: 'msg1',
      content: 'Hello, how are you?',
      content_type: 'text',
      sender_id: selectedConversation,
      receiver_id: 'current-user',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg2',
      content: 'I am good, thank you! How about you?',
      content_type: 'text',
      sender_id: 'current-user',
      receiver_id: selectedConversation,
      created_at: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: 'msg3',
      content: 'I saw your profile and I am interested in knowing more about your family background.',
      content_type: 'text',
      sender_id: selectedConversation,
      receiver_id: 'current-user',
      created_at: new Date(Date.now() - 3400000).toISOString(),
    },
    {
      id: 'msg4',
      content: 'Sure, I come from a traditional Brahmin family. My father is a temple priest and my mother is a teacher.',
      content_type: 'text',
      sender_id: 'current-user',
      receiver_id: selectedConversation,
      created_at: new Date(Date.now() - 3300000).toISOString(),
    },
    {
      id: 'msg5',
      content: 'That sounds wonderful! Would you be interested in scheduling a call with our families?',
      content_type: 'text',
      sender_id: selectedConversation,
      receiver_id: 'current-user',
      created_at: new Date(Date.now() - 3200000).toISOString(),
    }
  ] : conversationMessages;

  if (isLoadingConversations && !DEVELOPMENT_MODE) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brahmin-primary" />
      </div>
    );
  }

  // Use dummy data in development mode, real data otherwise
  const displayConversations = DEVELOPMENT_MODE && !user ? dummyConversations : conversations;
  const displayMessages = DEVELOPMENT_MODE && !user ? dummyMessages : conversationMessages;
  
  const handleDummySendMessage = async (text: string) => {
    if (DEVELOPMENT_MODE && !user) {
      toast.success('Message sent (Development Mode)');
      // In a real implementation, you would update the messages state here
      return Promise.resolve(); // Return a resolved Promise
    } else {
      return handleSendMessage(text);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 
            className="text-4xl font-serif font-bold mb-2"
            style={{ color: '#E30613' }}
          >
            Messages
          </h1>
          <p className="text-gray-600">Connect with your matches through secure messaging</p>
        </div>
        
        {/* Main content area with side-by-side layout */}
        <div className="flex flex-col md:flex-row h-[75vh] bg-white rounded-lg shadow overflow-hidden">
          {/* Conversation List - Always visible on desktop, toggleable on mobile */}
          <div className={`${mobileViewChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 border-r border-gray-200 h-full`}>
            <ConversationList
              conversations={displayConversations}
              onSelect={handleSelectConversation}
              selectedConversation={selectedConversation}
            />
          </div>
          
          {/* Chat Panel - Fills remaining space */}
          <div className={`${!selectedConversation && !mobileViewChat ? 'hidden md:flex' : 'flex'} flex-col flex-1 h-full`}>
            {selectedConversation ? (
              isLoadingMessages && !DEVELOPMENT_MODE ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brahmin-primary" />
                </div>
              ) : messagesError && !DEVELOPMENT_MODE ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-red-500">Error loading messages</p>
                </div>
              ) : (
                <>
                  <ChatHeader 
                    receiverId={selectedConversation} 
                    onBack={handleBackToList}
                    onPhoneCall={handlePhoneCall}
                    onVideoCall={handleVideoCall}
                  />
                  <ScrollArea className="flex-1 overflow-y-auto p-4" id="message-container">
                    {displayMessages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">No messages yet.</div>
                    ) : (
                      displayMessages.map((msg) => (
                        <MessageBubble 
                          key={msg.id} 
                          message={msg} 
                          isOwnMessage={msg.sender_id === (user?.id || 'current-user')} 
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                  <div className="mt-auto">
                    <ChatInput
                      onSendMessage={DEVELOPMENT_MODE && !user ? handleDummySendMessage : handleSendMessage}
                      onUploadFile={handleFileUpload}
                      onSendVoiceMessage={handleVoiceMessage}
                      isRecording={isRecording}
                      setIsRecording={setIsRecording}
                      disabled={isLoadingMessages && !DEVELOPMENT_MODE}
                    />
                  </div>
                </>
              )
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-gray-500">Select a conversation to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default React.memo(Messages);
