
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { FamilyInfoStep } from './steps/FamilyInfoStep';
import { EducationCareerStep } from './steps/EducationCareerStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { HoroscopeStep } from './steps/HoroscopeStep';
import { PhotoUploadStep } from './steps/PhotoUploadStep';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

const steps = [
  { id: 'personal', title: 'Personal Information', component: PersonalInfoStep },
  { id: 'family', title: 'Family Details', component: FamilyInfoStep },
  { id: 'education', title: 'Education & Career', component: EducationCareerStep },
  { id: 'preferences', title: 'Partner Preferences', component: PreferencesStep },
  { id: 'horoscope', title: 'Horoscope Details', component: HoroscopeStep },
  { id: 'photos', title: 'Photos', component: PhotoUploadStep },
];

export const ProfileCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const { createProfile, updateProfile, loading } = useProfile();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = async (stepData: any) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    if (currentStep === steps.length - 1) {
      // Final step - create/update profile
      try {
        await createProfile(updatedData);
        toast.success('Profile created successfully!');
      } catch (error) {
        toast.error('Failed to create profile');
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-center text-primary">
            Complete Your Profile
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{steps[currentStep].title}</h3>
          </div>

          <CurrentStepComponent
            data={formData}
            onNext={handleNext}
            onBack={handleBack}
            canGoBack={currentStep > 0}
            isLastStep={currentStep === steps.length - 1}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
