
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Clock, Send, Calendar, User } from 'lucide-react';
import { VDateInvitation } from '@/types/vdates';
import { Profile } from '@/types/profile';

interface VDateInvitationsProps {
  pendingInvitations: VDateInvitation[];
  sentInvitations: VDateInvitation[];
  profiles: Profile[];
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
}

export const VDateInvitations = ({
  pendingInvitations,
  sentInvitations,
  profiles,
  onAccept,
  onDecline
}: VDateInvitationsProps) => {
  const getProfileById = (id: string) => profiles.find(p => p.id === id);

  const InvitationCard = ({ invitation, type }: { invitation: VDateInvitation; type: 'received' | 'sent' }) => {
    const profile = type === 'received' 
      ? getProfileById(invitation.fromUserId)
      : getProfileById(invitation.toUserId);
    
    if (!profile) return null;

    return (
      <Card className="border border-gray-200 hover:border-red-300 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16 border-2 border-red-200">
              <AvatarImage src={profile.images[0]} alt={profile.name} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {profile.age} yrs
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <User className="h-4 w-4 mr-1" />
                <span>{profile.location.city}, {profile.location.country}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Sent {invitation.createdAt.toLocaleDateString()}</span>
              </div>
              
              {invitation.message && (
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-sm italic">"{invitation.message}"</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Badge className={
                  invitation.status === 'sent' 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                    : invitation.status === 'accepted'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                }>
                  <Clock className="h-3 w-3 mr-1" />
                  {invitation.status === 'sent' ? 'Pending' : invitation.status}
                </Badge>
                
                {type === 'received' && invitation.status === 'sent' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onDecline(invitation.id)}
                      className="bg-white text-red-600 border-2 border-red-400 hover:!bg-white hover:!text-red-600 hover:!border-red-400 transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAccept(invitation.id)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="border-2 border-red-100/50">
      <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50">
        <CardTitle className="text-xl text-red-700 flex items-center">
          <Send className="h-5 w-5 mr-2" />
          V-Date Invitations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              Received ({pendingInvitations.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              Sent ({sentInvitations.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="received" className="mt-6">
            <div className="space-y-4">
              {pendingInvitations.length > 0 ? (
                pendingInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    type="received"
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full h-16 w-16 mx-auto mb-4 flex items-center justify-center">
                    <Send className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-600 mb-2">No pending invitations</h3>
                  <p className="text-gray-500">You'll see V-Date invitations from matches here</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sent" className="mt-6">
            <div className="space-y-4">
              {sentInvitations.length > 0 ? (
                sentInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    type="sent"
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full h-16 w-16 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-600 mb-2">No sent invitations</h3>
                  <p className="text-gray-500">Start scheduling V-Dates to see your sent invitations here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
