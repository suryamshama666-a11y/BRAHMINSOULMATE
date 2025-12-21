import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, User, MapPin, Heart } from 'lucide-react';
import { format, subYears } from 'date-fns';
import { MIN_AGE, DEFAULT_CASTE } from '@/data/constants';
import { COUNTRIES, INDIAN_STATES_AND_DISTRICTS } from '@/data/locationData';

type BasicInfoStepProps = {
  data: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    gender: string;
    height: string;
    weight: string;
    maritalStatus: string;
    motherTongue: string;
    religion: string;
    caste: string;
    subcaste: string;
    gotra: string;
    location: {
      country: string;
      state: string;
      city: string;
    };
    contactNumber: string;
    alternateNumber: string;
  };
  onUpdate: (data: any) => void;
  onComplete: (isCompleted: boolean) => void;
};

const INDIAN_STATES = Object.keys(INDIAN_STATES_AND_DISTRICTS);

const BRAHMIN_SUBCASTES = [
  'Gaur', 'Deshastha', 'Iyer', 'Iyengar', 'Namboodiri', 'Kashmiri Pandit',
  'Maithil', 'Kanyakubja', 'Chitpavan', 'Saraswat', 'Havyaka', 'Smartha',
  'Vaidiki', 'Rigvedi', 'Other'
];

const GOTRAS = [
  'Bharadwaja', 'Kaashyapa', 'Vasishtha', 'Gautama', 'Atri', 'Vishvamitra',
  'Jamadagni', 'Angirasa', 'Agastya', 'Bhrigu', 'Shandilya', 'Kaushika',
  'Parashar', 'Vatsa', 'Other'
];

const MOTHER_TONGUES = [
  'Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Assamese', 'Sanskrit', 'Other'
];

export default function BasicInfoStep({ data, onUpdate, onComplete }: BasicInfoStepProps) {
  const [formData, setFormData] = useState(data);

  const updateFormData = (updates: any) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onUpdate(newData);
    
    // Check completion
    const isCompleted = newData.firstName && 
                       newData.lastName && 
                       newData.dateOfBirth && 
                       newData.gender && 
                       newData.height && 
                       newData.maritalStatus &&
                       newData.religion &&
                       newData.caste &&
                       newData.location.country &&
                       newData.location.state &&
                       newData.location.city &&
                       newData.contactNumber;
    onComplete(isCompleted);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                placeholder="Enter your first name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                placeholder="Enter your last name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Date of Birth *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? (
                      <>
                        {format(formData.dateOfBirth, "PPP")} 
                        <span className="ml-2 text-gray-500">
                          (Age: {calculateAge(formData.dateOfBirth)})
                        </span>
                      </>
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date) => updateFormData({ dateOfBirth: date })}
                      disabled={(date) => {
                        const minAge = formData.gender === 'male' ? MIN_AGE.MALE : MIN_AGE.FEMALE;
                        const maxBirthDate = subYears(new Date(), minAge);
                        return date > maxBirthDate || date < new Date("1950-01-01");
                      }}
                      initialFocus
                    />

                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Gender *</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => updateFormData({ gender: value })}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="height">Height *</Label>
              <Select value={formData.height} onValueChange={(value) => updateFormData({ height: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select height" />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({ length: 61 }, (_, i) => {
                      const height = 140 + i;
                      return (
                        <SelectItem key={height} value={height.toString()}>
                          {height} cm
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Weight (Optional)</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => updateFormData({ weight: e.target.value })}
                placeholder="Weight in kg"
                type="number"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Marital Status *</Label>
              <Select value={formData.maritalStatus} onValueChange={(value) => updateFormData({ maritalStatus: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Never Married">Never Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                  <SelectItem value="Separated">Separated</SelectItem>
                  <SelectItem value="Awaiting Divorce">Awaiting Divorce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mother Tongue</Label>
              <Select value={formData.motherTongue} onValueChange={(value) => updateFormData({ motherTongue: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select mother tongue" />
                </SelectTrigger>
                <SelectContent>
                  {MOTHER_TONGUES.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Religious Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Religious Information</h3>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Religion *</Label>
                <Select value={formData.religion} onValueChange={(value) => updateFormData({ religion: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Caste *</Label>
                <Select value={DEFAULT_CASTE} disabled>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={DEFAULT_CASTE} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DEFAULT_CASTE}>{DEFAULT_CASTE}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subcaste</Label>
                <Select value={formData.subcaste} onValueChange={(value) => updateFormData({ subcaste: value })}>

                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subcaste" />
                </SelectTrigger>
                <SelectContent>
                  {BRAHMIN_SUBCASTES.map((subcaste) => (
                    <SelectItem key={subcaste} value={subcaste}>
                      {subcaste}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Gotra</Label>
              <Select value={formData.gotra} onValueChange={(value) => updateFormData({ gotra: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gotra" />
                </SelectTrigger>
                <SelectContent>
                  {GOTRAS.map((gotra) => (
                    <SelectItem key={gotra} value={gotra}>
                      {gotra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Location Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold">Location Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Country *</Label>
                <Select 
                  value={formData.location.country} 
                  onValueChange={(value) => updateFormData({ 
                    location: { ...formData.location, country: value, state: '', city: '' } 
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.location.country === 'India' ? (
                <>
                  <div>
                    <Label>State *</Label>
                    <Select 
                      value={formData.location.state} 
                      onValueChange={(value) => updateFormData({ 
                        location: { ...formData.location, state: value, city: '' } 
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>District/City *</Label>
                    <Select 
                      value={formData.location.city} 
                      onValueChange={(value) => updateFormData({ 
                        location: { ...formData.location, city: value } 
                      })}
                      disabled={!formData.location.state}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.location.state && INDIAN_STATES_AND_DISTRICTS[formData.location.state]?.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>State/Province (Optional)</Label>
                    <Input
                      value={formData.location.state}
                      onChange={(e) => updateFormData({ 
                        location: { ...formData.location, state: e.target.value } 
                      })}
                      placeholder="Enter state/province"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>City *</Label>
                    <Input
                      value={formData.location.city}
                      onChange={(e) => updateFormData({ 
                        location: { ...formData.location, city: e.target.value } 
                      })}
                      placeholder="Enter your city"
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>


      {/* Contact Information */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => updateFormData({ contactNumber: e.target.value })}
                  placeholder="+91 9876543210"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="alternateNumber">Alternate Number (Optional)</Label>
                <Input
                  id="alternateNumber"
                  value={formData.alternateNumber}
                  onChange={(e) => updateFormData({ alternateNumber: e.target.value })}
                  placeholder="+91 9876543210"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
