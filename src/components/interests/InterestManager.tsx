import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, X, Check, Clock, Send, Search, Sparkles, MessageSquare, Trash2 } from 'lucide-react';
import { useInterests } from '@/hooks/useInterests';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

// Mock user data for display purposes
const mockUsers = {
  'user-2': { first_name: 'Priya', last_name: 'Sharma', profile_picture_url: 'https://randomuser.me/api/portraits/women/1.jpg' },
  'user-3': { first_name: 'Raj', last_name: 'Patel', profile_picture_url: 'https://randomuser.me/api/portraits/men/1.jpg' },
  'user-4': { first_name: 'Anita', last_name: 'Kumar', profile_picture_url: 'https://randomuser.me/api/portraits/women/2.jpg' },
  'user-5': { first_name: 'Vikram', last_name: 'Singh', profile_picture_url: 'https://randomuser.me/api/portraits/men/2.jpg' }
};

export const InterestManager = () => {
  const navigate = useNavigate();
  const {
    sentInterests,
    receivedInterests,
    mutualInterests,
    respondToInterest,
    removeInterest,
    loading
  } = useInterests();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('received');

  const handleRespondToInterest = async (interestId: string, status: 'accepted' | 'rejected') => {
    try {
      const result = await respondToInterest(interestId, status);
      if (result.success) {
        toast.success(`Interest ${status} successfully!`);
        if (status === 'accepted') {
          // Celebrate mutual interest!
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ef4444', '#f59e0b', '#dc2626']
          });
        }
      }
    } catch {
      toast.error(`Failed to ${status} interest`);
    }
  };

  const handleDeleteInterest = async (interestId: string) => {
    if (confirm('Are you sure you want to delete this interest request?')) {
      try {
        await removeInterest(interestId);
        toast.success('Interest removed');
      } catch {
        toast.error('Failed to remove interest');
      }
    }
  };

  const getUserInfo = useCallback((userId: string) => {
    return mockUsers[userId as keyof typeof mockUsers] || { first_name: 'User', last_name: '', profile_picture_url: null };
  }, []);

  const filterInterests = useCallback((interests: any[], type: 'sent' | 'received' | 'mutual') => {
    if (!searchTerm) return interests;
    const term = searchTerm.toLowerCase();
    return interests.filter(i => {
      const userInfo = getUserInfo(type === 'sent' ? i.receiver_id : i.sender_id);
      return (
        userInfo.first_name?.toLowerCase().includes(term) ||
        userInfo.last_name?.toLowerCase().includes(term) ||
        i.message?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, getUserInfo]);

  const filteredReceived = useMemo(() => filterInterests(receivedInterests, 'received'), [receivedInterests, filterInterests]);
  const filteredSent = useMemo(() => filterInterests(sentInterests, 'sent'), [sentInterests, filterInterests]);
  const filteredMutual = useMemo(() => filterInterests(mutualInterests, 'mutual'), [mutualInterests, filterInterests]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const renderInterestCard = (interest: any, type: 'sent' | 'received' | 'mutual') => {
    const partnerId = type === 'sent' ? interest.receiver_id : interest.sender_id;
    const partnerInfo = getUserInfo(partnerId);
    
    return (
      <motion.div
        key={interest.id}
        variants={itemVariants}
        layout
        className="group"
      >
        <Card className="overflow-hidden border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-lg bg-white/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md transition-transform group-hover:scale-105">
                    <AvatarImage src={partnerInfo.profile_picture_url || ''} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 text-xl">
                      {partnerInfo.first_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {type === 'mutual' && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg">
                      <Sparkles className="h-3 w-3" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-gray-900 truncate">
                    {partnerInfo.first_name} {partnerInfo.last_name}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-1 italic">"{interest.message}"</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      {new Date(interest.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                {type === 'received' && interest.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleRespondToInterest(interest.id, 'accepted')}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespondToInterest(interest.id, 'rejected')}
                      disabled={loading}
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-full px-4"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </>
                )}
                
                {type === 'sent' && interest.status === 'pending' && (
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}

                {interest.status === 'accepted' && type !== 'mutual' && (
                  <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                    <Check className="h-3 w-3 mr-1" />
                    Accepted
                  </Badge>
                )}

                {interest.status === 'rejected' && (
                  <Badge variant="outline" className="text-gray-400 border-gray-200 px-3 py-1">
                    Declined
                  </Badge>
                )}

                {type === 'mutual' && (
                  <Button
                    size="sm"
                    onClick={() => navigate(`/messages?user=${partnerId}`)}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-full px-6 shadow-md shadow-red-200 group-hover:scale-105 transition-transform"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat Now
                  </Button>
                )}

                {type === 'sent' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteInterest(interest.id)}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-100">
              <Heart className="h-6 w-6" />
            </div>
            Interest Management
          </h2>
          <p className="text-gray-500 mt-1 pl-1">Keep track of your connections and interests</p>
        </div>
        
        <div className="relative w-full max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <Input
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white border-gray-200 focus-visible:ring-red-500 rounded-xl shadow-sm"
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden rounded-3xl">
        <Tabs defaultValue="received" onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 p-1.5 rounded-2xl h-14">
              <TabsTrigger 
                value="received" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all"
              >
                Received
                <Badge className="ml-2 bg-gray-200 text-gray-700 group-data-[state=active]:bg-red-100 group-data-[state=active]:text-red-700">
                   {receivedInterests.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="sent"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all"
              >
                Sent
                <Badge className="ml-2 bg-gray-200 text-gray-700 group-data-[state=active]:bg-red-100 group-data-[state=active]:text-red-700">
                  {sentInterests.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="mutual"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all"
              >
                Mutual
                <Badge className="ml-2 bg-red-600 text-white">
                  {mutualInterests.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="received" className="mt-0 outline-none">
                  {filteredReceived.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Heart className="h-10 w-10 text-gray-200" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">No interests received</h3>
                      <p className="text-gray-500 max-w-xs mt-1">When someone likes your profile, they'll appear here.</p>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="space-y-4"
                    >
                      {filteredReceived.map(interest => renderInterestCard(interest, 'received'))}
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="sent" className="mt-0 outline-none">
                  {filteredSent.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Send className="h-10 w-10 text-gray-200" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">No interests sent</h3>
                      <p className="text-gray-500 max-w-xs mt-1">Start exploring profiles and send interests to connect!</p>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/discovery')}
                        className="mt-6 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        Discover Profiles
                      </Button>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="space-y-4"
                    >
                      {filteredSent.map(interest => renderInterestCard(interest, 'sent'))}
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="mutual" className="mt-0 outline-none">
                  {filteredMutual.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="h-10 w-10 text-red-200" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">No mutual interests yet</h3>
                      <p className="text-gray-500 max-w-xs mt-1">When both you and another member accept each other's interest, it becomes mutual!</p>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="space-y-4"
                    >
                      {filteredMutual.map(interest => renderInterestCard(interest, 'mutual'))}
                    </motion.div>
                  )}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </Card>
      
      <style>{`
        [data-state=active] .badge-count {
          background-color: #fee2e2;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};
