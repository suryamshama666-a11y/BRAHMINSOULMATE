import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MapPin, GraduationCap, Users } from 'lucide-react';

type PartnerPreferencesStepProps = {
  data: {
    ageRange: [number, number];
    heightRange: [number, number];
    maritalStatus: string[];
    education: string[];
    profession: string[];
    location: {
      countries: string[];
      states: string[];
      cities: string[];
      willingToRelocate: boolean;
    };
    lifestyle: {
      diet: string[];
      smoking: string;
      drinking: string;
    };
    family: {
      familyType: string[];
      familyValues: string;
    };
    religion: {
      caste: string[];
      subcaste: string[];
      gotra: string[];
      manglik: string;
    };
    dealBreakers: string;
    additionalPreferences: string;
  };
  onUpdate: (data: any) => void;
  onComplete: (isCompleted: boolean) => void;
};

const EDUCATION_OPTIONS = [
  'High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 
  'PhD', 'Professional Degree', 'Any Graduate', 'Post Graduate'
];

const PROFESSION_OPTIONS = [
  'Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Lawyer',
  'Chartered Accountant', 'Government Employee', 'Private Employee',
  'Consultant', 'Architect', 'Designer', 'Any Professional'
];

const CASTE_OPTIONS = [
  'Brahmin', 'Kshatriya', 'Vaishya', 'Any Caste', 'Caste No Bar'
];

const _SUBCASTE_OPTIONS = [
  'Gaur', 'Deshastha', 'Iyer', 'Iyengar', 'Namboodiri', 'Kashmiri Pandit',
  'Maithil', 'Kanyakubja', 'Chitpavan', 'Any Subcaste'
];

export default function PartnerPreferencesStep({ data, onUpdate, onComplete }: PartnerPreferencesStepProps) {
  const [preferences, setPreferences] = useState(data);

  const updatePreferences = (updates: any) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    onUpdate(newPreferences);
    
    // Check completion - basic preferences are required
    const isCompleted = newPreferences.ageRange[0] > 0 && 
                       newPreferences.heightRange[0] > 0 &&
                       newPreferences.education.length > 0;
    onComplete(isCompleted);
  };

  const toggleArrayItem = (array: string[], item: string, key: string) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    updatePreferences({ [key]: newArray });
  };

  return (
    <div className="space-y-6">
      {/* Basic Preferences */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Basic Preferences</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Age Range *</Label>
              <div className="mt-2">
                <Slider
                  value={preferences.ageRange}
                  onValueChange={(value) => updatePreferences({ ageRange: value })}
                  min={18}
                  max={60}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{preferences.ageRange[0]} years</span>
                  <span>{preferences.ageRange[1]} years</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Height Range</Label>
              <div className="mt-2">
                <Slider
                  value={preferences.heightRange}
                  onValueChange={(value) => updatePreferences({ heightRange: value })}
                  min={140}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{preferences.heightRange[0]} cm</span>
                  <span>{preferences.heightRange[1]} cm</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Marital Status</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Never Married', 'Divorced', 'Widowed'].map((status) => (
                  <Badge
                    key={status}
                    variant={preferences.maritalStatus.includes(status) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(preferences.maritalStatus, status, 'maritalStatus')}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education & Career */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Education & Career</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Education Level * (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EDUCATION_OPTIONS.map((edu) => (
                  <Badge
                    key={edu}
                    variant={preferences.education.includes(edu) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(preferences.education, edu, 'education')}
                  >
                    {edu}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Profession (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PROFESSION_OPTIONS.map((prof) => (
                  <Badge
                    key={prof}
                    variant={preferences.profession.includes(prof) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(preferences.profession, prof, 'profession')}
                  >
                    {prof}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Preferences */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Location Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="relocate"
                checked={preferences.location.willingToRelocate}
                onCheckedChange={(checked) => 
                  updatePreferences({ 
                    location: { ...preferences.location, willingToRelocate: checked } 
                  })
                }
              />
              <Label htmlFor="relocate">Willing to relocate after marriage</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Preferred Countries</Label>
                <Select onValueChange={(value) => {
                  const countries = preferences.location.countries.includes(value) 
                    ? preferences.location.countries 
                    : [...preferences.location.countries, value];
                  updatePreferences({ location: { ...preferences.location, countries } });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preferred States</Label>
                <Select onValueChange={(value) => {
                  const states = preferences.location.states.includes(value) 
                    ? preferences.location.states 
                    : [...preferences.location.states, value];
                  updatePreferences({ location: { ...preferences.location, states } });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preferred Cities</Label>
                <Select onValueChange={(value) => {
                  const cities = preferences.location.cities.includes(value) 
                    ? preferences.location.cities 
                    : [...preferences.location.cities, value];
                  updatePreferences({ location: { ...preferences.location, cities } });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle Preferences */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Lifestyle & Values</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Diet Preference</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain Vegetarian'].map((diet) => (
                  <Badge
                    key={diet}
                    variant={preferences.lifestyle.diet.includes(diet) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(preferences.lifestyle.diet, diet, 'lifestyle')}
                  >
                    {diet}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Family Type</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Nuclear Family', 'Joint Family', 'Any'].map((type) => (
                  <Badge
                    key={type}
                    variant={preferences.family.familyType.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(preferences.family.familyType, type, 'familyType')}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Smoking</Label>
              <Select value={preferences.lifestyle.smoking} onValueChange={(value) => 
                updatePreferences({ lifestyle: { ...preferences.lifestyle, smoking: value } })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Occasionally">Occasionally</SelectItem>
                  <SelectItem value="No Preference">No Preference</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Drinking</Label>
              <Select value={preferences.lifestyle.drinking} onValueChange={(value) => 
                updatePreferences({ lifestyle: { ...preferences.lifestyle, drinking: value } })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Socially">Socially</SelectItem>
                  <SelectItem value="No Preference">No Preference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Religious Preferences */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Religious Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Caste Preference</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CASTE_OPTIONS.map((caste) => (
                    <Badge
                      key={caste}
                      variant={preferences.religion.caste.includes(caste) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem(preferences.religion.caste, caste, 'caste')}
                    >
                      {caste}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Manglik Preference</Label>
                <Select value={preferences.religion.manglik} onValueChange={(value) => 
                  updatePreferences({ religion: { ...preferences.religion, manglik: value } })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manglik">Manglik</SelectItem>
                    <SelectItem value="Non-Manglik">Non-Manglik</SelectItem>
                    <SelectItem value="No Preference">No Preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Preferences */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="dealBreakers">Deal Breakers (Optional)</Label>
              <Textarea
                id="dealBreakers"
                placeholder="Mention any specific deal breakers or things you absolutely cannot compromise on..."
                value={preferences.dealBreakers}
                onChange={(e) => updatePreferences({ dealBreakers: e.target.value })}
                className="mt-2"
                maxLength={300}
              />
            </div>

            <div>
              <Label htmlFor="additional">Additional Preferences (Optional)</Label>
              <Textarea
                id="additional"
                placeholder="Any other preferences or requirements you'd like to mention..."
                value={preferences.additionalPreferences}
                onChange={(e) => updatePreferences({ additionalPreferences: e.target.value })}
                className="mt-2"
                maxLength={300}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
