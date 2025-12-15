import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Bookmark, ChevronDown, ChevronUp, Clock, Filter, Save } from "lucide-react";
import { toast } from "sonner";

import {
  getAllGotras,
  getAllMaritalStatuses,
  getAllSubcastes,
  getAllRashis,
  getAllIshtaDevatas,
} from '@/utils/profileUtils';
import { ProfileGender, ProfileMaritalStatus, Gotra, BrahminSubcaste, Rashi, IshtaDevata } from '@/types/profile';

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
    { value: '5000000+', label: 'Above 50 Lakhs' },
  ],
  USD: [
    { value: '0-50000', label: 'Below $50K' },
    { value: '50000-100000', label: '$50K - $100K' },
    { value: '100000-150000', label: '$100K - $150K' },
    { value: '150000+', label: 'Above $150K' },
  ],
  GBP: [
    { value: '0-40000', label: 'Below £40K' },
    { value: '40000-80000', label: '£40K - £80K' },
    { value: '80000-120000', label: '£80K - £120K' },
    { value: '120000+', label: 'Above £120K' },
  ],
};

interface SearchSidebarProps {
  onSearch: (filters: any) => void;
}

export function SearchSidebar({ onSearch }: SearchSidebarProps) {
  const [showSavedSearches, setShowSavedSearches] = React.useState(false);
  const [showRecentSearches, setShowRecentSearches] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState(0);
  
  const [gender, setGender] = React.useState<ProfileGender>();
  const [ageRange, setAgeRange] = React.useState<[number, number]>([18, 60]);
  const [maritalStatus, setMaritalStatus] = React.useState<ProfileMaritalStatus>();
  const [gotra, setGotra] = React.useState<Gotra>();
  const [excludeGotra, setExcludeGotra] = React.useState(false);
  const [subcaste, setSubcaste] = React.useState<BrahminSubcaste>();
  const [rashi, setRashi] = React.useState<Rashi>();
  const [ishtaDevata, setIshtaDevata] = React.useState<IshtaDevata>();
  const [onlineOnly, setOnlineOnly] = React.useState(false);
  const [photosOnly, setPhotosOnly] = React.useState(false);
  const [verifiedOnly, setVerifiedOnly] = React.useState(false);
  const [country, setCountry] = React.useState<string>();
  const [marriageTimeline, setMarriageTimeline] = React.useState<string>();
  const [incomeCurrency, setIncomeCurrency] = React.useState<string>('INR');
  const [incomeRange, setIncomeRange] = React.useState<string>();

  const allGotras = getAllGotras();
  const allSubcastes = getAllSubcastes();
  const allMaritalStatuses = getAllMaritalStatuses();
  const allRashis = getAllRashis();
  const allIshtaDevatas = getAllIshtaDevatas();
  const currentIncomeRanges = INCOME_RANGES[incomeCurrency as keyof typeof INCOME_RANGES] || INCOME_RANGES.INR;

  const BasicFilters = () => (
    <SidebarGroup>
      <SidebarGroupLabel>Basic Filters</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-4">
        <div className="space-y-2">
          <Label>Looking for</Label>
          <Select value={gender} onValueChange={(value) => setGender(value as ProfileGender)}>
            <SelectTrigger>
              <SelectValue placeholder="Any gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
          <Slider
            defaultValue={[18, 60]}
            min={18}
            max={80}
            step={1}
            value={ageRange}
            onValueChange={(value) => setAgeRange(value as [number, number])}
          />
        </div>

        <div className="space-y-2">
          <Label>Marital Status</Label>
          <Select value={maritalStatus} onValueChange={(value) => setMaritalStatus(value as ProfileMaritalStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              {allMaritalStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Any country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Wish to Marry</Label>
          <Select value={marriageTimeline} onValueChange={setMarriageTimeline}>
            <SelectTrigger>
              <SelectValue placeholder="Any timeline" />
            </SelectTrigger>
            <SelectContent>
              {MARRIAGE_TIMELINE.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const IncomeFilters = () => (
    <SidebarGroup>
      <SidebarGroupLabel>Income</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-4">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={incomeCurrency} onValueChange={(value) => {
            setIncomeCurrency(value);
            setIncomeRange(undefined);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">₹ Rupees</SelectItem>
              <SelectItem value="USD">$ Dollar</SelectItem>
              <SelectItem value="GBP">£ Pound</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Income Range</Label>
          <Select value={incomeRange} onValueChange={setIncomeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Any range" />
            </SelectTrigger>
            <SelectContent>
              {currentIncomeRanges.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const ReligiousFilters = () => (
    <SidebarGroup>
      <SidebarGroupLabel>Religious & Cultural</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-4">
        <div className="space-y-2">
          <Label>Gotra</Label>
          <Select value={gotra} onValueChange={(value) => setGotra(value as Gotra)}>
            <SelectTrigger>
              <SelectValue placeholder="Any Gotra" />
            </SelectTrigger>
            <SelectContent>
              {allGotras.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Brahmin Community</Label>
          <Select value={subcaste} onValueChange={(value) => setSubcaste(value as BrahminSubcaste)}>
            <SelectTrigger>
              <SelectValue placeholder="Any Community" />
            </SelectTrigger>
            <SelectContent>
              {allSubcastes.map(sc => (
                <SelectItem key={sc} value={sc}>{sc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Rashi</Label>
          <Select value={rashi} onValueChange={(value) => setRashi(value as Rashi)}>
            <SelectTrigger>
              <SelectValue placeholder="Any Rashi" />
            </SelectTrigger>
            <SelectContent>
              {allRashis.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const AdditionalFilters = () => (
    <SidebarGroup>
      <SidebarGroupLabel>Additional Options</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="cursor-pointer">Show online profiles only</Label>
          <Switch
            checked={onlineOnly}
            onCheckedChange={setOnlineOnly}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="cursor-pointer">Profiles with photos only</Label>
          <Switch
            checked={photosOnly}
            onCheckedChange={setPhotosOnly}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="cursor-pointer">Verified profiles only</Label>
          <Switch
            checked={verifiedOnly}
            onCheckedChange={setVerifiedOnly}
          />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const SavedSearches = () => (
    <SidebarGroup>
      <button 
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100"
        onClick={() => setShowSavedSearches(!showSavedSearches)}
      >
        <div className="flex items-center">
          <Bookmark className="h-4 w-4 mr-2 text-brahmin-primary" />
          <span className="font-medium">Saved Searches</span>
        </div>
        {showSavedSearches ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {showSavedSearches && (
        <div className="p-3 space-y-2 bg-gray-50">
          <div className="text-center text-muted-foreground text-sm py-2">
            No saved searches yet
          </div>
        </div>
      )}
    </SidebarGroup>
  );

  const RecentSearches = () => (
    <SidebarGroup>
      <button 
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100"
        onClick={() => setShowRecentSearches(!showRecentSearches)}
      >
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-brahmin-primary" />
          <span className="font-medium">Recent Searches</span>
        </div>
        {showRecentSearches ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {showRecentSearches && (
        <div className="p-3 space-y-2 bg-gray-50">
          <div className="text-center text-muted-foreground text-sm py-2">
            No recent searches
          </div>
        </div>
      )}
    </SidebarGroup>
  );

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 border-b">
          <h2 className="text-xl font-serif font-semibold">Search Filters</h2>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {activeFilters > 0 ? `${activeFilters} active filters` : 'No filters'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setGender(undefined);
                setAgeRange([18, 60]);
                setMaritalStatus(undefined);
                setGotra(undefined);
                setExcludeGotra(false);
                setSubcaste(undefined);
                setRashi(undefined);
                setIshtaDevata(undefined);
                setOnlineOnly(false);
                setPhotosOnly(false);
                setVerifiedOnly(false);
                setCountry(undefined);
                setMarriageTimeline(undefined);
                setIncomeCurrency('INR');
                setIncomeRange(undefined);
                setActiveFilters(0);
                toast.info("All filters have been reset");
              }}
              className="text-xs h-8"
            >
              Reset All
            </Button>
          </div>
        </div>

        <BasicFilters />
        <IncomeFilters />
        <ReligiousFilters />
        <AdditionalFilters />

        <div className="p-4 space-y-3">
          <Button 
            className="w-full bg-brahmin-primary hover:bg-brahmin-dark"
            onClick={() => {
              const filters = {
                gender,
                ageRange,
                maritalStatus,
                gotra,
                excludeGotra,
                subcaste,
                rashi,
                ishtaDevata,
                onlineOnly,
                photosOnly,
                verifiedOnly,
                country,
                marriageTimeline,
                incomeCurrency,
                incomeRange
              };
              onSearch(filters);
              toast.success("Filters applied successfully");
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-brahmin-primary text-brahmin-primary hover:bg-brahmin-primary/10"
            onClick={() => {
              toast.success("Search criteria saved");
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save This Search
          </Button>
        </div>

        <div className="mt-auto">
          <SavedSearches />
          <RecentSearches />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}