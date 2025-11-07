
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';

interface FamilyInfoStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
  loading: boolean;
}

export const FamilyInfoStep: React.FC<FamilyInfoStepProps> = ({
  data,
  onNext,
  onBack,
  canGoBack,
  loading
}) => {
  const [formData, setFormData] = useState({
    family_type: data.family_type || '',
    father_name: data.father_name || '',
    father_occupation: data.father_occupation || '',
    mother_name: data.mother_name || '',
    mother_occupation: data.mother_occupation || '',
    siblings: data.siblings || 0,
    family_location: data.family_location || '',
    address: data.address || {
      street: '',
      city: '',
      state: '',
      country: 'India',
      pincode: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Family Type">
          <Select value={formData.family_type} onValueChange={(value) => updateField('family_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select family type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nuclear">Nuclear Family</SelectItem>
              <SelectItem value="joint">Joint Family</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Number of Siblings">
          <Input
            type="number"
            value={formData.siblings}
            onChange={(e) => updateField('siblings', parseInt(e.target.value) || 0)}
            min="0"
            placeholder="0"
          />
        </FormField>

        <FormField label="Father's Name">
          <Input
            value={formData.father_name}
            onChange={(e) => updateField('father_name', e.target.value)}
            placeholder="Father's name"
          />
        </FormField>

        <FormField label="Father's Occupation">
          <Input
            value={formData.father_occupation}
            onChange={(e) => updateField('father_occupation', e.target.value)}
            placeholder="Business, Job, Retired..."
          />
        </FormField>

        <FormField label="Mother's Name">
          <Input
            value={formData.mother_name}
            onChange={(e) => updateField('mother_name', e.target.value)}
            placeholder="Mother's name"
          />
        </FormField>

        <FormField label="Mother's Occupation">
          <Input
            value={formData.mother_occupation}
            onChange={(e) => updateField('mother_occupation', e.target.value)}
            placeholder="Homemaker, Job, Business..."
          />
        </FormField>

        <FormField label="Family Location">
          <Input
            value={formData.family_location}
            onChange={(e) => updateField('family_location', e.target.value)}
            placeholder="City, State"
          />
        </FormField>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Current Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Street Address">
            <Input
              value={formData.address.street}
              onChange={(e) => updateAddress('street', e.target.value)}
              placeholder="Street address"
            />
          </FormField>

          <FormField label="City">
            <Input
              value={formData.address.city}
              onChange={(e) => updateAddress('city', e.target.value)}
              placeholder="City"
            />
          </FormField>

          <FormField label="State">
            <Input
              value={formData.address.state}
              onChange={(e) => updateAddress('state', e.target.value)}
              placeholder="State"
            />
          </FormField>

          <FormField label="PIN Code">
            <Input
              value={formData.address.pincode}
              onChange={(e) => updateAddress('pincode', e.target.value)}
              placeholder="PIN Code"
            />
          </FormField>
        </div>
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
