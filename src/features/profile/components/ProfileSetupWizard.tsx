import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import BasicInfoStep from './setup-steps/BasicInfoStep';
import PhotoUploadStep from './setup-steps/PhotoUploadStep';
import AboutMeStep from './setup-steps/AboutMeStep';
import FamilyDetailsStep from './setup-steps/FamilyDetailsStep';
import EducationCareerStep from './setup-steps/EducationCareerStep';
import PartnerPreferencesStep from './setup-steps/PartnerPreferencesStep';
import ContactPreferencesStep from './setup-steps/ContactPreferencesStep';

type SetupStep = {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isCompleted: boolean;
  isRequired: boolean;
};

type ProfileSetupWizardProps = {
  onComplete: () => void;
};

export default function ProfileSetupWizard({ onComplete }: ProfileSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({
    basicInfo: {
      firstName: '', lastName: '', dateOfBirth: null, gender: '', height: '', weight: '',
      maritalStatus: '', motherTongue: '', religion: '', caste: '', subcaste: '', gotra: '',
      location: { country: '', state: '', city: '' }, contactNumber: '', alternateNumber: ''
    },
    photos: { photos: [] },
    aboutMe: { introduction: '', hobbies: [], interests: [], lifeGoals: '', personalityTraits: [] },
    family: {
      fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
      siblings: { brothers: 0, sisters: 0, marriedBrothers: 0, marriedSisters: 0 },
      familyType: '', familyValues: '', familyIncome: '', familyLocation: '', aboutFamily: ''
    },
    educationCareer: {
      education: [], currentOccupation: '', designation: '', company: '', workLocation: '',
      experience: '', annualIncome: '', workingWith: '', aboutCareer: ''
    },
    preferences: {
      ageRange: [25, 35], heightRange: [150, 180], maritalStatus: [], education: [], profession: [],
      location: { countries: [], states: [], cities: [], willingToRelocate: false },
      lifestyle: { diet: [], smoking: '', drinking: '' },
      family: { familyType: [], familyValues: '' },
      religion: { caste: [], subcaste: [], gotra: [], manglik: '' },
      dealBreakers: '', additionalPreferences: ''
    },
    contactPreferences: {
      profileVisibility: 'everyone',
      contactPermissions: { allowMessages: true, allowCalls: false, allowVideoChat: false, allowInterestRequests: true },
      notifications: { emailNotifications: true, smsNotifications: false, pushNotifications: true, matchAlerts: true, messageAlerts: true, profileViewAlerts: false },
      privacy: { hideContactInfo: true, hideLastSeen: false, hideProfileViews: false, allowPhotoDownload: false },
      responseTime: 'daily', preferredContactMethod: 'messages'
    }
  });
  const [stepCompletion, setStepCompletion] = useState({
    basicInfo: false, photos: false, aboutMe: false, family: false, educationCareer: false, preferences: false, contactPreferences: true
  });

  const updateStepData = (stepKey: string, data: any) => {
    setStepData(prev => ({ ...prev, [stepKey]: data }));
  };

  const updateStepCompletion = (stepKey: string, isCompleted: boolean) => {
    setStepCompletion(prev => ({ ...prev, [stepKey]: isCompleted }));
  };

  const steps: SetupStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Tell us about yourself',
      component: (
        <BasicInfoStep
          data={stepData.basicInfo}
          onUpdate={(data) => updateStepData('basicInfo', data)}
          onComplete={(completed) => updateStepCompletion('basicInfo', completed)}
        />
      ),
      isCompleted: stepCompletion.basicInfo,
      isRequired: true
    },
    {
      id: 'photos',
      title: 'Upload Profile Pics',
      description: 'Add your best photos',
      component: (
        <PhotoUploadStep
          data={stepData.photos}
          onUpdate={(data) => updateStepData('photos', data)}
          onComplete={(completed) => updateStepCompletion('photos', completed)}
        />
      ),
      isCompleted: stepCompletion.photos,
      isRequired: true
    },
    {
      id: 'about-me',
      title: 'About Me',
      description: 'Write your introduction',
      component: (
        <AboutMeStep
          data={stepData.aboutMe}
          onUpdate={(data) => updateStepData('aboutMe', data)}
          onComplete={(completed) => updateStepCompletion('aboutMe', completed)}
        />
      ),
      isCompleted: stepCompletion.aboutMe,
      isRequired: true
    },
    {
      id: 'family',
      title: 'Family Details',
      description: 'Share about your family',
      component: (
        <FamilyDetailsStep
          data={stepData.family}
          onUpdate={(data) => updateStepData('family', data)}
          onComplete={(completed) => updateStepCompletion('family', completed)}
        />
      ),
      isCompleted: stepCompletion.family,
      isRequired: true
    },
    {
      id: 'education-career',
      title: 'Education & Career',
      description: 'Your professional background',
      component: (
        <EducationCareerStep
          data={stepData.educationCareer}
          onUpdate={(data) => updateStepData('educationCareer', data)}
          onComplete={(completed) => updateStepCompletion('educationCareer', completed)}
        />
      ),
      isCompleted: stepCompletion.educationCareer,
      isRequired: true
    },
    {
      id: 'preferences',
      title: 'Partner Preferences',
      description: 'What you are looking for',
      component: (
        <PartnerPreferencesStep
          data={stepData.preferences}
          onUpdate={(data) => updateStepData('preferences', data)}
          onComplete={(completed) => updateStepCompletion('preferences', completed)}
        />
      ),
      isCompleted: stepCompletion.preferences,
      isRequired: true
    },
    {
      id: 'contact-preferences',
      title: 'Contact Preferences',
      description: 'How others can reach you',
      component: (
        <ContactPreferencesStep
          data={stepData.contactPreferences}
          onUpdate={(data) => updateStepData('contactPreferences', data)}
          onComplete={(completed) => updateStepCompletion('contactPreferences', completed)}
        />
      ),
      isCompleted: stepCompletion.contactPreferences,
      isRequired: false
    }
  ];

  const progress = (steps.filter(s => s.isCompleted).length / steps.length) * 100;
  const canProceed = steps[currentStep].isCompleted || !steps[currentStep].isRequired;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on completed steps or the current step
    if (stepIndex <= currentStep || steps[stepIndex].isCompleted) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Profile
        </h1>
        <p className="text-gray-600">
          Let's set up your profile to help you find your perfect match
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex justify-between items-center mb-8 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex flex-col items-center cursor-pointer min-w-0 flex-1"
            onClick={() => handleStepClick(index)}
          >
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 transition-colors
              ${index === currentStep 
                ? 'border-red-500 bg-red-500 text-white' 
                : step.isCompleted 
                  ? 'border-green-500 bg-green-500 text-white'
                  : index < currentStep
                    ? 'border-gray-300 bg-gray-100 text-gray-600 hover:border-gray-400'
                    : 'border-gray-300 bg-white text-gray-400'
              }
            `}>
              {step.isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="text-center">
              <p className={`text-xs font-medium truncate ${
                index === currentStep ? 'text-red-600' : 
                step.isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep].title}
            {steps[currentStep].isRequired && (
              <span className="text-red-500 text-sm">*</span>
            )}
          </CardTitle>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {steps[currentStep].component}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {!isLastStep && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(steps.length - 1)}
            >
              Skip to End
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            {isLastStep ? 'Complete Profile' : 'Next'}
            {!isLastStep && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Need help? <a href="/help" className="text-red-600 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}


