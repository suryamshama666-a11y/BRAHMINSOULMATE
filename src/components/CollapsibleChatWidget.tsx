import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, ArrowLeft, Send, Paperclip, Users, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, Contact } from '@/features/messages/hooks/useConversations';
import { useMessages } from '@/features/messages/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { MessageBubble } from '@/features/messages/components/MessageBubble';
import { toast } from 'sonner';

// Notification sound (Short Ding)
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

interface ConversationItem {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar?: string;
  unread_count: number;
}

export function CollapsibleChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'contacts'>('messages');
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const { 
    conversations: rawConversations, 
    contacts, 
    isLoading: loadingConversations,
    isLoadingContacts 
  } = useConversations();
  const { isUserOnline, onlineUsers } = usePresence();
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
  }, []);

  const prevUnreadRef = useRef(0);

  // Play sound on new unread message
  useEffect(() => {
    if (totalUnread > prevUnreadRef.current && !isMuted && isOpen) {
      audioRef.current?.play().catch(e => console.log('Audio play failed:', e));
    }
    prevUnreadRef.current = totalUnread;
  }, [totalUnread, isMuted, isOpen]);
  
  const conversations: ConversationItem[] = rawConversations.map(conv => ({
    id: conv.id,
    partner_id: conv.partner_id || '',
    partner_name: conv.partner_profile?.name || 'Unknown User',
    partner_avatar: conv.partner_profile?.profile_image,
    unread_count: conv.unread_count || 0
  }));

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const onlineCount = contacts.filter(c => isUserOnline(c.id)).length;

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {selectedConversation ? (
              <ChatView
                conversation={selectedConversation}
                isOnline={isUserOnline(selectedConversation.partner_id)}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
                onBack={() => setSelectedConversation(null)}
                onClose={() => setIsOpen(false)}
              />
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white shrink-0">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className={`font-semibold text-lg pb-1 border-b-2 transition-all ${activeTab === 'messages' ? 'border-white opacity-100' : 'border-transparent opacity-70'}`}
                    >
                      Messages
                    </button>
                    <button 
                      onClick={() => setActiveTab('contacts')}
                      className={`font-semibold text-lg pb-1 border-b-2 transition-all ${activeTab === 'contacts' ? 'border-white opacity-100' : 'border-transparent opacity-70'}`}
                    >
                      Contacts
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsMuted(!isMuted)} 
                      className="text-white hover:bg-white/20 h-8 w-8"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === 'messages' ? (
                  <ConversationListView
                    conversations={conversations}
                    isLoading={loadingConversations}
                    isUserOnline={isUserOnline}
                    onSelect={setSelectedConversation}
                  />
                ) : (
                  <ContactsListView
                    contacts={contacts}
                    isLoading={isLoadingContacts}
                    isUserOnline={isUserOnline}
                    onSelectContact={(contact) => {
                      setSelectedConversation({
                        id: `conv_${user.id}_${contact.id}`,
                        partner_id: contact.id,
                        partner_name: contact.name,
                        partner_avatar: contact.profile_image,
                        unread_count: 0
                      });
                    }}
                  />
                )}
              </div>
            </>
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
          {onlineCount > 0 && (
            <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </button>
      )}
    </div>
  );
}

function ConversationListView({
  conversations,
  isLoading,
  isUserOnline,
  onSelect,
}: {
  conversations: ConversationItem[];
  isLoading: boolean;
  isUserOnline: (userId: string) => boolean;
  onSelect: (conv: ConversationItem) => void;
}) {
  return (
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
        conversations.map((conv) => {
          const online = isUserOnline(conv.partner_id);
          return (
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
                {online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 truncate">{conv.partner_name}</h4>
                  {online && <span className="text-[10px] text-green-500 font-medium">Online</span>}
                </div>
                <p className="text-xs text-gray-500 truncate">Tap to chat</p>
              </div>
              {conv.unread_count > 0 && (
                <span className="h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {conv.unread_count}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function ContactsListView({
  contacts,
  isLoading,
  isUserOnline,
  onSelectContact,
}: {
  contacts: Contact[];
  isLoading: boolean;
  isUserOnline: (userId: string) => boolean;
  onSelectContact: (contact: Contact) => void;
}) {
  // Sort: Online first, then alphabetical
  const sortedContacts = [...contacts].sort((a, b) => {
    const aOnline = isUserOnline(a.id);
    const bOnline = isUserOnline(b.id);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="h-8 w-8 border-4 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3">
            <Users className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-gray-500 text-sm font-medium">No active contacts</p>
          <p className="text-gray-400 text-xs mt-1">Accept interests to start chatting!</p>
        </div>
      ) : (
        sortedContacts.map((contact) => {
          const online = isUserOnline(contact.id);
          return (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className="flex items-center gap-3 p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 transition-colors"
            >
              <div className="relative">
                {contact.profile_image ? (
                  <img
                    src={contact.profile_image}
                    alt={contact.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-medium">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
                <div className="flex items-center gap-1">
                  <div className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[10px] text-gray-500">{online ? 'Available now' : 'Offline'}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[10px] border-orange-200 text-orange-600 hover:bg-orange-50">
                Chat
              </Button>
            </div>
          );
        })
      )}
    </div>
  );
}

function ChatView({
  conversation,
  isOnline,
  isMuted,
  onToggleMute,
  onBack,
  onClose,
}: {
  conversation: ConversationItem;
  isOnline: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const { setTyping, getTypingUsers } = useTypingIndicator();
  
  const typingUsers = getTypingUsers(conversation.id);
  const isPartnerTyping = typingUsers.some(uid => uid === conversation.partner_id);

  const { messages, isLoading, sendMessage, markAsRead, uploadMedia } = useMessages(conversation.id);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isPartnerTyping]);

  // Handle typing indicator
  useEffect(() => {
    if (!message.trim()) {
      setTyping(conversation.id, false);
      return;
    }

    setTyping(conversation.id, true);
    const timeout = setTimeout(() => setTyping(conversation.id, false), 3000);
    return () => clearTimeout(timeout);
  }, [message, conversation.id]);

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
    setTyping(conversation.id, false);
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
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20 h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
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
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-400 border border-white rounded-full"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{conversation.partner_name}</h4>
          <p className="text-[10px] text-white/80">
            {isPartnerTyping ? 'typing...' : isOnline ? 'Active now' : 'Offline'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleMute} 
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
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
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.sender_id === user.id} />
            ))}
            {isPartnerTyping && (
              <div className="flex items-center gap-1 text-gray-400 text-[10px] ml-2 mt-1 italic animate-pulse">
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                <span className="ml-1">{conversation.partner_name} is typing...</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-2 bg-white shrink-0">
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
            className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 h-8 w-8 shrink-0"
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
            className={`h-8 w-8 rounded-full shrink-0 ${
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
