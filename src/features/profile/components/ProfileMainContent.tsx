import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileImageGallery from './ProfileImageGallery';
import ProfileHeader from './ProfileHeader';
import ProfileTabContent from './ProfileTabContent';
import ProfileContactOptions from './ProfileContactOptions';

interface ProfileMainContentProps {
  profile: any; // Replace with proper type
}

const ProfileMainContent: React.FC<ProfileMainContentProps> = ({ profile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column - Image Gallery & Contact Options */}
    <div className="lg:col-span-1">
      <div className="space-y-6 lg:sticky lg:top-20">
        <ProfileImageGallery profile={profile} />
        <div className="hidden lg:block">
          <ProfileContactOptions profile={profile} />
        </div>
      </div>
    </div>

    {/* Right Column - Profile Details */}
    <div className="lg:col-span-2 space-y-6">
      <ProfileHeader profile={profile} />

      {/* Profile Details Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <Tabs defaultValue="personal" className="w-full">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none h-auto bg-transparent p-0">
              {["personal", "professional", "family", "preferences", "horoscope"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="flex-1 py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-red-600 rounded-none capitalize data-[state=active]:text-red-600 text-sm"
                >
                  {tab === "horoscope" ? "Horoscope" : tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <ProfileTabContent profile={profile} />
        </Tabs>
      </div>

      {/* Contact Options for Mobile */}
      <div className="lg:hidden">
        <ProfileContactOptions profile={profile} />
      </div>
    </div>
  </div>
);

export default ProfileMainContent;