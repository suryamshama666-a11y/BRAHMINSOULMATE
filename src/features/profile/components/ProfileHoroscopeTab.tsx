
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types/profile';
import { CompatibilityScore } from '@/components/compatibility/CompatibilityScore';
import { Star, Calendar, Moon, Sun } from 'lucide-react';
import { logger } from '@/utils/logger';

type ProfileHoroscopeTabProps = {
  profile: Profile;
};

export default function ProfileHoroscopeTab({ profile }: ProfileHoroscopeTabProps) {
  logger.log('ProfileHoroscopeTab rendering with profile:', profile);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-red-600" />
                Horoscope Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Birth Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth</span>
                      <span className="font-medium">15th March, 1995</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time of Birth</span>
                      <span className="font-medium">10:30 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Place of Birth</span>
                      <span className="font-medium">Mumbai, Maharashtra</span>
                    </div>
                    {profile.horoscope?.rashi && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rashi (Moon Sign)</span>
                        <span className="font-medium">{profile.horoscope.rashi}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Sun className="h-4 w-4 mr-1" />
                    Astrological Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nakshatra</span>
                      <span className="font-medium">Rohini</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Charan</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gan</span>
                      <span className="font-medium">Manushya</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nadi</span>
                      <span className="font-medium">Madhya</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Moon className="h-5 w-5 mr-2 text-red-600" />
                Manglik & Doshas
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {profile.horoscope?.manglik !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manglik Status</span>
                        <span className={`font-medium ${profile.horoscope.manglik ? 'text-orange-600' : 'text-green-600'}`}>
                          {profile.horoscope.manglik ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kaal Sarp Dosha</span>
                      <span className="font-medium text-green-600">No</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sadhesati</span>
                      <span className="font-medium text-green-600">No</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pitra Dosha</span>
                      <span className="font-medium text-green-600">No</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shani Dosha</span>
                      <span className="font-medium text-green-600">No</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horoscope Match</span>
                      <span className="font-medium text-blue-600">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Horoscope Verification</h4>
                  <p className="text-blue-700 text-sm">
                    This horoscope has been verified by our expert astrologers. 
                    For detailed compatibility analysis and match-making, please contact our astrological services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compatibility Score Component */}
      <CompatibilityScore 
        targetUserId={profile.id} 
        targetUserName={profile.name || 'User'}
      />
    </div>
  );
}
