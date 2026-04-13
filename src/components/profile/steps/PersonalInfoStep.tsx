
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';

interface PersonalInfoStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
  loading: boolean;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onNext,
  onBack,
  canGoBack,
  loading
}) => {
  const [formData, setFormData] = useState({
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    date_of_birth: data.date_of_birth || '',
    gender: data.gender || '',
    height: data.height || '',
    weight: data.weight || '',
    marital_status: data.marital_status || '',
    religion: data.religion || '',
    caste: data.caste || '',
    subcaste: data.subcaste || '',
    mother_tongue: data.mother_tongue || '',
    about_me: data.about_me || '',
    phone_number: data.phone_number || '',
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
        <FormField label="First Name" required>
          <Input
            value={formData.first_name}
            onChange={(e) => updateField('first_name', e.target.value)}
            required
          />
        </FormField>

        <FormField label="Last Name" required>
          <Input
            value={formData.last_name}
            onChange={(e) => updateField('last_name', e.target.value)}
            required
          />
        </FormField>

        <FormField label="Date of Birth" required>
          <Input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => updateField('date_of_birth', e.target.value)}
            required
          />
        </FormField>

        <FormField label="Gender" required>
          <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Height (cm)">
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => updateField('height', parseInt(e.target.value))}
            placeholder="170"
          />
        </FormField>

        <FormField label="Weight (kg)">
          <Input
            type="number"
            value={formData.weight}
            onChange={(e) => updateField('weight', parseInt(e.target.value))}
            placeholder="65"
          />
        </FormField>

        <FormField label="Marital Status" required>
          <Select value={formData.marital_status} onValueChange={(value) => updateField('marital_status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never_married">Never Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
              <SelectItem value="separated">Separated</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Religion" required>
          <Select value={formData.religion} onValueChange={(value) => updateField('religion', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select religion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hindu">Hindu</SelectItem>
              <SelectItem value="muslim">Muslim</SelectItem>
              <SelectItem value="christian">Christian</SelectItem>
              <SelectItem value="sikh">Sikh</SelectItem>
              <SelectItem value="buddhist">Buddhist</SelectItem>
              <SelectItem value="jain">Jain</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Caste">
          <Select value={formData.caste} onValueChange={(value) => updateField('caste', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select caste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brahmin">Brahmin</SelectItem>
              <SelectItem value="kshatriya">Kshatriya</SelectItem>
              <SelectItem value="vaishya">Vaishya</SelectItem>
              <SelectItem value="shudra">Shudra</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Subcaste">
          <Select value={formData.subcaste} onValueChange={(value) => updateField('subcaste', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select subcaste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aiyar">Aiyar</SelectItem>
              <SelectItem value="aiyangar">Aiyangar</SelectItem>
              <SelectItem value="smartha">Smartha</SelectItem>
              <SelectItem value="madhva">Madhva</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Mother Tongue">
          <Input
            value={formData.mother_tongue}
            onChange={(e) => updateField('mother_tongue', e.target.value)}
            placeholder="Tamil, Hindi, English..."
          />
        </FormField>

        <FormField label="Phone Number">
          <Input
            value={formData.phone_number}
            onChange={(e) => updateField('phone_number', e.target.value)}
            placeholder="+91 9876543210"
          />
        </FormField>
      </div>

      <FormField label="About Me" description="Tell others about yourself, your interests, and what you're looking for">
        <Textarea
          value={formData.about_me}
          onChange={(e) => updateField('about_me', e.target.value)}
          placeholder="Share a bit about yourself..."
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
