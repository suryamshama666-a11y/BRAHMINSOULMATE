import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchHeaderProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onBasicSearch: () => void;
  onShowAdvancedSearch: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const SearchHeader = ({
  searchTerm,
  onSearchTermChange,
  onBasicSearch,
  onShowAdvancedSearch,
  sortBy,
  onSortChange
}: SearchHeaderProps) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-4 text-[#FF4500]">Find Your Perfect Match</h1>
        <p className="text-lg mb-6 text-gray-600">
          Search through thousands of verified profiles to find your soulmate
        </p>
        
        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-lg border border-gray-600 focus-within:border-amber-500 focus-within:bg-amber-50 transition-colors duration-200">
            <Input
              type="text"
              placeholder="Search by name, location, or profession..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="border-0 focus:ring-0 bg-transparent focus:outline-none focus:bg-transparent"
              onKeyPress={(e) => e.key === 'Enter' && onBasicSearch()}
            />
          </div>
          <Button
            onClick={onBasicSearch}
            variant="outline"
            className="border-2 border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500] hover:text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            onClick={onShowAdvancedSearch}
            className="border-2 border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500] hover:text-white"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced
          </Button>
        </div>
      </div>
    </div>
  );
};
