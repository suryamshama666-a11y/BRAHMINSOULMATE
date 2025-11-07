import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedMessage } from '@/hooks/useEnhancedMessages';
import { TypingIndicator } from '@/components/messaging/TypingIndicator';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useProfilePrivacy } from '@/hooks/useProfilePrivacy';
import { useShortlist } from '@/hooks/useShortlist';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { toast } from 'sonner';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';

interface EnhancedChatPanelProps {
  conversationPartner: any;
  conversationMessages: EnhancedMessage[];
  userId?: string;
  onBack: () => void;
  onPhoneCall: () => void;
  onVideoCall: () => void;
}

export const EnhancedChatPanel: React.FC<EnhancedChatPanelProps> = ({
  conversationPartner,
  conversationMessages,
  userId,
  onBack,
  onPhoneCall,
  onVideoCall,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { sendEnhancedMessage, markAsRead } = useEnhancedMessages();
  const { blockUser, reportUser, isUserBlocked } = useProfilePrivacy();
  const { addToShortlist, removeFromShortlist, isInShortlist } = useShortlist();
  const { reactions, loadConversationReactions } = useMessageReactions();
  const { setTyping, getTypingUsers } = useTypingIndicator();

  const conversationId = conversationPartner?.user_id || '';
  const typingUsers = getTypingUsers(conversationId);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    // Load reactions for all messages
    const messageIds = conversationMessages.map(msg => msg.id);
    if (messageIds.length > 0) {
      loadConversationReactions(messageIds);
    }
  }, [conversationMessages, loadConversationReactions]);

  useEffect(() => {
    // Mark messages as read when viewing conversation
    conversationMessages
      .filter(msg => msg.receiver_id === userId && msg.status !== 'read')
      .forEach(msg => markAsRead(msg.id));
  }, [conversationMessages, userId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationPartner) return;

    const result = await sendEnhancedMessage({
      receiver_id: conversationPartner.user_id,
      content: newMessage.trim()
    });
    
    if (result?.success) {
      setNewMessage('');
      setTyping(conversationId, false);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video' | 'file', url: string) => {
    if (!conversationPartner) return;

    setIsUploading(true);
    try {
      const messageType = type === 'image' ? 'image' : type === 'video' ? 'video' : 'file';
      const content = type === 'file' ? file.name : 'Shared a file';

      await sendEnhancedMessage({
        receiver_id: conversationPartner.user_id,
        content,
        message_type: messageType,
        media_url: url,
        file_name: file.name,
        file_size: file.size
      });
    } catch (error) {
      toast.error('Failed to send file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!conversationPartner) return;

    setIsUploading(true);
    try {
      // Upload audio blob to storage
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice-message.webm');
      
      // For now, create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      await sendEnhancedMessage({
        receiver_id: conversationPartner.user_id,
        content: `Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
        message_type: 'audio',
        media_url: audioUrl
      });
    } catch (error) {
      toast.error('Failed to send voice message');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (e.target.value.trim()) {
      setTyping(conversationId, true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(conversationId, false);
      }, 3000);
    } else {
      setTyping(conversationId, false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTyping(conversationId, false);
    };
  }, [conversationId, setTyping]);

  const handleBlockUser = async () => {
    if (!conversationPartner) return;
    
    const result = await blockUser(conversationPartner.user_id, 'Blocked from chat');
    if (result?.success) {
      onBack();
    }
  };

  const handleReportUser = async () => {
    if (!conversationPartner) return;
    
    await reportUser(conversationPartner.user_id, 'Inappropriate behavior', 'Reported from chat');
  };

  const handleToggleShortlist = async () => {
    if (!conversationPartner) return;
    
    if (isInShortlist(conversationPartner.user_id)) {
      await removeFromShortlist(conversationPartner.user_id);
    } else {
      await addToShortlist(conversationPartner.user_id);
    }
  };

  if (!conversationPartner) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a conversation to start messaging
      </div>
    );
  }

  const isBlocked = isUserBlocked(conversationPartner.user_id);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        conversationPartner={conversationPartner}
        onBack={onBack}
        onPhoneCall={onPhoneCall}
        onVideoCall={onVideoCall}
        onToggleShortlist={() => {
          if (isInShortlist(conversationPartner.user_id)) {
            removeFromShortlist(conversationPartner.user_id);
          } else {
            addToShortlist(conversationPartner.user_id);
          }
        }}
        onReportUser={async () => {
          await reportUser(conversationPartner.user_id, 'Inappropriate behavior', 'Reported from chat');
        }}
        onBlockUser={async () => {
          const result = await blockUser(conversationPartner.user_id, 'Blocked from chat');
          if (result?.success) {
            onBack();
          }
        }}
        isInShortlist={isInShortlist(conversationPartner.user_id)}
      />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversationMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender_id === userId}
              reactions={reactions.get(message.id) || []}
            />
          ))}
          
          <TypingIndicator 
            typingUsers={typingUsers} 
            profiles={[conversationPartner]}
          />
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ChatInput
        newMessage={newMessage}
        onMessageChange={(e) => {
          setNewMessage(e.target.value);
          
          if (e.target.value.trim()) {
            setTyping(conversationId, true);
            
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
              setTyping(conversationId, false);
            }, 3000);
          } else {
            setTyping(conversationId, false);
          }
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        onSendMessage={handleSendMessage}
        onFileUpload={async (file, type, url) => {
          setIsUploading(true);
          try {
            const messageType = type === 'image' ? 'image' : type === 'video' ? 'video' : 'file';
            const content = type === 'file' ? file.name : 'Shared a file';

            await sendEnhancedMessage({
              receiver_id: conversationPartner.user_id,
              content,
              message_type: messageType,
              media_url: url,
              file_name: file.name,
              file_size: file.size
            });
          } catch (error) {
            toast.error('Failed to send file');
          } finally {
            setIsUploading(false);
          }
        }}
        onVoiceMessage={async (audioBlob, duration) => {
          setIsUploading(true);
          try {
            const audioUrl = URL.createObjectURL(audioBlob);
            
            await sendEnhancedMessage({
              receiver_id: conversationPartner.user_id,
              content: `Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
              message_type: 'audio',
              media_url: audioUrl
            });
          } catch (error) {
            toast.error('Failed to send voice message');
          } finally {
            setIsUploading(false);
          }
        }}
        isUploading={isUploading}
        isBlocked={isBlocked}
      />
    </div>
  );
};
