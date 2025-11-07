
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FormField } from '@/components/ui/form-field';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilters {
  ageRange: [number, number];
  heightRange: [number, number];
  religion: string[];
  caste: string[];
  education: string[];
  occupation: string[];
  maritalStatus: string[];
  location: {
    city: string;
    state: string;
    country: string;
  };
  manglik: boolean | null;
  rashi: string[];
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateLocationFilter = (field: string, value: string) => {
    updateFilter('location', { ...filters.location, [field]: value });
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less Filters' : 'More Filters'}
            </Button>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Age Range">
            <div className="space-y-2">
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
                min={18}
                max={70}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{filters.ageRange[0]} years</span>
                <span>{filters.ageRange[1]} years</span>
              </div>
            </div>
          </FormField>

          <FormField label="Height Range (cm)">
            <div className="space-y-2">
              <Slider
                value={filters.heightRange}
                onValueChange={(value) => updateFilter('heightRange', value as [number, number])}
                min={140}
                max={200}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{filters.heightRange[0]} cm</span>
                <span>{filters.heightRange[1]} cm</span>
              </div>
            </div>
          </FormField>

          <FormField label="City">
            <Input
              value={filters.location.city}
              onChange={(e) => updateLocationFilter('city', e.target.value)}
              placeholder="Enter city"
            />
          </FormField>

          <FormField label="State">
            <Input
              value={filters.location.state}
              onChange={(e) => updateLocationFilter('state', e.target.value)}
              placeholder="Enter state"
            />
          </FormField>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Religion */}
              <div>
                <Label className="text-base font-medium mb-3 block">Religion</Label>
                <div className="space-y-2">
                  {['hindu', 'muslim', 'christian', 'sikh', 'buddhist', 'jain'].map((religion) => (
                    <div key={religion} className="flex items-center space-x-2">
                      <Checkbox
                        id={`religion-${religion}`}
                        checked={filters.religion.includes(religion)}
                        onCheckedChange={() => toggleArrayFilter('religion', religion)}
                      />
                      <Label htmlFor={`religion-${religion}`} className="capitalize">
                        {religion}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caste */}
              <div>
                <Label className="text-base font-medium mb-3 block">Caste</Label>
                <div className="space-y-2">
                  {['brahmin', 'kshatriya', 'vaishya', 'shudra'].map((caste) => (
                    <div key={caste} className="flex items-center space-x-2">
                      <Checkbox
                        id={`caste-${caste}`}
                        checked={filters.caste.includes(caste)}
                        onCheckedChange={() => toggleArrayFilter('caste', caste)}
                      />
                      <Label htmlFor={`caste-${caste}`} className="capitalize">
                        {caste}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <Label className="text-base font-medium mb-3 block">Education</Label>
                <div className="space-y-2">
                  {['high_school', 'diploma', 'bachelors', 'masters', 'phd'].map((education) => (
                    <div key={education} className="flex items-center space-x-2">
                      <Checkbox
                        id={`education-${education}`}
                        checked={filters.education.includes(education)}
                        onCheckedChange={() => toggleArrayFilter('education', education)}
                      />
                      <Label htmlFor={`education-${education}`} className="capitalize">
                        {education.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Occupation */}
              <div>
                <Label className="text-base font-medium mb-3 block">Occupation</Label>
                <div className="space-y-2">
                  {['software', 'doctor', 'engineer', 'teacher', 'business', 'government'].map((occupation) => (
                    <div key={occupation} className="flex items-center space-x-2">
                      <Checkbox
                        id={`occupation-${occupation}`}
                        checked={filters.occupation.includes(occupation)}
                        onCheckedChange={() => toggleArrayFilter('occupation', occupation)}
                      />
                      <Label htmlFor={`occupation-${occupation}`} className="capitalize">
                        {occupation}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marital Status */}
              <div>
                <Label className="text-base font-medium mb-3 block">Marital Status</Label>
                <div className="space-y-2">
                  {['never_married', 'divorced', 'widowed'].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`marital-${status}`}
                        checked={filters.maritalStatus.includes(status)}
                        onCheckedChange={() => toggleArrayFilter('maritalStatus', status)}
                      />
                      <Label htmlFor={`marital-${status}`} className="capitalize">
                        {status.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manglik Preference */}
              <div>
                <Label className="text-base font-medium mb-3 block">Manglik Preference</Label>
                <Select
                  value={filters.manglik === null ? 'any' : filters.manglik ? 'yes' : 'no'}
                  onValueChange={(value) => updateFilter('manglik', value === 'any' ? null : value === 'yes')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">No Preference</SelectItem>
                    <SelectItem value="yes">Only Manglik</SelectItem>
                    <SelectItem value="no">Only Non-Manglik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <Button onClick={onSearch} className="w-full bg-primary hover:bg-primary-dark text-white">
          <Search className="h-4 w-4 mr-2" />
          Search Profiles
        </Button>
      </CardContent>
    </Card>
  );
};
