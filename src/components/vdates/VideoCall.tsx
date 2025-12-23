import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from 'lucide-react';

interface VideoCallProps {
  roomName: string;
  userName: string;
  onEnd: () => void;
  otherUserName?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: object) => JitsiAPI;
  }
}

interface JitsiAPI {
  addListener: (event: string, callback: (data?: { muted?: boolean }) => void) => void;
  executeCommand: (command: string) => void;
  dispose: () => void;
}

export default function VideoCall({ roomName, userName, onEnd, otherUserName }: VideoCallProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiAPI | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeJitsi = useCallback(() => {
    if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
      setError('Video call container not ready');
      return;
    }

    try {
      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
          enableClosePage: false,
          disableInviteFunctions: true,
          toolbarButtons: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'settings',
            'videoquality',
            'tileview',
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          MOBILE_APP_PROMO: false,
          HIDE_INVITE_MORE_HEADER: true,
          TOOLBAR_ALWAYS_VISIBLE: true,
        },
      };

      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      // Event listeners
      apiRef.current.addListener('videoConferenceJoined', () => {
        setIsLoading(false);
      });

      apiRef.current.addListener('videoConferenceLeft', () => {
        onEnd();
      });

      apiRef.current.addListener('audioMuteStatusChanged', (data) => {
        setIsAudioMuted(data?.muted ?? false);
      });

      apiRef.current.addListener('videoMuteStatusChanged', (data) => {
        setIsVideoMuted(data?.muted ?? false);
      });

      apiRef.current.addListener('readyToClose', () => {
        onEnd();
      });

    } catch (err) {
      console.error('Jitsi initialization error:', err);
      setError('Failed to initialize video call');
    }
  }, [roomName, userName, onEnd]);

  useEffect(() => {
    // Load Jitsi Meet API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = initializeJitsi;
    script.onerror = () => setError('Failed to load video call service');
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, [initializeJitsi]);

  const toggleAudio = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      jitsiContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const endCall = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
    onEnd();
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <PhoneOff className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onEnd} variant="outline">
          Go Back
        </Button>
      </Card>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="font-semibold">V-Date with {otherUserName || 'Your Match'}</h3>
            <p className="text-sm text-gray-300">Video call in progress</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connecting to video call...</p>
          </div>
        </div>
      )}

      {/* Jitsi container */}
      <div 
        ref={jitsiContainerRef} 
        className="w-full"
        style={{ height: isFullscreen ? '100vh' : '70vh', minHeight: '500px' }}
      />

      {/* Custom controls (optional - Jitsi has its own) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAudio}
            className={`rounded-full w-12 h-12 ${isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
          >
            {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={endCall}
            className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVideo}
            className={`rounded-full w-12 h-12 ${isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
          >
            {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
