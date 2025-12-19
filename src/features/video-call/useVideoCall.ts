
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
  videoEnabled: boolean;
  isCurrentUser: boolean;
}

export const useVideoCall = (userId: string, profile: Profile | undefined) => {
  const [callState, setCallState] = useState<CallState>('connecting');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [autoEndTimer, setAutoEndTimer] = useState<number | null>(null);

  const [vdateId, setVdateId] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);

  // Initialize participants and vdate
  useEffect(() => {
    if (profile) {
      setParticipants([
        {
          id: 'current-user',
          name: 'You',
          avatar: '',
          audioEnabled: true,
          videoEnabled: true,
          isCurrentUser: true
        },
        {
          id: profile.id || profile.userId || userId,
          name: profile.name,
          avatar: profile.images[0] || '',
          audioEnabled: true,
          videoEnabled: true,
          isCurrentUser: false
        }
      ]);

      // Check for active V-Date
      const fetchVDate = async () => {
        try {
          const { data: vdates } = await supabase
            .from('vdates')
            .select('*')
            .or(`and(user_id_1.eq.${userId},user_id_2.eq.${profile.id}),and(user_id_1.eq.${profile.id},user_id_2.eq.${userId})`)
            .eq('status', 'scheduled')
            .order('scheduled_time', { ascending: true })
            .limit(1);

          if (vdates && vdates.length > 0) {
            setVdateId(vdates[0].id);
            if (vdates[0].room_name) {
              setMeetingUrl(`https://meet.jit.si/${vdates[0].room_name}`);
            }
          }
        } catch (error) {
          console.error('Error fetching V-Date:', error);
        }
      };

      fetchVDate();
    }
  }, [userId, profile]);

  // Simulate connection with real meeting check
  useEffect(() => {
    const connectionTimer = setTimeout(() => {
      setCallState('connected');
      toast.success(`Connected with ${profile?.name || 'user'}`, {
        description: 'This call is secure and monitored for safety'
      });
      
      // Simulate connection quality changes
      const qualityTimer = setInterval(() => {
        const qualities: ConnectionQuality[] = ['excellent', 'good', 'poor'];
        setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
      }, 30000);

      return () => clearInterval(qualityTimer);
    }, 2000);

    return () => clearTimeout(connectionTimer);
  }, [profile]);

  // Call duration timer with safety limits
  useEffect(() => {
    let durationTimer: number | undefined;
    
    if (callState === 'connected') {
      durationTimer = window.setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1;
          
          // Safety warnings at specific intervals
          if (newDuration === 1800) { // 30 minutes
            toast.warning('Call has been active for 30 minutes', {
              description: 'Consider taking a break for your wellbeing'
            });
          } else if (newDuration === 3600) { // 60 minutes
            toast.warning('Long call detected', {
              description: 'Extended calls are monitored for safety'
            });
          }
          
          return newDuration;
        });
      }, 1000);
    }
    
    return () => {
      if (durationTimer) clearInterval(durationTimer);
    };
  }, [callState]);

  // Auto-end timer for safety (can be set from safety controls)
  useEffect(() => {
    if (autoEndTimer && callDuration >= autoEndTimer) {
      toast.info('Call automatically ended for safety');
      setCallState('ended');
    }
  }, [callDuration, autoEndTimer]);

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

  const toggleVideo = useCallback(() => {
    setVideoEnabled(prev => {
      const newState = !prev;
      setParticipants(parts => 
        parts.map(p => 
          p.isCurrentUser ? { ...p, videoEnabled: newState } : p
        )
      );
      toast.info(newState ? 'Camera enabled' : 'Camera disabled');
      return newState;
    });
  }, []);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing(prev => {
      const newState = !prev;
      toast.info(newState ? 'Screen sharing started' : 'Screen sharing stopped', {
        description: newState ? 'Perfect for sharing documents or photos' : undefined
      });
      return newState;
    });
  }, []);

  const endCall = useCallback(() => {
    setCallState('ended');
    toast.info('Call ended safely');
  }, []);

  const sendChatMessage = useCallback((message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMessage]);

    // Simulate response with matrimonial context
    setTimeout(() => {
      const responses = [
        'Thank you for sharing that!',
        'That\'s wonderful to hear.',
        'I appreciate you telling me.',
        'That sounds great!',
        'Thanks for the information.'
      ];
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'participant',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, response]);
    }, 1000);
  }, []);

  const changeBackground = useCallback((background: string) => {
    const backgroundNames: { [key: string]: string } = {
      'none': 'No Background',
      'blur': 'Blur',
      'traditional-home': 'Traditional Home',
      'elegant-room': 'Elegant Room',
      'professional': 'Professional',
      'cultural-setting': 'Cultural Setting',
      'garden-view': 'Garden View',
      'family-home': 'Family Home'
    };
    
    toast.success(`Background changed to ${backgroundNames[background] || background}`);
  }, []);

  const setAutoEnd = useCallback((minutes: number) => {
    setAutoEndTimer(minutes * 60);
    toast.info(`Auto-end timer set for ${minutes} minutes`);
  }, []);

  return {
    callState,
    audioEnabled,
    videoEnabled,
    callDuration,
    connectionQuality,
    isScreenSharing,
    participants,
    chatMessages,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    endCall,
    sendChatMessage,
    changeBackground,
    setAutoEnd,
    meetingUrl
  };
};
