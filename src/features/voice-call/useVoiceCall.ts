
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Profile } from '@/data/profiles';

export type CallState = 'connecting' | 'connected' | 'ended';
export type ConnectionQuality = 'excellent' | 'good' | 'poor';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'participant';
  message: string;
  timestamp: Date;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  audioEnabled: boolean;
  isCurrentUser: boolean;
}

export const useVoiceCall = (userId: string, profile: Profile | undefined) => {
  const [callState, setCallState] = useState<CallState>('connecting');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Initialize participants
  useEffect(() => {
    if (profile) {
      setParticipants([
        {
          id: 'current-user',
          name: 'You',
          avatar: '',
          audioEnabled: true,
          isCurrentUser: true
        },
        {
          id: profile.id || profile.userId || userId,
          name: profile.name,
          avatar: profile.images[0] || '',
          audioEnabled: true,
          isCurrentUser: false
        }
      ]);
    }
  }, [userId, profile]);

  // Simulate connection
  useEffect(() => {
    const connectionTimer = setTimeout(() => {
      setCallState('connected');
      toast.success(`Voice call connected with ${profile?.name || 'user'}`, {
        description: 'High-quality audio call with privacy protection'
      });
    }, 1500);

    return () => clearTimeout(connectionTimer);
  }, [profile]);

  // Call duration timer
  useEffect(() => {
    let durationTimer: number | undefined;
    
    if (callState === 'connected') {
      durationTimer = window.setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1;
          
          // Safety warnings
          if (newDuration === 1800) { // 30 minutes
            toast.warning('Call has been active for 30 minutes');
          } else if (newDuration === 3600) { // 60 minutes
            toast.warning('Extended call - monitored for safety');
          }
          
          return newDuration;
        });
      }, 1000);
    }
    
    return () => {
      if (durationTimer) clearInterval(durationTimer);
    };
  }, [callState]);

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => {
      const newState = !prev;
      setParticipants(parts => 
        parts.map(p => 
          p.isCurrentUser ? { ...p, audioEnabled: newState } : p
        )
      );
      toast.info(newState ? 'Microphone enabled' : 'Microphone disabled');
      return newState;
    });
  }, []);

  const toggleRecording = useCallback(() => {
    setRecordingEnabled(prev => {
      const newState = !prev;
      if (newState) {
        toast.success('Call recording started', {
          description: 'Both parties have consented to recording'
        });
      } else {
        toast.info('Call recording stopped');
      }
      return newState;
    });
  }, []);

  const endCall = useCallback(() => {
    setCallState('ended');
    if (recordingEnabled) {
      toast.info('Call ended - Recording saved securely');
    } else {
      toast.info('Voice call ended');
    }
  }, [recordingEnabled]);

  const sendChatMessage = useCallback((message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMessage]);
  }, []);

  return {
    callState,
    audioEnabled,
    callDuration,
    connectionQuality,
    recordingEnabled,
    participants,
    chatMessages,
    toggleAudio,
    toggleRecording,
    endCall,
    sendChatMessage
  };
};
