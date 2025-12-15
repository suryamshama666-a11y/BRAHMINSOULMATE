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

const COUNTRIES = [
  { value: 'india', label: 'India' },
  { value: 'usa', label: 'USA' },
  { value: 'uk', label: 'UK' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'new_zealand', label: 'New Zealand' },
  { value: 'ireland', label: 'Ireland' },
  { value: 'europe', label: 'Europe' },
];

const GOTRAS = [
  'Agastya', 'Angirasa', 'Atri', 'Bharadwaja', 'Bhargava', 'Bhrigu',
  'Dhanvantari', 'Gautama', 'Gritsamada', 'Jamadagni', 'Kaashyapa', 'Kaushika',
  'Kutsa', 'Maitreya', 'Marichi', 'Mudgala', 'Parashar', 'Pulaha',
  'Pulastya', 'Sankrithi', 'Shandilya', 'Upamanyu', 'Vasishtha', 'Vatsa',
  'Vishvamitra', 'Other'
];

const BRAHMIN_COMMUNITIES = [
  'Adi Gaur', 'Anavil', 'Andhra Brahmin', 'Babburu', 'Bardai', 'Barendra',
  'Bhatt', 'Bhumihar', 'Chitpavan', 'Dadhich', 'Daivadnya', 'Danua',
  'Deshastha', 'Devarukhe', 'Dhima', 'Dravida', 'Gaur', 'Gowd Saraswat',
  'Gurukkal', 'Havyaka', 'Hoysala', 'Iyer', 'Iyengar', 'Jangid', 'Jhadua',
  'Jyotish', 'Kanyakubja', 'Karhade', 'Kashmiri Pandit', 'Kokanastha',
  'Kota', 'Kulin', 'Maithil', 'Nagar', 'Namboodiri', 'Niyogi', 'Panda',
  'Rarhi', 'Rigvedi', 'Sakaldwipi', 'Sanadya', 'Sanketi', 'Saryuparin',
  'Smartha', 'Sri Vaishnava', 'Sthanika', 'Tyagi', 'Uriya', 'Vaidiki',
  'Velanadu', 'Viswa', 'Other'
];

const MARRIAGE_TIMELINE = [
  { value: '3_months', label: 'Within 3 months' },
  { value: '6_months', label: 'Within 6 months' },
  { value: '1_year', label: 'Within 1 year' },
  { value: '2_years', label: 'Within 2 years' },
  { value: 'not_decided', label: 'Not Decided' },
  { value: 'flexible', label: 'Flexible' },
];

const CURRENCIES = [
  { value: 'INR', label: '₹ Rupees', symbol: '₹' },
  { value: 'USD', label: '$ Dollar', symbol: '$' },
  { value: 'GBP', label: '£ Pound', symbol: '£' },
  { value: 'EUR', label: '€ Euro', symbol: '€' },
  { value: 'AUD', label: 'A$ AUD', symbol: 'A$' },
  { value: 'CAD', label: 'C$ CAD', symbol: 'C$' },
  { value: 'NZD', label: 'NZ$ NZD', symbol: 'NZ$' },
];

