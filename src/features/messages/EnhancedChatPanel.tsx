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

import { UserProfile } from '@/types/user';
import { MessageReaction } from '@/features/messages/hooks/useMessages';

interface EnhancedChatPanelProps {
  conversationPartner: UserProfile | null;
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
  const { reactions, addReaction, removeReaction } = useMessageReactions();
  const { setTyping, getTypingUsers } = useTypingIndicator();

  const conversationId = conversationPartner?.user_id || '';
  const typingUsers = getTypingUsers(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  useEffect(() => {
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

  const _handleFileUpload = async (file: File, type: 'image' | 'video' | 'file', url: string) => {
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
    } catch {
      toast.error('Failed to send file');
    } finally {
      setIsUploading(false);
    }
  };

  const _handleVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!conversationPartner) return;

    setIsUploading(true);
    try {
      // Upload audio blob to storage
      const _formData = new FormData();
      _formData.append('file', audioBlob, 'voice-message.webm');
      
      // For now, create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      await sendEnhancedMessage({
        receiver_id: conversationPartner.user_id,
        content: `Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
        message_type: 'audio',
        media_url: audioUrl
      });
    } catch {
      toast.error('Failed to send voice message');
    } finally {
      setIsUploading(false);
    }
  };

  const _handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const _handleKeyPress = (e: React.KeyboardEvent) => {
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

  const _handleBlockUser = async () => {
    if (!conversationPartner) return;
    
    const result = await blockUser(conversationPartner.user_id, 'Blocked from chat');
    if (result?.success) {
      onBack();
    }
  };

  const _handleReportUser = async () => {
    if (!conversationPartner) return;
    
    await reportUser(conversationPartner.user_id, 'Inappropriate behavior', 'Reported from chat');
  };

  const _handleToggleShortlist = async () => {
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
        receiverId={conversationPartner.user_id}
        onBack={onBack}
        onPhoneCall={onPhoneCall}
        onVideoCall={onVideoCall}
      />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversationMessages.map((message) => {
            const messageReactions = reactions[message.id] || [];
            const convertedReactions: MessageReaction[] = messageReactions.map(r => ({
              id: r.id,
              message_id: message.id,
              user_id: r.users?.[0] || '',
              emoji: r.emoji,
              created_at: new Date().toISOString()
            }));
            
            return (
              <MessageBubble
                key={message.id}
                message={{
                  id: message.id,
                  content: message.content,
                  created_at: message.created_at ?? null,
                  media_url: message.media_url ?? null,
                  message_type: message.message_type,
                  read: true,
                  receiver_id: message.receiver_id,
                  sender_id: message.sender_id,
                  status: message.status,
                  reactions: convertedReactions
                }}
                isOwnMessage={message.sender_id === userId}
                reactions={convertedReactions}
              />
            );
          })}
          
          <TypingIndicator 
            typingUsers={typingUsers} 
            profiles={[conversationPartner]}
          />
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ChatInput
        onSendMessage={async (text: string) => {
          await handleSendMessage();
        }}
        onUploadFile={async (file: File) => {
          // File upload handling would be implemented here
        }}
        isRecording={false}
        setIsRecording={() => {}}
        disabled={isBlocked}
      />
    </div>
  );
};
