import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, ArrowLeft, Send, Paperclip, Users, Volume2, VolumeX, Search, Smile, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const originalTitleRef = useRef(document.title);
  const flashIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play sound and flash title on new unread message
  useEffect(() => {
    if (totalUnread > prevUnreadRef.current) {
      // Sound
      if (!isMuted && isOpen) {
        audioRef.current?.play().catch(e => console.log('Audio play failed:', e));
      }

      // Title Flash if not focused
      if (document.hidden || !isOpen) {
        if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
        
        let isOriginal = false;
        flashIntervalRef.current = setInterval(() => {
          document.title = isOriginal 
            ? originalTitleRef.current 
            : `(${totalUnread}) New Message!`;
          isOriginal = !isOriginal;
        }, 1000);
      }
    }
    prevUnreadRef.current = totalUnread;
  }, [totalUnread, isMuted, isOpen]);

  // Clear flash when focused or widget opened
  useEffect(() => {
    const handleFocus = () => {
      if (flashIntervalRef.current) {
        clearInterval(flashIntervalRef.current);
        flashIntervalRef.current = null;
        document.title = originalTitleRef.current;
      }
    };

    window.addEventListener('focus', handleFocus);
    if (isOpen) handleFocus();

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
    };
  }, [isOpen]);
  
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
  const [isSearching, setIsSearching] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { setTyping, getTypingUsers } = useTypingIndicator();
  
  const typingUsers = getTypingUsers(conversation.id);
  const isPartnerTyping = typingUsers.some(uid => uid === conversation.partner_id);

  const { 
    messages, 
    isLoading, 
    sendMessage, 
    markAsRead, 
    uploadMedia,
    addReaction,
    removeReaction,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useMessages(conversation.id);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      // Store current height to maintain scroll position after loading
      const currentScrollHeight = e.currentTarget.scrollHeight;
      fetchNextPage().then(() => {
        if (containerRef.current) {
          const newScrollHeight = containerRef.current.scrollHeight;
          containerRef.current.scrollTop = newScrollHeight - currentScrollHeight;
        }
      });
    }
  };

  const filteredMessages = searchQuery.trim() 
    ? messages.filter(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const COMMON_EMOJIS = ['😊', '😂', '❤️', '👍', '🙏', '🔥', '✨', '🙌', '😍', '😎'];

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

  const mediaMessages = messages.filter(msg => msg.message_type === 'image' || msg.message_type === 'video');

  return (
    <>
      {showMediaGallery && (
        <div className="absolute inset-0 z-20 bg-white flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setShowMediaGallery(false)} className="text-white hover:bg-white/20 h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h4 className="font-medium text-sm flex-1">Media Gallery</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {mediaMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Image className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No media shared yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {mediaMessages.map((msg) => (
                  <div key={msg.id} className="aspect-square relative group cursor-pointer overflow-hidden rounded-md bg-gray-100">
                    {msg.message_type === 'image' ? (
                      <img 
                        src={msg.media_url} 
                        alt="Shared" 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        onClick={() => {
                          // Trigger lightbox by finding the message in the main view or just provide a preview here
                          // For simplicity, we'll just show it
                        }}
                      />
                    ) : (
                      <video 
                        src={msg.media_url} 
                        className="h-full w-full object-cover"
                      />
                    )}
                    {msg.message_type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="h-6 w-6 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-orange-500 border-b-[4px] border-b-transparent ml-0.5"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
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
                onClick={() => setShowMediaGallery(true)} 
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearching(!isSearching)} 
                className={`text-white hover:bg-white/20 h-8 w-8 ${isSearching ? 'bg-white/20' : ''}`}
              >
                <Search className="h-4 w-4" />
              </Button>
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
        {isSearching && (
          <div className="px-3 py-2 bg-orange-50 border-b border-orange-100 animate-in slide-in-from-top duration-200">
            <div className="relative">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs bg-white border-orange-200 focus:border-orange-500 pr-8"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 bg-gradient-to-b from-orange-50 to-amber-50"
      >
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="h-6 w-6 border-3 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <div className="h-4 w-4 border-2 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                  {searchQuery ? <Search className="h-6 w-6 text-orange-500" /> : <Send className="h-6 w-6 text-orange-500" />}
                </div>
                <p className="text-gray-500 text-sm">
                  {searchQuery ? `No messages found for "${searchQuery}"` : `Say hello to ${conversation.partner_name}!`}
                </p>
              </div>
            ) : (
              <>
                {filteredMessages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    isOwnMessage={msg.sender_id === user.id} 
                    searchQuery={searchQuery}
                    onAddReaction={(emoji) => addReaction({ messageId: msg.id, emoji })}
                    onRemoveReaction={(emoji) => removeReaction({ messageId: msg.id, emoji })}
                    currentUserId={user.id}
                  />
                ))}
                {!searchQuery && isPartnerTyping && (
                  <div className="flex items-center gap-1 text-gray-400 text-[10px] ml-2 mt-1 italic animate-pulse">
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    <span className="ml-1">{conversation.partner_name} is typing...</span>
                  </div>
                )}
              </>
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
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 h-8 w-8"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 h-8 w-8"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-auto p-2">
                <div className="grid grid-cols-5 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setMessage(prev => prev + emoji)}
                      className="text-xl p-1 hover:bg-orange-50 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[36px] max-h-[80px] resize-none text-sm border-gray-200 focus:border-orange-400 focus:ring-orange-400 py-2"
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
