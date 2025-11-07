
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, X, Check, Clock, Send } from 'lucide-react';
import { useInterests } from '@/hooks/useInterests';
import { toast } from 'sonner';

export const InterestManager = () => {
  const {
    sentInterests,
    receivedInterests,
    mutualInterests,
    sendInterest,
    respondToInterest,
    loading
  } = useInterests();

  const handleSendInterest = async (profileId: string) => {
    try {
      await sendInterest(profileId, 'I would like to connect with you.');
      toast.success('Interest sent successfully!');
    } catch (error) {
      toast.error('Failed to send interest');
    }
  };

  const handleRespondToInterest = async (interestId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToInterest(interestId, status);
      toast.success(`Interest ${status} successfully!`);
    } catch (error) {
      toast.error(`Failed to ${status} interest`);
    }
  };

  // Mock user data for display purposes
  const mockUsers = {
    'user-2': { first_name: 'Priya', last_name: 'Sharma', profile_picture_url: null },
    'user-3': { first_name: 'Raj', last_name: 'Patel', profile_picture_url: null },
    'user-4': { first_name: 'Anita', last_name: 'Kumar', profile_picture_url: null },
    'user-5': { first_name: 'Vikram', last_name: 'Singh', profile_picture_url: null }
  };

  const getUserInfo = (userId: string) => {
    return mockUsers[userId as keyof typeof mockUsers] || { first_name: 'User', last_name: '', profile_picture_url: null };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Interest Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="received">
                Received ({receivedInterests.length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({sentInterests.length})
              </TabsTrigger>
              <TabsTrigger value="mutual">
                Mutual ({mutualInterests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-4">
              {receivedInterests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No interests received yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedInterests.map((interest) => {
                    const senderInfo = getUserInfo(interest.sender_id);
                    return (
                      <Card key={interest.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={senderInfo.profile_picture_url || ''} />
                                <AvatarFallback>
                                  {senderInfo.first_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">
                                  {senderInfo.first_name} {senderInfo.last_name}
                                </h4>
                                <p className="text-sm text-gray-600">{interest.message}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(interest.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {interest.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleRespondToInterest(interest.id, 'accepted')}
                                  disabled={loading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRespondToInterest(interest.id, 'rejected')}
                                  disabled={loading}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            )}
                            {interest.status === 'accepted' && (
                              <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                            )}
                            {interest.status === 'rejected' && (
                              <Badge variant="secondary">Declined</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              {sentInterests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No interests sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentInterests.map((interest) => {
                    const receiverInfo = getUserInfo(interest.receiver_id);
                    return (
                      <Card key={interest.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={receiverInfo.profile_picture_url || ''} />
                                <AvatarFallback>
                                  {receiverInfo.first_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">
                                  {receiverInfo.first_name} {receiverInfo.last_name}
                                </h4>
                                <p className="text-sm text-gray-600">{interest.message}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(interest.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {interest.status === 'pending' && (
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                              {interest.status === 'accepted' && (
                                <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                              )}
                              {interest.status === 'rejected' && (
                                <Badge variant="secondary">Declined</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="mutual" className="space-y-4">
              {mutualInterests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No mutual interests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mutualInterests.map((interest) => {
                    const otherUserInfo = getUserInfo(interest.receiver_id);
                    return (
                      <Card key={interest.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={otherUserInfo.profile_picture_url || ''} />
                                <AvatarFallback>
                                  {otherUserInfo.first_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">
                                  {otherUserInfo.first_name} {otherUserInfo.last_name}
                                </h4>
                                <p className="text-sm text-green-600 font-medium">
                                  ✨ Mutual Interest
                                </p>
                                <p className="text-xs text-gray-500">
                                  Connected on {new Date(interest.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary-dark text-white"
                            >
                              Start Chat
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
