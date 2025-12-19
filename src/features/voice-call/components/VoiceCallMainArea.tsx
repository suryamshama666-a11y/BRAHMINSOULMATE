
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from '@/data/profiles';
import { CallState } from '../useVoiceCall';
import { Mic, MicOff, Radio } from 'lucide-react';

interface VoiceCallMainAreaProps {
  callState: CallState;
  audioEnabled: boolean;
  profile: Profile;
  recordingEnabled: boolean;
  meetingUrl?: string | null;
}

export const VoiceCallMainArea = ({
  callState,
  audioEnabled,
  profile,
  recordingEnabled,
  meetingUrl
}: VoiceCallMainAreaProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {callState === 'connecting' ? (
        <div className="text-center text-white">
          <div className="relative mb-8">
            <Avatar className="h-48 w-48 mx-auto border-4 border-white/30 shadow-2xl">
              <AvatarImage src={profile.images[0]} alt={profile.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-4xl">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse" />
          </div>
          <h3 className="text-2xl font-medium mb-4">{profile.name}</h3>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Radio className="h-5 w-5 animate-pulse" />
            <p className="text-white/80 text-lg">Connecting audio call...</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative">
          {meetingUrl ? (
            <div className="w-full h-full relative">
              <iframe
                src={meetingUrl}
                allow="microphone; display-capture; fullscreen"
                className="w-full h-full border-0"
                title="Voice Call"
              />
              {/* Overlay to keep the avatar UI visible while Jitsi runs in background or smaller area? 
                  Actually, Jitsi is better for the whole area. But since it's "Voice Call", 
                  we might want to hide the Jitsi video area.
                  Most Jitsi users for voice-only just hide the iframe or make it 1x1.
                  But letting the user see the Jitsi interface (mute/unmute/participants) is fine.
              */}
            </div>
          ) : (
            <div className="text-center text-white pt-20">
              <div className="relative mb-8">
                <Avatar className="h-56 w-56 mx-auto border-4 border-white/30 shadow-2xl">
                  <AvatarImage src={profile.images[0]} alt={profile.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-5xl">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Audio indicator */}
                <div className={`absolute bottom-2 right-2 p-3 rounded-full ${
                  audioEnabled ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {audioEnabled ? <Mic className="h-6 w-6 text-white" /> : <MicOff className="h-6 w-6 text-white" />}
                </div>

                {/* Speaking animation */}
                {audioEnabled && (
                  <div className="absolute inset-0 rounded-full">
                    <div className="absolute inset-0 border-4 border-green-400/50 rounded-full animate-ping" />
                    <div className="absolute inset-2 border-2 border-green-300/30 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              
              <h3 className="text-3xl font-medium mb-2">{profile.name}</h3>
              <p className="text-white/70 text-lg mb-6">In voice call</p>
              
              <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Audio Connected</span>
                </div>
                {recordingEnabled && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span>Recording</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
