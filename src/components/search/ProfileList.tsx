import React from 'react';
import ProfileCard from '@/components/ProfileCard';
import { Profile } from '@/data/profiles';

interface ProfileListProps {
  profiles: Profile[];
}

export function ProfileList({ profiles }: ProfileListProps) {
  if (!profiles.length) {
    return (
      <div className="text-center p-12 bg-white rounded-lg shadow-sm border">
        <h3 className="font-semibold text-lg mb-2">No profiles found</h3>
        <p className="text-gray-600">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}