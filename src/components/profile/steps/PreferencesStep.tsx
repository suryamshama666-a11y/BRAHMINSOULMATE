
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';

interface PreferencesStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
  loading: boolean;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  data,
  onNext,
  onBack,
  canGoBack,
  loading
}) => {
  const [formData, setFormData] = useState({
    partner_preferences: data.partner_preferences || {
      age_range: { min: 21, max: 35 },
      height_range: { min: 150, max: 180 },
      education_levels: [],
      occupations: [],
      religions: [],
      castes: [],
      marital_statuses: [],
      manglik_preference: null,
      location_preferences: {
        countries: ['India'],
        states: [],
        cities: []
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const updatePreference = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      partner_preferences: {
        ...prev.partner_preferences,
        [field]: value
      }
    }));
  };

  const updateAgeRange = (type: 'min' | 'max', value: number) => {
    setFormData(prev => ({
      ...prev,
      partner_preferences: {
        ...prev.partner_preferences,
        age_range: {
          ...prev.partner_preferences.age_range,
          [type]: value
        }
      }
    }));
  };

  const updateHeightRange = (type: 'min' | 'max', value: number) => {
    setFormData(prev => ({
      ...prev,
      partner_preferences: {
        ...prev.partner_preferences,
        height_range: {
          ...prev.partner_preferences.height_range,
          [type]: value
        }
      }
    }));
  };

  const toggleArrayPreference = (field: string, value: string) => {
    const currentArray = formData.partner_preferences[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value];
    updatePreference(field, newArray);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold mb-4">Age Preference</h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Minimum Age">
              <Input
                type="number"
                value={formData.partner_preferences.age_range.min}
                onChange={(e) => updateAgeRange('min', parseInt(e.target.value))}
                min="18"
                max="70"
              />
            </FormField>
            <FormField label="Maximum Age">
              <Input
                type="number"
                value={formData.partner_preferences.age_range.max}
                onChange={(e) => updateAgeRange('max', parseInt(e.target.value))}
                min="18"
                max="70"
              />
            </FormField>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Height Preference (cm)</h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Minimum Height">
              <Input
                type="number"
                value={formData.partner_preferences.height_range.min}
                onChange={(e) => updateHeightRange('min', parseInt(e.target.value))}
                min="100"
                max="250"
              />
            </FormField>
            <FormField label="Maximum Height">
              <Input
                type="number"
                value={formData.partner_preferences.height_range.max}
                onChange={(e) => updateHeightRange('max', parseInt(e.target.value))}
                min="100"
                max="250"
              />
            </FormField>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Education Preferences</h4>
          <div className="grid grid-cols-2 gap-2">
            {['high_school', 'diploma', 'bachelors', 'masters', 'phd'].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`education-${level}`}
                  checked={formData.partner_preferences.education_levels?.includes(level)}
                  onCheckedChange={() => toggleArrayPreference('education_levels', level)}
                />
                <Label htmlFor={`education-${level}`} className="capitalize">
                  {level.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Occupation Preferences</h4>
          <div className="grid grid-cols-2 gap-2">
            {['software', 'doctor', 'engineer', 'teacher', 'business', 'government'].map((occupation) => (
              <div key={occupation} className="flex items-center space-x-2">
                <Checkbox
                  id={`occupation-${occupation}`}
                  checked={formData.partner_preferences.occupations?.includes(occupation)}
                  onCheckedChange={() => toggleArrayPreference('occupations', occupation)}
                />
                <Label htmlFor={`occupation-${occupation}`} className="capitalize">
                  {occupation}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Marital Status Preferences</h4>
          <div className="grid grid-cols-2 gap-2">
            {['never_married', 'divorced', 'widowed'].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`marital-${status}`}
                  checked={formData.partner_preferences.marital_statuses?.includes(status)}
                  onCheckedChange={() => toggleArrayPreference('marital_statuses', status)}
                />
                <Label htmlFor={`marital-${status}`} className="capitalize">
                  {status.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <FormField label="Manglik Preference">
          <Select
            value={formData.partner_preferences.manglik_preference || ''}
            onValueChange={(value) => updatePreference('manglik_preference', value === 'any' ? null : value === 'yes')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select manglik preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">No Preference</SelectItem>
              <SelectItem value="yes">Only Manglik</SelectItem>
              <SelectItem value="no">Only Non-Manglik</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={!canGoBack}
        >
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          Next
        </Button>
      </div>
    </form>
  );
};
