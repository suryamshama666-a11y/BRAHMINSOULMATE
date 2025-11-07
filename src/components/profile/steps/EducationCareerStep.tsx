
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';

interface EducationCareerStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
  loading: boolean;
}

export const EducationCareerStep: React.FC<EducationCareerStepProps> = ({
  data,
  onNext,
  onBack,
  canGoBack,
  loading
}) => {
  const [formData, setFormData] = useState({
    education_level: data.education_level || '',
    education_details: data.education_details || '',
    occupation: data.occupation || '',
    company_name: data.company_name || '',
    annual_income: data.annual_income || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Education Level">
          <Select value={formData.education_level} onValueChange={(value) => updateField('education_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high_school">High School</SelectItem>
              <SelectItem value="diploma">Diploma</SelectItem>
              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
              <SelectItem value="masters">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Occupation">
          <Select value={formData.occupation} onValueChange={(value) => updateField('occupation', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select occupation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="software">Software/IT</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="engineer">Engineer</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Company/Organization">
          <Input
            value={formData.company_name}
            onChange={(e) => updateField('company_name', e.target.value)}
            placeholder="Company name"
          />
        </FormField>

        <FormField label="Annual Income (₹)">
          <Input
            type="number"
            value={formData.annual_income}
            onChange={(e) => updateField('annual_income', parseInt(e.target.value))}
            placeholder="500000"
          />
        </FormField>
      </div>

      <FormField label="Education Details" description="Provide details about your educational background">
        <Textarea
          value={formData.education_details}
          onChange={(e) => updateField('education_details', e.target.value)}
          placeholder="University name, degree, year of completion, etc."
          className="min-h-[100px]"
        />
      </FormField>

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
