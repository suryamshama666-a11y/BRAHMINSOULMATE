
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types/profile';
import { Briefcase, GraduationCap, Building, DollarSign } from 'lucide-react';

type ProfileProfessionalTabProps = {
  profile: Profile;
};

export default function ProfileProfessionalTab({ profile }: ProfileProfessionalTabProps) {
  console.log('ProfileProfessionalTab rendering with profile:', profile);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-red-600" />
              Education Background
            </h3>
            
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Degree</span>
                        <span className="font-medium">{edu.degree}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Field</span>
                        <span className="font-medium">Computer Science</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Institution</span>
                        <span className="font-medium">{edu.institution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year</span>
                        <span className="font-medium">{edu.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-red-600" />
              Professional Details
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profession</span>
                    <span className="font-medium">{profile.employment.profession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Designation</span>
                    <span className="font-medium">Senior Software Engineer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">5 years</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company</span>
                    <span className="font-medium">{profile.employment.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Work Location</span>
                    <span className="font-medium">Mumbai</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Income</span>
                    <span className="font-medium">{profile.employment.income}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-red-600" />
              Career Goals
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Professional Aspirations</h4>
                  <p className="text-blue-700 text-sm">
                    Looking to grow in my current field while maintaining a healthy work-life balance. 
                    I believe in continuous learning and professional development while prioritizing family values.
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
