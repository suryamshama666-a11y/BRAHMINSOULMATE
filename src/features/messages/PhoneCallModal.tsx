
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mic, MicOff, X } from 'lucide-react';
import { Profile } from '@/data/profiles';
import { toast } from 'sonner';

interface PhoneCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export const PhoneCallModal = ({ isOpen, onClose, profile }: PhoneCallModalProps) => {
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // effect:audited — Connection simulation timer
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

  // effect:audited — Call duration interval timer
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Phone className="mr-2 h-5 w-5 text-brahmin-primary" />
              Call with {profile.name}
            </div>
            <Button variant="ghost" size="sm" onClick={handleEndCall}>
              <X className="h-5 w-5 text-red-500" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-8">
          <Avatar className="h-32 w-32 mx-auto mb-6">
            <AvatarImage src={profile.images[0]} alt={profile.name} />
            <AvatarFallback className="bg-brahmin-primary text-white text-3xl">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-xl font-medium mb-2">{profile.name}</h3>
          
          {callState === 'connecting' ? (
            <p className="text-muted-foreground animate-pulse mb-8">Connecting...</p>
          ) : (
            <p className="text-muted-foreground mb-8">{formatDuration(callDuration)}</p>
          )}
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full ${!audioEnabled ? 'bg-red-100' : ''}`}
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-red-500" />}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
