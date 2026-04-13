import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle } from 'lucide-react';
import { ChatBox } from '@/features/messages/components/ChatBox';
import { useAuth } from '@/hooks/useAuth';
import { messagesService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Skeleton, MessageItemSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUser = searchParams.get('user');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      return await messagesService.getConversations();
    },
    enabled: !!user?.id,
    refetchInterval: 5000 
  });

  // Filter conversations based on search
  const filteredConversations = useMemo(() => 
    conversations.filter(conv =>
      conv.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [conversations, searchQuery]
  );

  const selectedConversation = useMemo(() => 
    conversations.find(c => c.user_id === selectedUser),
    [conversations, selectedUser]
  );

  const handleSelectUser = (userId: string) => {
    setSearchParams({ user: userId });
  };

  const getConversationId = (partnerId: string) => {
    if (!user?.id) return '';
    const ids = [user.id, partnerId].sort();
    return `conv_${ids[0]}_${ids[1]}`;
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
            <Card className="lg:col-span-1 h-full">
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-10 w-full mb-4" />
                {[...Array(6)].map((_, i) => (
                  <MessageItemSkeleton key={i} />
                ))}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2 h-full hidden lg:flex flex-col">
              <CardContent className="p-0 flex-1 flex items-center justify-center">
                <div className="space-y-4 text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full animate-pulse mx-auto" />
                  <Skeleton className="h-6 w-48 mx-auto" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/50 via-white to-amber-50/50 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-200">
                <MessageCircle className="h-6 w-6" />
              </span>
              Conversations
            </h1>
            <p className="text-gray-500 mt-1">Manage your chats and connections</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white px-3 py-1 font-medium border-red-100 text-red-600">
              {conversations.reduce((acc, curr) => acc + curr.unread_count, 0)} Unread
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
          {/* Sidebar */}
          <Card className={`${selectedUser ? 'hidden lg:flex' : 'flex'} flex-col lg:col-span-1 shadow-xl border-red-50 overflow-hidden`}>
            <div className="p-4 bg-white border-b border-gray-100">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-none focus-visible:ring-red-500 rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="h-full flex items-center justify-center p-4">
                  <EmptyState 
                    variant="no-messages" 
                    title={searchQuery ? "No matches found" : "No messages yet"}
                    description={searchQuery ? "Try a different search term" : "Start connecting to see your chats here."}
                    className="py-8"
                  />
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.user_id}
                      onClick={() => handleSelectUser(conversation.user_id)}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 hover:bg-red-50/30 ${
                        selectedUser === conversation.user_id
                          ? 'bg-red-50 border-r-4 border-red-600'
                          : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                          <AvatarImage src={conversation.profile_picture} />
                          <AvatarFallback className="bg-red-100 text-red-700">
                            {conversation.full_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-bold truncate ${selectedUser === conversation.user_id ? 'text-red-900' : 'text-gray-900'}`}>
                            {conversation.full_name}
                          </h4>
                          {conversation.last_message_at && (
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter shrink-0">
                              {new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                            {conversation.last_message || 'Start a conversation'}
                          </p>
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-red-600 hover:bg-red-700 text-white h-5 w-5 rounded-full flex items-center justify-center p-0 text-[10px]">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Main Chat Area */}
          <div className={`${!selectedUser ? 'hidden lg:block' : 'block'} lg:col-span-2 h-full relative`}>
            {selectedUser && selectedConversation ? (
              <ChatBox
                conversationId={getConversationId(selectedUser)}
                partnerId={selectedUser}
                partnerName={selectedConversation.full_name}
                partnerAvatar={selectedConversation.profile_picture}
                onBack={() => setSearchParams({})}
              />
            ) : (
              <Card className="h-full flex flex-col items-center justify-center border-dashed border-2 border-gray-200 bg-gray-50/30 shadow-none">
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-6 animate-bounce-slow">
                    <MessageCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Select a Soulmate</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Choose one of your connections from the left sidebar to begin your conversation.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #eee;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ddd;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Messages;
