import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onAdvancedSearch: () => void;
  itemsPerPage: string;
  onItemsPerPageChange: (value: string) => void;
}

export const SearchHeader = ({
  searchTerm,
  onSearchChange,
  onSearch,
  onAdvancedSearch,
  itemsPerPage,
  onItemsPerPageChange,
}: SearchHeaderProps) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-4 text-[#FF4500]">Find Your Perfect Match</h1>
        <p className="text-lg mb-6 text-gray-600">
          Search through thousands of verified profiles to find your soulmate
        </p>
        
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-white rounded-lg border border-gray-600 focus-within:border-amber-500 focus-within:bg-amber-50 transition-colors duration-200">
                <Input
                  type="text"
                  placeholder="Search by name, location, or profession..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="border-0 focus:ring-0 bg-transparent focus:outline-none focus:bg-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={onSearch}
                  variant="outline"
                  className="border-2 border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500] hover:text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={onAdvancedSearch}
                  className="border-2 border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500] hover:text-white"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Show:</span>
              <Select value={itemsPerPage} onValueChange={onItemsPerPageChange}>
                <SelectTrigger className="w-[100px] border-gray-300 h-9">
                  <SelectValue placeholder="8" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 per page</SelectItem>
                  <SelectItem value="16">16 per page</SelectItem>
                  <SelectItem value="24">24 per page</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-gray-500">profiles</span>
            </div>
          </div>
      </div>
    </div>
  );
};
