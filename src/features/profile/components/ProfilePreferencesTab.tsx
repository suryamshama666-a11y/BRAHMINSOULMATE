
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types/profile';
import { Heart, Users, MapPin, Calendar } from 'lucide-react';

type ProfilePreferencesTabProps = {
  profile: Profile;
};

export default function ProfilePreferencesTab({ profile }: ProfilePreferencesTabProps) {
  console.log('ProfilePreferencesTab rendering with profile:', profile);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-600" />
              Partner Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Basic Preferences
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age Range</span>
                    <span className="font-medium">25 - 32 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Height Range</span>
                    <span className="font-medium">5'4" - 6'0"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marital Status</span>
                    <span className="font-medium">Never Married</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manglik</span>
                    <span className="font-medium">No Preference</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location & Lifestyle
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">India, USA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Willing to Relocate</span>
                    <span className="font-medium">Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diet</span>
                    <span className="font-medium">Vegetarian</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Smoking</span>
                    <span className="font-medium">No</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-red-600" />
              Professional & Education
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Education</span>
                    <span className="font-medium">Graduate & Above</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profession</span>
                    <span className="font-medium">Any</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Working Status</span>
                    <span className="font-medium">Working</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Income</span>
                    <span className="font-medium">₹5 Lakhs & Above</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company Type</span>
                    <span className="font-medium">Any</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Work Location</span>
                    <span className="font-medium">Flexible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">What I'm Looking For</h4>
                <p className="text-blue-700 text-sm">
                  I'm looking for a life partner who shares similar values, is family-oriented, 
                  and believes in mutual respect and understanding. Someone who is ambitious, 
                  kind-hearted, and ready to build a beautiful future together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