const INCOME_RANGES = {
  INR: [
    { value: '0-300000', label: 'Below 3 Lakhs' },
    { value: '300000-500000', label: '3-5 Lakhs' },
    { value: '500000-1000000', label: '5-10 Lakhs' },
    { value: '1000000-2000000', label: '10-20 Lakhs' },
    { value: '2000000-5000000', label: '20-50 Lakhs' },
    { value: '5000000-10000000', label: '50 Lakhs - 1 Crore' },
    { value: '10000000+', label: 'Above 1 Crore' },
  ],
  USD: [
    { value: '0-30000', label: 'Below $30K' },
    { value: '30000-50000', label: '$30K - $50K' },
    { value: '50000-75000', label: '$50K - $75K' },
    { value: '75000-100000', label: '$75K - $100K' },
    { value: '100000-150000', label: '$100K - $150K' },
    { value: '150000-250000', label: '$150K - $250K' },
    { value: '250000+', label: 'Above $250K' },
  ],
  GBP: [
    { value: '0-25000', label: 'Below £25K' },
    { value: '25000-40000', label: '£25K - £40K' },
    { value: '40000-60000', label: '£40K - £60K' },
    { value: '60000-80000', label: '£60K - £80K' },
    { value: '80000-120000', label: '£80K - £120K' },
    { value: '120000-200000', label: '£120K - £200K' },
    { value: '200000+', label: 'Above £200K' },
  ],
  EUR: [
    { value: '0-30000', label: 'Below €30K' },
    { value: '30000-50000', label: '€30K - €50K' },
    { value: '50000-75000', label: '€50K - €75K' },
    { value: '75000-100000', label: '€75K - €100K' },
    { value: '100000-150000', label: '€100K - €150K' },
    { value: '150000+', label: 'Above €150K' },
  ],
  AUD: [
    { value: '0-40000', label: 'Below A$40K' },
    { value: '40000-60000', label: 'A$40K - A$60K' },
    { value: '60000-90000', label: 'A$60K - A$90K' },
    { value: '90000-120000', label: 'A$90K - A$120K' },
    { value: '120000-180000', label: 'A$120K - A$180K' },
    { value: '180000+', label: 'Above A$180K' },
  ],
  CAD: [
    { value: '0-40000', label: 'Below C$40K' },
    { value: '40000-60000', label: 'C$40K - C$60K' },
    { value: '60000-90000', label: 'C$60K - C$90K' },
    { value: '90000-120000', label: 'C$90K - C$120K' },
    { value: '120000-180000', label: 'C$120K - C$180K' },
    { value: '180000+', label: 'Above C$180K' },
  ],
  NZD: [
    { value: '0-40000', label: 'Below NZ$40K' },
    { value: '40000-60000', label: 'NZ$40K - NZ$60K' },
    { value: '60000-90000', label: 'NZ$60K - NZ$90K' },
    { value: '90000-120000', label: 'NZ$90K - NZ$120K' },
    { value: '120000+', label: 'Above NZ$120K' },
  ],
};

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
  country: string[];
  gotra: string[];
  brahminCommunity: string[];
  incomeCurrency: string;
  incomeRange: string;
  marriageTimeline: string;
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
  const [gotraSearch, setGotraSearch] = useState('');
  const [communitySearch, setCommunitySearch] = useState('');

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateLocationFilter = (field: string, value: string) => {
    updateFilter('location', { ...filters.location, [field]: value });
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const filteredGotras = GOTRAS.filter(g => 
    g.toLowerCase().includes(gotraSearch.toLowerCase())
  );

  const filteredCommunities = BRAHMIN_COMMUNITIES.filter(c => 
    c.toLowerCase().includes(communitySearch.toLowerCase())
  );

  const currentIncomeRanges = INCOME_RANGES[filters.incomeCurrency as keyof typeof INCOME_RANGES] || INCOME_RANGES.INR;

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

          {/* Country Filter */}
          <FormField label="Country">
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {COUNTRIES.map((country) => (
                <div key={country.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`country-${country.value}`}
                    checked={(filters.country || []).includes(country.value)}
                    onCheckedChange={() => toggleArrayFilter('country', country.value)}
                  />
                  <Label htmlFor={`country-${country.value}`}>
                    {country.label}
                  </Label>
                </div>
              ))}
            </div>
          </FormField>

          {/* Marriage Timeline */}
          <FormField label="Wish to Marry">
            <Select
              value={filters.marriageTimeline || ''}
              onValueChange={(value) => updateFilter('marriageTimeline', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                {MARRIAGE_TIMELINE.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {/* Gotra Filter */}
              <div>
                <Label className="text-base font-medium mb-3 block">Gotra</Label>
                <Input
                  placeholder="Search gotra..."
                  value={gotraSearch}
                  onChange={(e) => setGotraSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {filteredGotras.map((gotra) => (
                    <div key={gotra} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gotra-${gotra}`}
                        checked={(filters.gotra || []).includes(gotra)}
                        onCheckedChange={() => toggleArrayFilter('gotra', gotra)}
                      />
                      <Label htmlFor={`gotra-${gotra}`}>
                        {gotra}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brahmin Community Filter */}
              <div>
                <Label className="text-base font-medium mb-3 block">Brahmin Community</Label>
                <Input
                  placeholder="Search community..."
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  className="mb-2"
                />
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {filteredCommunities.map((community) => (
                    <div key={community} className="flex items-center space-x-2">
                      <Checkbox
                        id={`community-${community}`}
                        checked={(filters.brahminCommunity || []).includes(community)}
                        onCheckedChange={() => toggleArrayFilter('brahminCommunity', community)}
                      />
                      <Label htmlFor={`community-${community}`}>
                        {community}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Income Filter with Currency */}
              <div>
                <Label className="text-base font-medium mb-3 block">Annual Income</Label>
                <div className="space-y-3">
                  <Select
                    value={filters.incomeCurrency || 'INR'}
                    onValueChange={(value) => {
                      updateFilter('incomeCurrency', value);
                      updateFilter('incomeRange', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.incomeRange || ''}
                    onValueChange={(value) => updateFilter('incomeRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select income range" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentIncomeRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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