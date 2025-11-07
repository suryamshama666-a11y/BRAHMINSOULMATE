
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Profile } from '@/data/profiles';
import ProfileTabContent from './ProfileTabContent';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

type ProfileDetailTabsProps = {
  profile: Profile;
};

export default function ProfileDetailTabs({ profile }: ProfileDetailTabsProps) {
  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid grid-cols-2 sm:grid-cols-5 mb-6 overflow-x-auto gap-1">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="professional">Professional</TabsTrigger>
        <TabsTrigger value="family">Family</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="horoscope" className="flex items-center justify-center gap-1">
          <span>Horoscope</span>
          <Link 
            to="/astrological-services" 
            className="inline-flex ml-1 text-xs text-brahmin-primary hover:text-brahmin-dark"
            title="View all astrological services"
          >
            <Star className="h-3 w-3" />
          </Link>
        </TabsTrigger>
      </TabsList>
      
      <ProfileTabContent profile={profile} />
    </Tabs>
  );
}
