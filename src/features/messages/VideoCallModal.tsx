
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Video, Mic, MicOff, VideoOff, X } from 'lucide-react';
import { Profile } from '@/data/profiles';
import { toast } from 'sonner';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export const VideoCallModal = ({ isOpen, onClose, profile }: VideoCallModalProps) => {
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Simulate connection
      const timer = setTimeout(() => {
        setCallState('connected');
        toast.success(`Connected with ${profile.name}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, profile.name]);

  useEffect(() => {
    let durationTimer: number | undefined;
    
    if (callState === 'connected') {
      durationTimer = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (durationTimer) clearInterval(durationTimer);
    };
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
    toast.info("Call ended");
    onClose();
    setCallDuration(0);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Video className="mr-2 h-5 w-5 text-brahmin-primary" />
              Video Call with {profile.name}
            </div>
            <Button variant="ghost" size="sm" onClick={handleEndCall}>
              <X className="h-5 w-5 text-red-500" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
          {callState === 'connecting' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <Avatar className="h-20 w-20 mx-auto">
                    <AvatarImage src={profile.images[0]} alt={profile.name} />
                    <AvatarFallback className="bg-brahmin-primary text-white text-xl">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <p className="text-muted-foreground">Connecting to {profile.name}...</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {videoEnabled ? (
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.images[0]} alt={profile.name} />
                  <AvatarFallback className="bg-brahmin-primary text-white text-3xl">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4">
                    <AvatarImage src={profile.images[0]} alt={profile.name} />
                    <AvatarFallback className="bg-brahmin-primary text-white text-3xl">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground">Camera is off</p>
                </div>
              )}
            </div>
          )}
          
          {/* Self view */}
          <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-gray-800 rounded overflow-hidden shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-500 text-white">
                  You
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-4 gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full ${!audioEnabled ? 'bg-red-100' : ''}`}
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-red-500" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full ${!videoEnabled ? 'bg-red-100' : ''}`}
            onClick={() => setVideoEnabled(!videoEnabled)}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-red-500" />}
          </Button>
          
          <Button 
            variant="destructive" 
            className="rounded-full"
            onClick={handleEndCall}
          >
            <Phone className="h-5 w-5 rotate-135" />
            <span className="ml-2">End Call</span>
          </Button>
        </div>
        
        <div className="mt-4 text-center text-muted-foreground">
          {callState === 'connected' && <p>{formatDuration(callDuration)}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
