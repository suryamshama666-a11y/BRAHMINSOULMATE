import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ArrowRight, User, Camera, Heart, Users, GraduationCap, Target, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ProfileSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isRequired: boolean;
  description: string;
  route: string;
};

type ProfileCompletionIndicatorProps = {
  profileData: {
    basicInfo: boolean;
    photos: boolean;
    aboutMe: boolean;
    family: boolean;
    educationCareer: boolean;
    preferences: boolean;
    contactPreferences: boolean;
  };
  onSectionClick?: (sectionId: string) => void;
  showActions?: boolean;
};

export default function ProfileCompletionIndicator({ 
  profileData, 
  onSectionClick,
  showActions = true 
}: ProfileCompletionIndicatorProps) {
  const navigate = useNavigate();

  const sections: ProfileSection[] = [
    {
      id: 'basicInfo',
      title: 'Basic Information',
      icon: <User className="h-4 w-4" />,
      isCompleted: profileData.basicInfo,
      isRequired: true,
      description: 'Personal details, location, and contact info',
      route: '/profile/setup?step=0'
    },
    {
      id: 'photos',
      title: 'Photos',
      icon: <Camera className="h-4 w-4" />,
      isCompleted: profileData.photos,
      isRequired: true,
      description: 'Profile pictures and photo gallery',
      route: '/profile/setup?step=1'
    },
    {
      id: 'aboutMe',
      title: 'About Me',
      icon: <Heart className="h-4 w-4" />,
      isCompleted: profileData.aboutMe,
      isRequired: true,
      description: 'Introduction, hobbies, and personality',
      route: '/profile/setup?step=2'
    },
    {
      id: 'family',
      title: 'Family Details',
      icon: <Users className="h-4 w-4" />,
      isCompleted: profileData.family,
      isRequired: true,
      description: 'Family background and values',
      route: '/profile/setup?step=3'
    },
    {
      id: 'educationCareer',
      title: 'Education & Career',
      icon: <GraduationCap className="h-4 w-4" />,
      isCompleted: profileData.educationCareer,
      isRequired: true,
      description: 'Educational background and profession',
      route: '/profile/setup?step=4'
    },
    {
      id: 'preferences',
      title: 'Partner Preferences',
      icon: <Target className="h-4 w-4" />,
      isCompleted: profileData.preferences,
      isRequired: true,
      description: 'What you are looking for in a partner',
      route: '/profile/setup?step=5'
    },
    {
      id: 'contactPreferences',
      title: 'Contact Preferences',
      icon: <Settings className="h-4 w-4" />,
      isCompleted: profileData.contactPreferences,
      isRequired: false,
      description: 'Privacy and notification settings',
      route: '/profile/setup?step=6'
    }
  ];

  const completedSections = sections.filter(s => s.isCompleted).length;
  const requiredSections = sections.filter(s => s.isRequired).length;
  const completedRequired = sections.filter(s => s.isRequired && s.isCompleted).length;
  
  const overallProgress = (completedSections / sections.length) * 100;
  const requiredProgress = (completedRequired / requiredSections) * 100;

  const getProfileStrength = () => {
    if (requiredProgress === 100 && overallProgress >= 85) return { label: 'Excellent', color: 'bg-green-500' };
    if (requiredProgress === 100) return { label: 'Good', color: 'bg-blue-500' };
    if (requiredProgress >= 80) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Weak', color: 'bg-red-500' };
  };

  const profileStrength = getProfileStrength();
  const nextIncompleteSection = sections.find(s => !s.isCompleted);

  const handleSectionClick = (section: ProfileSection) => {
    if (onSectionClick) {
      onSectionClick(section.id);
    } else {
      navigate(section.route);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Profile Completion
            <Badge className={`${profileStrength.color} text-white`}>
              {profileStrength.label}
            </Badge>
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(overallProgress)}%
            </div>
            <div className="text-sm text-gray-500">
              {completedSections}/{sections.length} sections
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Required Sections</span>
              <span className="text-sm text-gray-500">
                {completedRequired}/{requiredSections} complete
              </span>
            </div>
            <Progress value={requiredProgress} className="h-2" />
          </div>
        </div>

        {/* Section List */}
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                section.isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : section.isRequired 
                    ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${!section.isCompleted ? 'cursor-pointer' : ''}`}
              onClick={() => !section.isCompleted && handleSectionClick(section)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  section.isCompleted 
                    ? 'bg-green-500 text-white' 
                    : section.isRequired 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-400 text-white'
                }`}>
                  {section.isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    section.icon
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{section.title}</span>
                    {section.isRequired && !section.isCompleted && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
              
              {!section.isCompleted && (
                <ArrowRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-3 pt-4 border-t">
            {nextIncompleteSection && (
              <Button 
                onClick={() => handleSectionClick(nextIncompleteSection)}
                className="w-full"
              >
                Complete {nextIncompleteSection.title}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            
            {requiredProgress === 100 && overallProgress < 100 && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile/setup')}
                className="w-full"
              >
                Complete Optional Sections
              </Button>
            )}

            {overallProgress === 100 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Profile Complete!</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your profile is now live and visible to potential matches
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Profile Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {requiredProgress < 100 && (
                  <li>• Complete all required sections to make your profile visible</li>
                )}
                {profileData.photos && !profileData.aboutMe && (
                  <li>• Add a compelling introduction to attract more matches</li>
                )}
                {overallProgress < 80 && (
                  <li>• Complete more sections to improve your profile strength</li>
                )}
                <li>• Regular profile updates increase your visibility</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
