import React from 'react';
import { Search, SortAsc, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SortOption {
  value: string;
  label: string;
}

interface ListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
  placeholder?: string;
  className?: string;
}

export const ListFilters = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOptions,
  placeholder = "Search by name or location...",
  className = "",
}: ListFiltersProps) => {
  return (
    <div className={`flex flex-col md:flex-row gap-4 items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 min-w-fit">
          <SortAsc className="h-4 w-4" />
          <span>Sort by:</span>
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
