import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Home, Heart } from 'lucide-react';

type FamilyDetailsStepProps = {
  data: {
    fatherName: string;
    fatherOccupation: string;
    motherName: string;
    motherOccupation: string;
    siblings: {
      brothers: number;
      sisters: number;
      marriedBrothers: number;
      marriedSisters: number;
    };
    familyType: string;
    familyValues: string;
    familyIncome: string;
    familyLocation: string;
    aboutFamily: string;
  };
  onUpdate: (data: any) => void;
  onComplete: (isCompleted: boolean) => void;
};

const OCCUPATION_OPTIONS = [
  'Business', 'Government Service', 'Private Service', 'Professional',
  'Retired', 'Homemaker', 'Teacher', 'Doctor', 'Engineer', 'Lawyer',
  'Chartered Accountant', 'Consultant', 'Other'
];

const FAMILY_INCOME_RANGES = [
  'Below 2 Lakhs', '2-5 Lakhs', '5-10 Lakhs', '10-20 Lakhs',
  '20-50 Lakhs', '50 Lakhs - 1 Crore', 'Above 1 Crore', 'Prefer not to say'
];

export default function FamilyDetailsStep({ data, onUpdate, onComplete }: FamilyDetailsStepProps) {
  const [formData, setFormData] = useState(data);

  const updateFormData = (updates: any) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onUpdate(newData);
    
    // Check completion - basic family info required
    const isCompleted = newData.fatherName && 
                       newData.fatherOccupation && 
                       newData.motherName && 
                       newData.motherOccupation &&
                       newData.familyType &&
                       newData.familyValues;
    onComplete(isCompleted);
  };

  const updateSiblings = (field: string, value: number) => {
    const newSiblings = { ...formData.siblings, [field]: value };
    updateFormData({ siblings: newSiblings });
  };

  return (
    <div className="space-y-6">
      {/* Parents Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Parents Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fatherName">Father's Name *</Label>
              <Input
                id="fatherName"
                value={formData.fatherName}
                onChange={(e) => updateFormData({ fatherName: e.target.value })}
                placeholder="Enter father's name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Father's Occupation *</Label>
              <Select 
                value={formData.fatherOccupation} 
                onValueChange={(value) => updateFormData({ fatherOccupation: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select father's occupation" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATION_OPTIONS.map((occupation) => (
                    <SelectItem key={occupation} value={occupation}>
                      {occupation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="motherName">Mother's Name *</Label>
              <Input
                id="motherName"
                value={formData.motherName}
                onChange={(e) => updateFormData({ motherName: e.target.value })}
                placeholder="Enter mother's name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Mother's Occupation *</Label>
              <Select 
                value={formData.motherOccupation} 
                onValueChange={(value) => updateFormData({ motherOccupation: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select mother's occupation" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATION_OPTIONS.map((occupation) => (
                    <SelectItem key={occupation} value={occupation}>
                      {occupation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Siblings Information */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Siblings Information</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="brothers">Brothers</Label>
                <Select 
                  value={formData.siblings.brothers.toString()} 
                  onValueChange={(value) => updateSiblings('brothers', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="marriedBrothers">Married Brothers</Label>
                <Select 
                  value={formData.siblings.marriedBrothers.toString()} 
                  onValueChange={(value) => updateSiblings('marriedBrothers', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: formData.siblings.brothers + 1 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sisters">Sisters</Label>
                <Select 
                  value={formData.siblings.sisters.toString()} 
                  onValueChange={(value) => updateSiblings('sisters', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="marriedSisters">Married Sisters</Label>
                <Select 
                  value={formData.siblings.marriedSisters.toString()} 
                  onValueChange={(value) => updateSiblings('marriedSisters', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: formData.siblings.sisters + 1 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Background */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Home className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Family Background</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Family Type *</Label>
              <RadioGroup
                value={formData.familyType}
                onValueChange={(value) => updateFormData({ familyType: value })}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nuclear" id="nuclear" />
                  <Label htmlFor="nuclear">Nuclear Family</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="joint" id="joint" />
                  <Label htmlFor="joint">Joint Family</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Family Values *</Label>
              <RadioGroup
                value={formData.familyValues}
                onValueChange={(value) => updateFormData({ familyValues: value })}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="traditional" id="traditional" />
                  <Label htmlFor="traditional">Traditional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="liberal" id="liberal" />
                  <Label htmlFor="liberal">Liberal</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Family Income (Annual)</Label>
              <Select 
                value={formData.familyIncome} 
                onValueChange={(value) => updateFormData({ familyIncome: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select family income range" />
                </SelectTrigger>
                <SelectContent>
                  {FAMILY_INCOME_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="familyLocation">Family Location</Label>
              <Input
                id="familyLocation"
                value={formData.familyLocation}
                onChange={(e) => updateFormData({ familyLocation: e.target.value })}
                placeholder="City where your family lives"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Family */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">About Your Family</h3>
          </div>

          <div>
            <Label htmlFor="aboutFamily">Tell us about your family</Label>
            <Textarea
              id="aboutFamily"
              placeholder="Share about your family background, traditions, values, and what makes your family special..."
              value={formData.aboutFamily}
              onChange={(e) => updateFormData({ aboutFamily: e.target.value })}
              className="min-h-[100px] mt-2"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.aboutFamily.length}/500 characters
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-900 mb-2">What to include:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Family traditions and cultural practices</li>
              <li>• Family business or professional background</li>
              <li>• Values and principles your family follows</li>
              <li>• Any notable achievements or recognition</li>
              <li>• What makes your family unique</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="font-medium mb-2">Section Completion</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${formData.fatherName && formData.motherName ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Parents Information ({formData.fatherName && formData.motherName ? 'Complete' : 'Incomplete'})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${formData.fatherOccupation && formData.motherOccupation ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Parents Occupation ({formData.fatherOccupation && formData.motherOccupation ? 'Complete' : 'Incomplete'})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${formData.familyType && formData.familyValues ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Family Background ({formData.familyType && formData.familyValues ? 'Complete' : 'Incomplete'})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
