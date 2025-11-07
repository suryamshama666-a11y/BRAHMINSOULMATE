
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Shield } from "lucide-react";
import { ConnectionQuality } from '../useVoiceCall';

interface VoiceCallHeaderProps {
  connectionQuality: ConnectionQuality;
  callDuration: number;
  showChat: boolean;
  onToggleChat: () => void;
  onEndCall: () => void;
  recordingEnabled: boolean;
}

export const VoiceCallHeader = ({
  connectionQuality,
  callDuration,
  showChat,
  onToggleChat,
  onEndCall,
  recordingEnabled
}: VoiceCallHeaderProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Connection Quality & Recording Indicator */}
      <div className="absolute top-6 left-6 z-10 flex gap-3">
        <div className={`px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
          connectionQuality === 'excellent' ? 'bg-green-500/80 text-white' :
          connectionQuality === 'good' ? 'bg-yellow-500/80 text-white' :
          'bg-red-500/80 text-white'
        }`}>
          {connectionQuality.toUpperCase()}
        </div>
        {recordingEnabled && (
          <div className="bg-red-500/80 text-white px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            REC
          </div>
        )}
      </div>

      {/* Call Duration */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/50 text-white px-4 py-2 rounded-full text-lg font-mono backdrop-blur-sm">
          {formatDuration(callDuration)}
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 z-10 flex gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm rounded-full"
          onClick={onToggleChat}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 text-green-400 hover:bg-black/70 backdrop-blur-sm rounded-full"
        >
          <Shield className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 text-red-400 hover:bg-red-500/20 backdrop-blur-sm rounded-full"
          onClick={onEndCall}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};
