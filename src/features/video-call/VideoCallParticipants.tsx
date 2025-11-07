
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Participant } from './useVideoCall';

interface VideoCallParticipantsProps {
  participants: Participant[];
  onClose: () => void;
}

export const VideoCallParticipants = ({ participants, onClose }: VideoCallParticipantsProps) => {
  return (
    <div className="absolute right-4 top-16 z-20 w-80">
      <Card className="border-gray-700 bg-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Participants ({participants.length})</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {participants.map(participant => (
            <div key={participant.id} className="flex items-center justify-between p-2 rounded bg-gray-700">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant.avatar} alt={participant.name} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{participant.name}</p>
                  {participant.isCurrentUser && (
                    <p className="text-xs text-gray-400">(You)</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <div className={`p-1 rounded ${participant.audioEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {participant.audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </div>
                <div className={`p-1 rounded ${participant.videoEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {participant.videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
