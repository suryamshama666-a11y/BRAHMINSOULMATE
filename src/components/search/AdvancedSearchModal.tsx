import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilters } from '@/hooks/useAdvancedSearch';

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

const OCCUPATIONS = [
  { value: 'software_engineer', label: 'Software Engineer / IT Professional' },
  { value: 'doctor', label: 'Doctor / Medical Professional' },
  { value: 'engineer', label: 'Engineer (Non-IT)' },
  { value: 'ca_accountant', label: 'CA / Chartered Accountant' },
  { value: 'lawyer', label: 'Lawyer / Legal Professional' },
  { value: 'teacher_professor', label: 'Teacher / Professor' },
  { value: 'government_employee', label: 'Government Employee' },
  { value: 'civil_services', label: 'Civil Services (IAS/IPS/IFS)' },
  { value: 'banker', label: 'Banker / Finance Professional' },
  { value: 'business_owner', label: 'Business Owner / Entrepreneur' },
  { value: 'scientist', label: 'Scientist / Researcher' },
  { value: 'architect', label: 'Architect' },
  { value: 'pilot', label: 'Pilot / Aviation' },
  { value: 'merchant_navy', label: 'Merchant Navy' },
  { value: 'defense', label: 'Defense / Armed Forces' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'manager', label: 'Manager / Executive' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'dentist', label: 'Dentist' },
  { value: 'physiotherapist', label: 'Physiotherapist' },
  { value: 'nurse', label: 'Nurse / Healthcare' },
  { value: 'journalist', label: 'Journalist / Media' },
  { value: 'artist', label: 'Artist / Designer' },
  { value: 'marketing', label: 'Marketing / Sales' },
  { value: 'hr_professional', label: 'HR Professional' },
  { value: 'data_scientist', label: 'Data Scientist / Analyst' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'agriculture', label: 'Agriculture / Farming' },
  { value: 'priest', label: 'Priest / Religious Professional' },
  { value: 'student', label: 'Student' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'not_working', label: 'Not Working Currently' },
  { value: 'other', label: 'Other' },
];

const MARRIAGE_TIMELINE = [
  { value: '3_months', label: 'Within 3 months' },
  { value: '6_months', label: 'Within 6 months' },
  { value: '1_year', label: 'Within 1 year' },
  { value: '2_years', label: 'Within 2 years' },
  { value: 'not_decided', label: 'Not Decided' },
  { value: 'flexible', label: 'Flexible' },
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
  CAD: [
    { value: '0-40000', label: 'Below C$40K' },
    { value: '40000-60000', label: 'C$40K - C$60K' },
    { value: '60000-90000', label: 'C$60K - C$90K' },
    { value: '90000-120000', label: 'C$90K - C$120K' },
    { value: '120000-180000', label: 'C$120K - C$180K' },
    { value: '180000+', label: 'Above C$180K' },
  ],
  AUD: [
    { value: '0-40000', label: 'Below A$40K' },
    { value: '40000-60000', label: 'A$40K - A$60K' },
    { value: '60000-90000', label: 'A$60K - A$90K' },
    { value: '90000-120000', label: 'A$90K - A$120K' },
    { value: '120000-180000', label: 'A$120K - A$180K' },
    { value: '180000+', label: 'Above A$180K' },
  ],
  NZD: [
    { value: '0-40000', label: 'Below NZ$40K' },
    { value: '40000-60000', label: 'NZ$40K - NZ$60K' },
    { value: '60000-90000', label: 'NZ$60K - NZ$90K' },
    { value: '90000-120000', label: 'NZ$90K - NZ$120K' },
    { value: '120000+', label: 'Above NZ$120K' },
  ],
};

