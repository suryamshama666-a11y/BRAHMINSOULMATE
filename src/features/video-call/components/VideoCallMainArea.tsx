
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from '@/data/profiles';
import { CallState } from '../useVideoCall';

interface VideoCallMainAreaProps {
  callState: CallState;
  videoEnabled: boolean;
  profile: Profile;
}

export const VideoCallMainArea = ({
  callState,
  videoEnabled,
  profile
}: VideoCallMainAreaProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {callState === 'connecting' ? (
        <div className="text-center text-white">
          <div className="animate-pulse mb-4">
            <Avatar className="h-32 w-32 mx-auto border-4 border-white/20">
              <AvatarImage src={profile.images[0]} alt={profile.name} />
              <AvatarFallback className="bg-brahmin-primary text-white text-3xl">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-xl font-medium mb-2">{profile.name}</h3>
          <p className="text-white/70">Connecting...</p>
        </div>
      ) : (
        <div className="w-full h-full relative">
          {videoEnabled ? (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-64 w-64 border-4 border-white/20">
                <AvatarImage src={profile.images[0]} alt={profile.name} />
                <AvatarFallback className="bg-brahmin-primary text-white text-6xl">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white/20">
                  <AvatarImage src={profile.images[0]} alt={profile.name} />
                  <AvatarFallback className="bg-brahmin-primary text-white text-3xl">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white/70">Camera is off</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
