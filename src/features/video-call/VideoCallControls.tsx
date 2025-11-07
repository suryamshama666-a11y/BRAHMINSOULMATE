
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Video, VideoOff, Mic, MicOff, Share, Image } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoCallControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

export const VideoCallControls = ({
  audioEnabled,
  videoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall
}: VideoCallControlsProps) => {
  return (
    <div className="bg-gray-800 p-4 border-t border-gray-700">
      <div className="flex justify-center items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className={`rounded-full w-14 h-14 ${
                  !audioEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                } text-white transition-all duration-200`}
                onClick={onToggleAudio}
              >
                {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{audioEnabled ? 'Mute microphone' : 'Unmute microphone'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className={`rounded-full w-14 h-14 ${
                  !videoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                } text-white transition-all duration-200`}
                onClick={onToggleVideo}
              >
                {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{videoEnabled ? 'Turn off camera' : 'Turn on camera'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className={`rounded-full w-14 h-14 ${
                  isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
                } text-white transition-all duration-200`}
                onClick={onToggleScreenShare}
              >
                {isScreenSharing ? <Image className="h-6 w-6" /> : <Share className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isScreenSharing ? 'Stop sharing' : 'Share documents/photos'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-14 bg-red-600 hover:bg-red-700 transition-all duration-200"
                onClick={onEndCall}
              >
                <Phone className="h-6 w-6 rotate-135" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>End call</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Call Quality Indicator */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-400">
          Secure matrimonial video call • End-to-end encrypted
        </p>
      </div>
    </div>
  );
};