interface AdvancedSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (filters: SearchFilters) => void;
  onSaveSearch: (name: string, filters: SearchFilters) => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  open,
  onOpenChange,
  onSearch,
  onSaveSearch,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    ageRange: [21, 35],
    heightRange: [150, 180],
    country: [],
    gotra: [],
    brahminCommunity: [],
    occupation: [],
  });

  const [saveSearchName, setSaveSearchName] = useState('');
  const [gotraSearch, setGotraSearch] = useState('');
  const [communitySearch, setCommunitySearch] = useState('');
  const [occupationSearch, setOccupationSearch] = useState('');

  const handleSearch = () => {
    onSearch(filters);
    onOpenChange(false);
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      onSaveSearch(saveSearchName, filters);
      setSaveSearchName('');
    }
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFilters({ ...filters, [key]: newArray });
  };

  const filteredGotras = GOTRAS.filter(g => 
    g.toLowerCase().includes(gotraSearch.toLowerCase())
  );

  const filteredCommunities = BRAHMIN_COMMUNITIES.filter(c => 
    c.toLowerCase().includes(communitySearch.toLowerCase())
  );

  const filteredOccupations = OCCUPATIONS.filter(o => 
    o.label.toLowerCase().includes(occupationSearch.toLowerCase())
  );

  const currentIncomeRanges = INCOME_RANGES[filters.income?.currency as keyof typeof INCOME_RANGES] || INCOME_RANGES.INR;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white border-2 border-orange-200">
        <DialogHeader className="border-b border-orange-200 bg-orange-50">
          <DialogTitle className="text-2xl font-bold text-gray-900 px-6 py-4">
            Advanced Search
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-orange-50 border border-orange-200 p-1 gap-1">
              {['basic', 'location', 'community', 'occupation', 'horoscope', 'preferences'].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-[#FF4500] data-[state=active]:text-white bg-white text-xs md:text-sm"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-4 bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Age Range</Label>
                  <Select 
                    value={`${filters.ageRange[0]}-${filters.ageRange[1]}`}
                    onValueChange={(value) => {
                      const [min, max] = value.split('-').map(Number);
                      setFilters({...filters, ageRange: [min, max]});
                    }}
                  >
                    <SelectTrigger className="bg-white border-orange-200">
                      <SelectValue placeholder="Age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-23">18 to 23</SelectItem>
                      <SelectItem value="20-25">20 to 25</SelectItem>
                      <SelectItem value="25-30">25 to 30</SelectItem>
                      <SelectItem value="30-35">30 to 35</SelectItem>
                      <SelectItem value="35-40">35 to 40</SelectItem>
                      <SelectItem value="40-45">40 to 45</SelectItem>
                      <SelectItem value="45-50">45 to 50</SelectItem>
                      <SelectItem value="50-55">50 to 55</SelectItem>
                      <SelectItem value="55-60">55 to 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Height Range</Label>
                  <Select 
                    value={`${filters.heightRange[0]}-${filters.heightRange[1]}`}
                    onValueChange={(value) => {
                      const [min, max] = value.split('-').map(Number);
                      setFilters({...filters, heightRange: [min, max]});
                    }}
                  >
                    <SelectTrigger className="bg-white border-orange-200">
                      <SelectValue placeholder="Height" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="140-150">140 to 150 cm</SelectItem>
                      <SelectItem value="150-160">150 to 160 cm</SelectItem>
                      <SelectItem value="160-170">160 to 170 cm</SelectItem>
                      <SelectItem value="170-180">170 to 180 cm</SelectItem>
                      <SelectItem value="180-190">180 to 190 cm</SelectItem>
                      <SelectItem value="190-200">190 to 200 cm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Marital Status</Label>
                  <Select onValueChange={(value) => setFilters({...filters, maritalStatus: [value]})}>
                    <SelectTrigger className="bg-white border-orange-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never_married">Never Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Wish to Marry</Label>
                  <Select 
                    value={filters.marriageTimeline || ''}
                    onValueChange={(value) => setFilters({...filters, marriageTimeline: value})}
                  >
                    <SelectTrigger className="bg-white border-orange-200">
                      <SelectValue placeholder="Timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARRIAGE_TIMELINE.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-900 font-medium">Annual Income</Label>
                <div className="flex gap-2">
                  <div className="w-28">
                    <Select 
                      value={filters.income?.currency || 'INR'}
                      onValueChange={(value) => setFilters({
                        ...filters, 
                        income: { ...filters.income, currency: value, range: '' }
                      })}
                    >
                      <SelectTrigger className="bg-white border-orange-200">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">₹ Rupees</SelectItem>
                        <SelectItem value="USD">$ Dollar</SelectItem>
                        <SelectItem value="GBP">£ Pound</SelectItem>
                        <SelectItem value="EUR">€ Euro</SelectItem>
                        <SelectItem value="CAD">C$ CAD</SelectItem>
                        <SelectItem value="AUD">A$ AUD</SelectItem>
                        <SelectItem value="NZD">NZ$ NZD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <Select 
                      value={filters.income?.range || ''}
                      onValueChange={(value) => setFilters({
                        ...filters, 
                        income: { ...filters.income, range: value }
                      })}
                    >
                      <SelectTrigger className="bg-white border-orange-200">
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
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4 bg-white">
              <div className="space-y-3">
                <Label className="text-gray-900 font-medium">Country</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded-md border-orange-200 bg-orange-50/50">
                  {COUNTRIES.map((country) => (
                    <div key={country.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country.value}`}
                        checked={(filters.country || []).includes(country.value)}
                        onCheckedChange={() => toggleArrayFilter('country', country.value)}
                        className="border-[#FF4500] data-[state=checked]:bg-[#FF4500]"
                      />
                      <Label htmlFor={`country-${country.value}`} className="cursor-pointer">
                        {country.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="community" className="space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Gotra</Label>
                  <Input
                    placeholder="Search gotra..."
                    value={gotraSearch}
                    onChange={(e) => setGotraSearch(e.target.value)}
                    className="bg-white border-orange-200"
                  />
                  <div className="max-h-48 overflow-y-auto border rounded-md p-3 border-orange-200 bg-orange-50/50">
                    {filteredGotras.map((gotra) => (
                      <div key={gotra} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`gotra-${gotra}`}
                          checked={(filters.gotra || []).includes(gotra)}
                          onCheckedChange={() => toggleArrayFilter('gotra', gotra)}
                          className="border-[#FF4500] data-[state=checked]:bg-[#FF4500]"
                        />
                        <Label htmlFor={`gotra-${gotra}`} className="cursor-pointer">
                          {gotra}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Brahmin Community</Label>
                  <Input
                    placeholder="Search community..."
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                    className="bg-white border-orange-200"
                  />
                  <div className="max-h-48 overflow-y-auto border rounded-md p-3 border-orange-200 bg-orange-50/50">
                    {filteredCommunities.map((community) => (
                      <div key={community} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`community-${community}`}
                          checked={(filters.brahminCommunity || []).includes(community)}
                          onCheckedChange={() => toggleArrayFilter('brahminCommunity', community)}
                          className="border-[#FF4500] data-[state=checked]:bg-[#FF4500]"
                        />
                        <Label htmlFor={`community-${community}`} className="cursor-pointer">
                          {community}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="occupation" className="space-y-6 mt-4 bg-white">
              <div className="space-y-3">
                <Label className="text-gray-900 font-medium text-base">Occupation / Profession</Label>
                <Input
                  placeholder="Search occupation..."
                  value={occupationSearch}
                  onChange={(e) => setOccupationSearch(e.target.value)}
                  className="bg-white border-orange-200"
                />
                <div className="max-h-64 overflow-y-auto border rounded-md p-3 border-orange-200 bg-orange-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredOccupations.map((occupation) => (
                      <div key={occupation.value} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`occupation-${occupation.value}`}
                          checked={(filters.occupation || []).includes(occupation.value)}
                          onCheckedChange={() => toggleArrayFilter('occupation', occupation.value)}
                          className="border-[#FF4500] data-[state=checked]:bg-[#FF4500]"
                        />
                        <Label htmlFor={`occupation-${occupation.value}`} className="cursor-pointer text-sm">
                          {occupation.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500">Select one or more occupations to filter profiles</p>
              </div>
            </TabsContent>

            <TabsContent value="horoscope" className="space-y-4 bg-white">
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label>Manglik Status</Label>
                  <div className="w-32">
                    <Select onValueChange={(value) => setFilters({
                      ...filters,
                      horoscope: { ...filters.horoscope, manglik: value === 'true' ? true : value === 'false' ? false : null }
                    })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Manglik" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="true">Manglik</SelectItem>
                        <SelectItem value="false">Non-Manglik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rashi</Label>
                  <div className="w-40">
                    <Select onValueChange={(value) => setFilters({
                      ...filters,
                      horoscope: { ...filters.horoscope, rashi: [value] }
                    })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rashi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aries (Mesh)">Aries (Mesh)</SelectItem>
                        <SelectItem value="Taurus (Vrishabh)">Taurus (Vrishabh)</SelectItem>
                        <SelectItem value="Gemini (Mithun)">Gemini (Mithun)</SelectItem>
                        <SelectItem value="Cancer (Kark)">Cancer (Kark)</SelectItem>
                        <SelectItem value="Leo (Simha)">Leo (Simha)</SelectItem>
                        <SelectItem value="Virgo (Kanya)">Virgo (Kanya)</SelectItem>
                        <SelectItem value="Libra (Tula)">Libra (Tula)</SelectItem>
                        <SelectItem value="Scorpio (Vrishchik)">Scorpio (Vrishchik)</SelectItem>
                        <SelectItem value="Sagittarius (Dhanu)">Sagittarius (Dhanu)</SelectItem>
                        <SelectItem value="Capricorn (Makar)">Capricorn (Makar)</SelectItem>
                        <SelectItem value="Aquarius (Kumbh)">Aquarius (Kumbh)</SelectItem>
                        <SelectItem value="Pisces (Meen)">Pisces (Meen)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6 mt-4 bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-md border-2 border-green-300">
                  <Checkbox
                    id="onlineStatus"
                    checked={filters.onlineStatus}
                    onCheckedChange={(checked) => setFilters({...filters, onlineStatus: checked as boolean})}
                    className="w-5 h-5 border-2 border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                  />
                  <div>
                    <Label htmlFor="onlineStatus" className="text-gray-900 font-medium cursor-pointer">
                      Show Online Profiles Only
                    </Label>
                    <p className="text-xs text-gray-500">Filter to show only profiles that are currently online</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-md border border-orange-200">
                  <Checkbox
                    id="verified"
                    checked={filters.verified}
                    onCheckedChange={(checked) => setFilters({...filters, verified: checked as boolean})}
                    className="w-5 h-5 border-2 border-[#FF4500] data-[state=checked]:bg-[#FF4500] data-[state=checked]:text-white"
                  />
                  <Label htmlFor="verified" className="text-gray-900 font-medium cursor-pointer">
                    Only verified profiles
                  </Label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-md border border-orange-200">
                  <Checkbox
                    id="recentlyActive"
                    checked={filters.recentlyActive}
                    onCheckedChange={(checked) => setFilters({...filters, recentlyActive: checked as boolean})}
                    className="w-5 h-5 border-2 border-[#FF4500] data-[state=checked]:bg-[#FF4500] data-[state=checked]:text-white"
                  />
                  <Label htmlFor="recentlyActive" className="text-gray-900 font-medium cursor-pointer">
                    Recently active (within 7 days)
                  </Label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-md border border-orange-200">
                  <Checkbox
                    id="photosOnly"
                    checked={filters.verified}
                    onCheckedChange={(checked) => setFilters({...filters, verified: checked as boolean})}
                    className="w-5 h-5 border-2 border-[#FF4500] data-[state=checked]:bg-[#FF4500] data-[state=checked]:text-white"
                  />
                  <Label htmlFor="photosOnly" className="text-gray-900 font-medium cursor-pointer">
                    Profiles with photos only
                  </Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Save search as..."
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              className="w-48 bg-white border-orange-200 h-9"
            />
            <Button 
              variant="outline" 
              onClick={handleSaveSearch} 
              disabled={!saveSearchName.trim()}
              className="border-[#FF4500] text-[#FF4500] hover:text-[#FF4500] hover:bg-red-50 hover:border-[#FF4500] flex items-center justify-center h-9 px-4 py-1 whitespace-nowrap min-w-fit transition-colors duration-200"
            >
              Save Search
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={handleSearch}
              className="border-2 border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500] hover:text-white font-medium"
            >
              Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};