
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Profile } from '@/data/profiles';
import { formatMessageTime, Message } from './types';

type MessageListProps = {
  conversationPartners: string[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  setMobileViewChat: (view: boolean) => void;
  messages: Message[];
  getUnreadCount: (partnerId: string) => number;
  profiles: Profile[];
  userId?: string;
};

export const MessageList = ({ 
  conversationPartners,
  selectedConversation,
  setSelectedConversation,
  setMobileViewChat,
  messages,
  getUnreadCount,
  profiles,
  userId
}: MessageListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getFilteredPartners = (filter: 'all' | 'unread') => {
    let filtered = conversationPartners;

    // Filter by unread messages
    if (filter === 'unread') {
      filtered = conversationPartners.filter(partnerId => getUnreadCount(partnerId) > 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(partnerId => {
        const partner = profiles.find(p => p.userId === partnerId);
        return partner?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    return filtered;
  };

  const renderConversationItem = (partnerId: string) => {
    const partner = profiles.find(p => p.userId === partnerId);
    if (!partner) return null;
    
    const unreadCount = getUnreadCount(partnerId);
    const lastMessage = messages
      .filter(m => (m.senderId === userId && m.receiverId === partnerId) || 
                   (m.receiverId === userId && m.senderId === partnerId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      
    return (
      <div 
        key={partnerId} 
        className={`border-b cursor-pointer hover:bg-gradient-to-r hover:from-red-50/50 hover:to-amber-50/50 transition-all duration-200 ${
          selectedConversation === partnerId ? 'bg-gradient-to-r from-red-100 to-amber-100 border-l-4 border-l-red-500' : ''
        }`}
        onClick={() => {
          setSelectedConversation(partnerId);
          setMobileViewChat(true);
        }}
      >
        <div className="p-4 flex items-start">
          <div className="relative">
            <Avatar className="h-12 w-12 mr-3 flex-shrink-0 border-2 border-red-200">
              <AvatarImage src={partner.images[0]} alt={partner.name} />
              <AvatarFallback className="bg-brahmin-primary text-white">
                {partner.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-foreground truncate">{partner.name}</h3>
              <span className="text-xs text-muted-foreground">
                {lastMessage && formatMessageTime(lastMessage.timestamp)}
              </span>
            </div>
            {lastMessage && (
              <p className="text-sm text-gray-600 truncate">
                {lastMessage.senderId === userId ? (
                  <span className="text-blue-600 font-medium">You: </span>
                ) : ''}
                {lastMessage.content}
              </p>
            )}
            {!lastMessage && (
              <p className="text-sm text-gray-400 italic">Start a conversation</p>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="ml-2 bg-gradient-to-r from-red-500 to-amber-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-red-50 to-amber-50">
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search messages..." 
              className="pl-10 rounded-full border-red-200 focus:border-red-400 focus:ring-red-200" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="flex-1 overflow-y-auto -mx-4">
              {getFilteredPartners('all').map(partnerId => renderConversationItem(partnerId))}
              
              {getFilteredPartners('all').length === 0 && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? 'Try a different search term' : 'Start connecting with matches to begin messaging'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <div className="flex-1 overflow-y-auto -mx-4">
              {getFilteredPartners('unread').map(partnerId => renderConversationItem(partnerId))}
              
              {getFilteredPartners('unread').length === 0 && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No unread messages</h3>
                  <p className="text-gray-500 text-sm">All caught up! Check back later for new messages.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
