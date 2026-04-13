
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types/profile';
import { User, MapPin, Heart } from 'lucide-react';
import { logger } from '@/utils/logger';

type ProfilePersonalTabProps = {
  profile: Profile;
};

export default function ProfilePersonalTab({ profile }: ProfilePersonalTabProps) {
  logger.log('ProfilePersonalTab rendering with profile:', profile);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-red-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age</span>
                  <span className="font-medium">{profile.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Height</span>
                  <span className="font-medium">{Math.floor(profile.height / 12)}'{profile.height % 12}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Marital Status</span>
                  <span className="font-medium">{profile.maritalStatus}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mother Tongue</span>
                  <span className="font-medium">Hindi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Religion</span>
                  <span className="font-medium">Hindu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Caste</span>
                  <span className="font-medium">Brahmin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub Caste</span>
                  <span className="font-medium">{profile.family.subcaste || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              Location Details
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">City</span>
                    <span className="font-medium">{profile.location.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">State</span>
                    <span className="font-medium">{profile.location.state}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Country</span>
                    <span className="font-medium">{profile.location.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Citizenship</span>
                    <span className="font-medium">Indian</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-600" />
              Lifestyle
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diet</span>
                    <span className="font-medium">Vegetarian</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Smoking</span>
                    <span className="font-medium">No</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drinking</span>
                    <span className="font-medium">No</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hobbies</span>
                    <span className="font-medium">Reading, Music</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
