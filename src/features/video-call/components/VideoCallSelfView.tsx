
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VideoOff, MicOff } from "lucide-react";

interface VideoCallSelfViewProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
}

export const VideoCallSelfView = ({
  videoEnabled,
  audioEnabled
}: VideoCallSelfViewProps) => {
  return (
    <div className="absolute bottom-20 right-4 w-48 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
      <div className="absolute inset-0 flex items-center justify-center">
        {videoEnabled ? (
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-500 text-white">
              You
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="text-white text-center">
            <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto mb-1 flex items-center justify-center">
              <VideoOff className="h-4 w-4" />
            </div>
            <p className="text-xs">Camera off</p>
          </div>
        )}
      </div>
      {!audioEnabled && (
        <div className="absolute top-2 left-2">
          <div className="bg-red-500 rounded-full p-1">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};
