
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Profile } from '@/data/profiles';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [callState, setCallState] = useState<CallState>('connecting');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, _setConnectionQuality] = useState<ConnectionQuality>('good');
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);

  // effect:audited — Initialize participants when profile changes
  useEffect(() => {
    if (profile) {
      setParticipants([
        {
          id: user?.id || 'current-user',
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
  }, [userId, profile, user]);

  // effect:audited — Fetch meeting URL from Supabase for voice call
  useEffect(() => {
    if (!profile || !user) return;

    const fetchMeeting = async () => {
      try {
        const { data, error } = await supabase
          .from('vdates')
          .select('meeting_url, status')
          .or(`host_id.eq.${user.id},participant_id.eq.${user.id}`)
          .eq('status', 'scheduled')
          .single();

        if (error) {
          // If no meeting found, fallback to a dynamic Jitsi URL for the demo
          const roomName = `brahmin-soulmate-voice-${[user.id, profile.id || profile.userId].sort().join('-')}`;
          setMeetingUrl(`https://meet.jit.si/${roomName}#config.startWithVideoMuted=true&config.prejoinPageEnabled=false`);
          setCallState('connected');
          return;
        }

        if (data?.meeting_url) {
          // Add audio-only flags to Jitsi URL
          const jitsiUrl = data.meeting_url.includes('meet.jit.si') 
            ? `${data.meeting_url}#config.startWithVideoMuted=true&config.prejoinPageEnabled=false`
            : data.meeting_url;
          
          setMeetingUrl(jitsiUrl);
          setCallState('connected');
        }
      } catch (err) {
        console.error('Error fetching voice call meeting:', err);
      }
    };

    fetchMeeting();
  }, [profile, user]);

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
        toast.success('Call recording started');
      } else {
        toast.info('Call recording stopped');
      }
      return newState;
    });
  }, []);

  const endCall = useCallback(() => {
    setCallState('ended');
    toast.info('Voice call ended');
  }, []);

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
    meetingUrl,
    toggleAudio,
    toggleRecording,
    endCall,
    sendChatMessage
  };
};
