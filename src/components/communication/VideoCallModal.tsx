
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Video, VideoOff, Mic, MicOff, Phone, 
  Settings, MessageSquare, 
} from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: {
    id: string;
    name: string;
    image: string;
    age: number;
  };
  callDuration?: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  participant,
  callDuration = "00:00"
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const handleEndCall = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0 overflow-hidden">
        <DialogHeader className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={participant.image} alt={participant.name} />
              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-white text-lg">{participant.name}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-white border-white">
                  {participant.age} years
                </Badge>
                <span className="text-sm text-gray-200">{callDuration}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="relative h-full bg-gray-900">
          {/* Main video area */}
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white/20">
                <AvatarImage src={participant.image} alt={participant.name} />
                <AvatarFallback className="text-4xl">{participant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-semibold mb-2">{participant.name}</h3>
              <Badge className="bg-green-500 text-white">
                Connected
              </Badge>
            </div>
          </div>

          {/* Self video (small overlay) */}
          <div className="absolute top-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
            <div className="h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <span className="text-sm">You</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-full p-4">
              <Button
                variant="outline"
                size="lg"
                className={`rounded-full w-14 h-14 ${isVideoOn ? 'bg-white text-black' : 'bg-red-500 text-white'}`}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className={`rounded-full w-14 h-14 ${isAudioOn ? 'bg-white text-black' : 'bg-red-500 text-white'}`}
                onClick={() => setIsAudioOn(!isAudioOn)}
              >
                {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-14 h-14 bg-white text-black"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-14 h-14 bg-white text-black"
              >
                <Settings className="h-6 w-6" />
              </Button>

              <Button
                size="lg"
                className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white"
                onClick={handleEndCall}
              >
                <Phone className="h-6 w-6 rotate-45" />
              </Button>
            </div>
          </div>

          {/* Chat sidebar */}
          {showChat && (
            <div className="absolute top-0 right-0 w-80 h-full bg-white border-l border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat
                </h4>
              </div>
              <div className="flex-1 p-4">
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
