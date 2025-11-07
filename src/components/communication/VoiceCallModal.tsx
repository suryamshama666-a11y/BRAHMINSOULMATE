
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, MicOff, Phone, Volume2, VolumeX,
  MessageSquare, Settings
} from 'lucide-react';

interface VoiceCallModalProps {
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

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  participant,
  callDuration = "00:00"
}) => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const handleEndCall = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[500px] p-0 overflow-hidden">
        <div className="relative h-full bg-primary">
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-20 -right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute -bottom-10 left-1/2 w-36 h-36 bg-white/10 rounded-full animate-pulse delay-500"></div>
          </div>

          {/* Header */}
          <DialogHeader className="relative z-10 p-6 text-center">
            <div className="space-y-2">
              <Badge className="bg-green-500 text-white">
                Voice Call - {callDuration}
              </Badge>
              <DialogTitle className="text-white text-lg">Calling...</DialogTitle>
            </div>
          </DialogHeader>

          {/* Participant info */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white/20 mb-6">
                <AvatarImage src={participant.image} alt={participant.name} />
                <AvatarFallback className="text-4xl">{participant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              {/* Audio visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 border-2 border-white/30 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold text-white mb-2">{participant.name}</h3>
            <Badge variant="outline" className="text-white border-white mb-8">
              {participant.age} years
            </Badge>

            {/* Audio status */}
            <div className="flex items-center gap-2 text-white/80 mb-8">
              {isAudioOn ? (
                <>
                  <Mic className="h-4 w-4" />
                  <span className="text-sm">Microphone on</span>
                </>
              ) : (
                <>
                  <MicOff className="h-4 w-4" />
                  <span className="text-sm">Microphone off</span>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-center gap-4">
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
                className={`rounded-full w-14 h-14 ${isSpeakerOn ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              >
                {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
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
                <Phone className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
