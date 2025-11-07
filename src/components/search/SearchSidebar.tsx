
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

interface SearchSidebarProps {
  onSearch: (filters: any) => void;
}

export function SearchSidebar({ onSearch }: SearchSidebarProps) {
  const [showSavedSearches, setShowSavedSearches] = React.useState(false);
  const [showRecentSearches, setShowRecentSearches] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState(0);
  
  // Filter states
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

  // Get all filter options
  const allGotras = getAllGotras();
  const allSubcastes = getAllSubcastes();
  const allMaritalStatuses = getAllMaritalStatuses();
  const allRashis = getAllRashis();
  const allIshtaDevatas = getAllIshtaDevatas();

  // Basic Search Groups
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
      </SidebarGroupContent>
    </SidebarGroup>
  );

  // Religious & Cultural Filters
  const ReligiousFilters = () => (
    <SidebarGroup>
      <SidebarGroupLabel>Religious & Cultural</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-4">
        {/* ... Religious filter fields ... */}
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
          <Label>Subcaste</Label>
          <Select value={subcaste} onValueChange={(value) => setSubcaste(value as BrahminSubcaste)}>
            <SelectTrigger>
              <SelectValue placeholder="Any Subcaste" />
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

  // Additional Options
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

  // Saved and Recent Searches (at bottom)
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
        {/* Filter Header */}
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
                // Reset all filters
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
                setActiveFilters(0);
                toast.info("All filters have been reset");
              }}
              className="text-xs h-8"
            >
              Reset All
            </Button>
          </div>
        </div>

        {/* Main Filters */}
        <BasicFilters />
        <ReligiousFilters />
        <AdditionalFilters />

        {/* Action Buttons */}
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
                verifiedOnly
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

        {/* Saved and Recent Searches at Bottom */}
        <div className="mt-auto">
          <SavedSearches />
          <RecentSearches />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
