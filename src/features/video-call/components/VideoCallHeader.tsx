
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Settings, MessageSquare, Users } from "lucide-react";
import { ConnectionQuality } from '../useVideoCall';

interface VideoCallHeaderProps {
  connectionQuality: ConnectionQuality;
  callDuration: number;
  showParticipants: boolean;
  showChat: boolean;
  showSettings: boolean;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onToggleSettings: () => void;
  onEndCall: () => void;
}

export const VideoCallHeader = ({
  connectionQuality,
  callDuration,
  _showParticipants,
  _showChat,
  _showSettings,
  onToggleParticipants,
  onToggleChat,
  onToggleSettings,
  onEndCall
}: VideoCallHeaderProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Connection Quality Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          connectionQuality === 'excellent' ? 'bg-green-500 text-white' :
          connectionQuality === 'good' ? 'bg-yellow-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          {connectionQuality.toUpperCase()}
        </div>
      </div>

      {/* Call Duration */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {formatDuration(callDuration)}
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 text-white hover:bg-black/70"
          onClick={onToggleParticipants}
        >
          <Users className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 text-white hover:bg-black/70"
          onClick={onToggleChat}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 text-white hover:bg-black/70"
          onClick={onToggleSettings}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 text-red-500 hover:bg-red-500/20"
          onClick={onEndCall}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};
