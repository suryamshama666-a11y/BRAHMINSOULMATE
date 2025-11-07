
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { User, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface PersonalDetailsFormProps {
  onCancel: () => void;
}

export const PersonalDetailsForm = ({ onCancel }: PersonalDetailsFormProps) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone_number || '+91 9876543210',
    dateOfBirth: profile?.date_of_birth || '1995-04-15',
    address: profile?.address ? JSON.stringify(profile.address) : '123 MG Road, Bangalore',
    occupation: profile?.occupation || 'Software Engineer'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      toast.success('Personal details updated successfully!');
      onCancel();
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-2 border-primary/20 bg-white">
      <CardHeader className="bg-orange-50 border-b border-primary/20">
        <CardTitle className="text-red-700 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Edit Personal Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField label="Full Name" required>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="border-red-200 focus:border-red-400"
              />
            </FormField>
            
            <FormField label="Email Address" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="border-red-200 focus:border-red-400"
              />
            </FormField>
            
            <FormField label="Phone Number">
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="border-red-200 focus:border-red-400"
              />
            </FormField>
            
            <FormField label="Date of Birth">
              <Input
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="border-red-200 focus:border-red-400"
              />
            </FormField>
            
            <FormField label="Address">
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="border-red-200 focus:border-red-400"
              />
            </FormField>
            
            <FormField label="Occupation">
              <Input
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="border-red-200 focus:border-red-400"
              />
            </FormField>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
