
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types/profile';
import { Users, Home, Heart, Crown } from 'lucide-react';
import { logger } from '@/utils/logger';

type ProfileFamilyTabProps = {
  profile: Profile;
};

export default function ProfileFamilyTab({ profile }: ProfileFamilyTabProps) {
  logger.log('ProfileFamilyTab rendering with profile:', profile);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-red-600" />
              Family Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Parents</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Father's Name</span>
                    <span className="font-medium">{profile.family.fatherName || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Father's Profession</span>
                    <span className="font-medium">Business</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mother's Name</span>
                    <span className="font-medium">{profile.family.motherName || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mother's Profession</span>
                    <span className="font-medium">Homemaker</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Siblings</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brothers</span>
                    <span className="font-medium">1 (Married: 0)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sisters</span>
                    <span className="font-medium">1 (Married: 1)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-red-600" />
              Cultural Details
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gotra</span>
                    <span className="font-medium">{profile.family.gotra}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sub Caste</span>
                    <span className="font-medium">{profile.family.subcaste || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kul Devta</span>
                    <span className="font-medium">Vishnu</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kul Devi</span>
                    <span className="font-medium">Durga</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ishta Devata</span>
                    <span className="font-medium">{profile.family.ishtaDevata}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Family Type</span>
                    <span className="font-medium">Joint Family</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Home className="h-5 w-5 mr-2 text-red-600" />
              Family Values
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">About Our Family</h4>
                  <p className="text-blue-700 text-sm">
                    We are a close-knit family that believes in traditional values while embracing modern outlook. 
                    We celebrate festivals together, respect elders, and maintain strong family bonds. 
                    Education and career growth are highly valued in our family.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
