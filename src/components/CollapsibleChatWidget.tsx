import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/features/messages/hooks/useConversations';
import { MessageSquare, X, ChevronDown, Send, Search, User, Users, MoreVertical, Paperclip, Smile, Settings, BellOff, Bell, ArrowLeft, MoreHorizontal, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { usePresence } from '@/hooks/usePresence';

interface Conversation {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar?: string;
  unread_count: number;
}

export function CollapsibleChatWidget() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'online'>('messages');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 ChatWidget Render State:', { 
      hasUser: !!user, 
      loading, 
      bypassEnabled: import.meta.env.VITE_DEV_BYPASS_AUTH === 'true',
      userId: user?.id,
      windowWidth: window.innerWidth,
      isOpen
    });
  }, [user, loading, isOpen]);

  const { conversations, totalUnread, isLoading: convsLoading } = useConversations();
  const { isUserOnline } = usePresence();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevUnreadRef = useRef(0);
  const originalTitleRef = useRef(document.title);
  const flashIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      console.log('💬 ChatWidget initialized for user:', user.id);
    }
  }, [user]);

  // Calculate total unread count if not provided by hook
  const totalUnreadCount = totalUnread ?? (conversations?.reduce((acc: number, conv: any) => acc + (conv.unread_count || 0), 0) || 0);

  // Use bypass mode if enabled, otherwise check for user
  const isBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
  if (!user && !loading && !isBypass) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10000] pointer-events-auto">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

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
                      onClick={() => setActiveTab('online')}
                      className={`font-semibold text-lg pb-1 border-b-2 transition-all ${activeTab === 'online' ? 'border-white opacity-100' : 'border-transparent opacity-70'}`}
                    >
                      Online
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title={isMuted ? "Unmute notifications" : "Mute notifications"}
                    >
                      {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
                    </button>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  {activeTab === 'messages' ? (
                    <div className="h-full flex flex-col">
                      <div className="p-3 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          />
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-1">
                        {convsLoading ? (
                          <div className="p-8 text-center text-gray-500 text-sm">Loading conversations...</div>
                        ) : conversations.length === 0 ? (
                          <div className="p-12 text-center text-gray-500">
                            <MessageSquare className="mx-auto mb-3 opacity-20" size={48} />
                            <p className="text-sm font-medium">No messages yet</p>
                            <p className="text-xs mt-1">Start matching to begin chatting!</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {conversations.map((conv) => (
                              <button
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors group"
                              >
                                <div className="relative shrink-0">
                                  <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-orange-200 transition-all">
                                    <AvatarImage src={conv.partner_avatar} />
                                    <AvatarFallback><User /></AvatarFallback>
                                  </Avatar>
                                  {isUserOnline(conv.partner_id) && (
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-semibold text-gray-900 truncate">{conv.partner_name}</span>
                                    {conv.unread_count > 0 && (
                                      <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {conv.unread_count}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 truncate pr-4">Click to view messages</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      <div className="p-12 text-center text-gray-500">
                        <Users className="mx-auto mb-3 opacity-20" size={48} />
                        <p className="text-sm font-medium">Online matches</p>
                        <p className="text-xs mt-1">Find people online to chat with right now!</p>
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </>
            )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 ring-4 ring-orange-100"
        >
          <MessageSquare className="text-white w-7 h-7" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-orange-600 border-2 border-white text-white text-[10px] font-bold items-center justify-center shadow-lg">
                {totalUnreadCount}
              </span>
            </span>
          )}
          {/* Tooltip */}
          <div className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            {totalUnreadCount > 0 ? `${totalUnreadCount} new messages` : 'Chat with matches'}
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-8 border-transparent border-l-gray-900" />
          </div>
        </button>
      )}
    </div>
  );
}

// Sub-components
function ChatView({ 
  conversation, 
  isOnline, 
  isMuted, 
  onToggleMute, 
  onBack, 
  onClose 
}: { 
  conversation: Conversation; 
  isOnline: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversation.partner_id}),and(sender_id.eq.${conversation.partner_id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.partner_id, user]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const msg = newMessage;
      setNewMessage('');
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: conversation.partner_id,
          content: msg,
          read: false
        });

      if (error) throw error;
      
      // Optimistically add message
      const optimMsg = {
        id: Math.random().toString(),
        sender_id: user.id,
        receiver_id: conversation.partner_id,
        content: msg,
        created_at: new Date().toISOString(),
        read: false
      };
      setMessages(prev => [...prev, optimMsg]);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="relative">
            <Avatar className="w-8 h-8 border border-white/20">
              <AvatarImage src={conversation.partner_avatar} />
              <AvatarFallback><User size={14} /></AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">{conversation.partner_name}</span>
            <span className="text-[10px] opacity-80">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onToggleMute}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            {isMuted ? <BellOff size={16} /> : <Bell size={16} />}
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Circle className="animate-spin text-orange-500" size={20} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user && msg.sender_id === user.id;
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                    isMe 
                      ? 'bg-orange-500 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                    {format(new Date(msg.created_at), 'HH:mm')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t flex items-center gap-2 shrink-0"
      >
        <button 
          type="button"
          className="p-2 text-gray-400 hover:text-orange-500 rounded-full hover:bg-orange-50 transition-all"
        >
          <Smile size={20} />
        </button>
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
