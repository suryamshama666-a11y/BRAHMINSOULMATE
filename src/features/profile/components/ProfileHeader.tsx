
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types/profile';
import { formatHeight, formatLocation } from '../utils/formatters';

type ProfileHeaderProps = {
  profile: Profile;
};

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-serif font-bold mb-2">
          {profile.name}, {profile.age}
        </h2>
        <p className="text-muted-foreground mb-4">{formatLocation(profile.location)}</p>
        
        <div className="flex flex-wrap gap-y-2 gap-x-4 mb-6">
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Height:</span>
            <span className="font-medium">{formatHeight(profile.height)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Gotra:</span>
            <span className="font-medium">{profile.family.gotra || 'Not specified'}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Profession:</span>
            <span className="font-medium">{profile.employment.profession}</span>
          </div>
          {profile.horoscope?.rashi && (
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">Rashi:</span>
              <span className="font-medium">{profile.horoscope.rashi}</span>
            </div>
          )}
          {profile.horoscope?.manglik !== undefined && (
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">Manglik:</span>
              <span className="font-medium">{profile.horoscope.manglik ? 'Yes' : 'No'}</span>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">About Me</h3>
        <p className="text-gray-700">{profile.about}</p>
      </CardContent>
    </Card>
  );
}
