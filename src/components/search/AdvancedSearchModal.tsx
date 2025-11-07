
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilters } from '@/hooks/useAdvancedSearch';

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
  });

  const [saveSearchName, setSaveSearchName] = useState('');

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
            <TabsList className="grid w-full grid-cols-4 bg-orange-50 border border-orange-200 p-1 gap-1">
              {['basic', 'family', 'horoscope', 'preferences'].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-[#FF4500] data-[state=active]:text-white bg-white"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-4 bg-white">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Age Range</Label>
                  <div className="w-24">
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
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Height Range</Label>
                  <div className="w-36">
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
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Religion</Label>
                  <div className="w-28">
                    <Select onValueChange={(value) => setFilters({...filters, religion: value})}>
                      <SelectTrigger className="bg-white border-orange-200">
                        <SelectValue placeholder="Religion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hinduism">Hinduism</SelectItem>
                        <SelectItem value="islam">Islam</SelectItem>
                        <SelectItem value="christianity">Christianity</SelectItem>
                        <SelectItem value="sikhism">Sikhism</SelectItem>
                        <SelectItem value="buddhism">Buddhism</SelectItem>
                        <SelectItem value="jainism">Jainism</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-900 font-medium">Marital Status</Label>
                  <div className="w-32">
                    <Select onValueChange={(value) => setFilters({...filters, maritalStatus: [value]})}>
                      <SelectTrigger className="bg-white border-orange-200">
                        <SelectValue placeholder="Marital Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never_married">Never Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-900 font-medium">Annual Income</Label>
                <div className="flex gap-2">
                  <div className="w-20">
                    <Select 
                      value={filters.income?.currency || 'INR'}
                      onValueChange={(value) => setFilters({
                        ...filters, 
                        income: { ...filters.income, currency: value }
                      })}
                    >
                      <SelectTrigger className="bg-white border-orange-200">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">₹ INR</SelectItem>
                        <SelectItem value="USD">$ USD</SelectItem>
                        <SelectItem value="CAD">C$ CAD</SelectItem>
                        <SelectItem value="GBP">£ GBP</SelectItem>
                        <SelectItem value="EUR">€ EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-32">
                    <Select 
                      value={filters.income?.range || ''}
                      onValueChange={(value) => setFilters({
                        ...filters, 
                        income: { ...filters.income, range: value }
                      })}
                    >
                      <SelectTrigger className="bg-white border-orange-200">
                        <SelectValue placeholder="Income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-25k">0 - 25K</SelectItem>
                        <SelectItem value="25k-50k">25K - 50K</SelectItem>
                        <SelectItem value="50k-75k">50K - 75K</SelectItem>
                        <SelectItem value="75k-100k">75K - 100K</SelectItem>
                        <SelectItem value="100k-150k">100K - 150K</SelectItem>
                        <SelectItem value="150k+">150K+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="family" className="space-y-4 bg-white">
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label>Family Type</Label>
                  <div className="w-24">
                    <Select onValueChange={(value) => setFilters({...filters, family: {...filters.family, type: [value]}})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuclear">Nuclear</SelectItem>
                        <SelectItem value="joint">Joint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Siblings</Label>
                  <div className="w-16">
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-white border-orange-200"
                      onChange={(e) => setFilters({
                        ...filters,
                        family: { ...filters.family, siblings: parseInt(e.target.value) || undefined }
                      })}
                    />
                  </div>
                </div>
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
              <div className="space-y-6">
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
                    id="onlineStatus"
                    checked={filters.onlineStatus}
                    onCheckedChange={(checked) => setFilters({...filters, onlineStatus: checked as boolean})}
                    className="w-5 h-5 border-2 border-[#FF4500] data-[state=checked]:bg-[#FF4500] data-[state=checked]:text-white"
                  />
                  <Label htmlFor="onlineStatus" className="text-gray-900 font-medium cursor-pointer">
                    Currently online
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
