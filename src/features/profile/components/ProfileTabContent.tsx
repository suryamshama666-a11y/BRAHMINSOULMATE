
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Profile } from '@/types/profile';
import ProfilePersonalTab from './ProfilePersonalTab';
import ProfileProfessionalTab from './ProfileProfessionalTab';
import ProfileFamilyTab from './ProfileFamilyTab';
import ProfilePreferencesTab from './ProfilePreferencesTab';
import ProfileHoroscopeTab from './ProfileHoroscopeTab';
import { logger } from '@/utils/logger';

type ProfileTabContentProps = {
  profile: Profile;
};

export default function ProfileTabContent({ profile }: ProfileTabContentProps) {
  logger.log('ProfileTabContent rendering with profile:', profile);
  
  if (!profile) {
    console.error('ProfileTabContent: No profile provided');
    return <div className="p-4 text-center text-gray-500">Profile data not available</div>;
  }

  try {
    return (
      <div className="shadow-sm rounded-md bg-white">
        <TabsContent value="personal" className="p-0">
          <ProfilePersonalTab profile={profile} />
        </TabsContent>
        
        <TabsContent value="professional" className="p-0">
          <ProfileProfessionalTab profile={profile} />
        </TabsContent>
        
        <TabsContent value="family" className="p-0">
          <ProfileFamilyTab profile={profile} />
        </TabsContent>
        
        <TabsContent value="preferences" className="p-0">
          <ProfilePreferencesTab profile={profile} />
        </TabsContent>
        
        <TabsContent value="horoscope" className="p-0">
          <ProfileHoroscopeTab profile={profile} />
        </TabsContent>
      </div>
    );
  } catch (error) {
    console.error('Error in ProfileTabContent:', error);
    return (
      <div className="p-4 text-center text-red-500">
        Error loading profile content
      </div>
    );
  }
}
