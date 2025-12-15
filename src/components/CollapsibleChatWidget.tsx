import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, ArrowLeft, Send, Paperclip, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/features/messages/hooks/useConversations';
import { useMessages } from '@/features/messages/hooks/useMessages';
import { MessageBubble } from '@/features/messages/components/MessageBubble';
import { toast } from 'sonner';

interface ConversationItem {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar?: string;
  unread_count: number;
}

export function CollapsibleChatWidget() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const { conversations: rawConversations, isLoading: loadingConversations } = useConversations();
  
  const conversations: ConversationItem[] = rawConversations.map(conv => ({
    id: conv.id,
    partner_id: conv.partner_id || '',
    partner_name: conv.partner_profile?.name || 'Unknown User',
    partner_avatar: conv.partner_profile?.profile_image,
    unread_count: conv.unread_count || 0
  }));

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {selectedConversation ? (
            <ChatView
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
              onClose={() => setIsOpen(false)}
            />
          ) : (
            <ConversationListView
              conversations={conversations}
              isLoading={loadingConversations}
              onSelect={setSelectedConversation}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

function ConversationListView({
  conversations,
  isLoading,
  onSelect,
  onClose,
}: {
  conversations: ConversationItem[];
  isLoading: boolean;
  onSelect: (conv: ConversationItem) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <h3 className="font-semibold text-lg">Messages</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="h-8 w-8 border-4 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3">
              <MessageCircle className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-gray-500 text-sm">No conversations yet</p>
            <Button
              variant="link"
              className="text-orange-500 mt-2"
              onClick={() => (window.location.href = '/discover')}
            >
              Find Matches
            </Button>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className="flex items-center gap-3 p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 transition-colors"
            >
              <div className="relative">
                {conv.partner_avatar ? (
                  <img
                    src={conv.partner_avatar}
                    alt={conv.partner_name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center text-white font-medium">
                    {conv.partner_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 truncate">{conv.partner_name}</h4>
                  <span className="text-xs text-green-500">Online</span>
                </div>
                <p className="text-xs text-gray-500 truncate">Tap to chat</p>
              </div>
              {conv.unread_count > 0 && (
                <span className="h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {conv.unread_count}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

function ChatView({
  conversation,
  onBack,
  onClose,
}: {
  conversation: ConversationItem;
  onBack: () => void;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  const { messages, isLoading, sendMessage, markAsRead, uploadMedia } = useMessages(conversation.id);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && conversation.partner_id) {
      const unreadMessages = messages.filter(
        (msg) => !msg.read_at && msg.sender_id === conversation.partner_id
      );
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg) => msg.id).join(',');
        markAsRead(messageIds);
      }
    }
  }, [messages, conversation.partner_id, markAsRead]);

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !user) return;

    sendMessage({
      content: trimmedMessage,
      receiver_id: conversation.partner_id,
      message_type: 'text',
    });
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    try {
      let messageType: 'image' | 'video' | 'audio' | 'file' = 'file';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('video/')) messageType = 'video';
      else if (file.type.startsWith('audio/')) messageType = 'audio';

      const mediaUrl = await uploadMedia(file);
      sendMessage({
        content: file.name,
        receiver_id: conversation.partner_id,
        message_type: messageType,
        media_url: mediaUrl,
      });
    } catch (err) {
      toast.error('Failed to upload file');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative">
          {conversation.partner_avatar ? (
            <img
              src={conversation.partner_avatar}
              alt={conversation.partner_name}
              className="h-8 w-8 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-white font-medium">
              {conversation.partner_name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-400 border border-white rounded-full"></span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{conversation.partner_name}</h4>
          <p className="text-xs text-white/80">Online</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 bg-gradient-to-b from-orange-50 to-amber-50">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="h-6 w-6 border-3 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
              <Send className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-gray-500 text-sm">Say hello to {conversation.partner_name}!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.sender_id === user.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-2 bg-white">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,application/pdf"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 h-8 w-8"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[36px] max-h-[80px] resize-none text-sm border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`h-8 w-8 rounded-full ${
              message.trim()
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

export default CollapsibleChatWidget;
