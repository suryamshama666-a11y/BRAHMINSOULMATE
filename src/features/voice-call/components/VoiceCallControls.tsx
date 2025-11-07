
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VoiceCallControlsProps {
  audioEnabled: boolean;
  recordingEnabled: boolean;
  onToggleAudio: () => void;
  onToggleRecording: () => void;
  onEndCall: () => void;
}

export const VoiceCallControls = ({
  audioEnabled,
  recordingEnabled,
  onToggleAudio,
  onToggleRecording,
  onEndCall
}: VoiceCallControlsProps) => {
  return (
    <div className="bg-gray-900/90 backdrop-blur-sm p-6 border-t border-white/10">
      <div className="flex justify-center items-center gap-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className={`rounded-full w-16 h-16 ${
                  !audioEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                } text-white transition-all duration-200 backdrop-blur-sm`}
                onClick={onToggleAudio}
              >
                {audioEnabled ? <Mic className="h-7 w-7" /> : <MicOff className="h-7 w-7" />}
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
                className={`rounded-full w-16 h-16 ${
                  recordingEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                } text-white transition-all duration-200 backdrop-blur-sm`}
                onClick={onToggleRecording}
              >
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full ${recordingEnabled ? 'bg-white animate-pulse' : 'bg-white/70'}`} />
                  {recordingEnabled && (
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-red-300 animate-ping" />
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{recordingEnabled ? 'Stop recording' : 'Start recording'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 text-white transition-all duration-200 backdrop-blur-sm"
              >
                <Volume2 className="h-7 w-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Audio settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-20 h-16 bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg"
                onClick={onEndCall}
              >
                <Phone className="h-7 w-7 rotate-135" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>End call</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Call Info */}
      <div className="text-center mt-4">
        <p className="text-sm text-white/70">
          Secure matrimonial voice call • End-to-end encrypted
        </p>
        {recordingEnabled && (
          <p className="text-xs text-red-300 mt-1 animate-pulse">
            • Recording in progress with consent
          </p>
        )}
      </div>
    </div>
  );
};
