
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { ForumCategory } from '@/hooks/forum/useForumCategories';

export interface ForumFilters {
  category?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'replies';
  timeRange?: 'today' | 'week' | 'month' | 'all';
  hasReplies?: boolean;
  isPinned?: boolean;
}

interface ForumSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: ForumFilters) => void;
  categories: ForumCategory[];
}

export const ForumSearch: React.FC<ForumSearchProps> = ({
  onSearch,
  onFilterChange,
  categories
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ForumFilters>({ sortBy: 'newest' });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof ForumFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (key: keyof ForumFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters: ForumFilters = { sortBy: 'newest' };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFilterCount = Object.keys(filters).filter(key => 
    key !== 'sortBy' && filters[key as keyof ForumFilters]
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Toggle and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500"
            >
              Clear all
            </Button>
          )}
        </div>

        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="popular">Most Liked</SelectItem>
            <SelectItem value="replies">Most Replies</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Category: {categories.find(c => c.id === filters.category)?.name}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('category')}
              />
            </Badge>
          )}
          {filters.timeRange && filters.timeRange !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Time: {filters.timeRange}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('timeRange')}
              />
            </Badge>
          )}
          {filters.hasReplies && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Has Replies</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('hasReplies')}
              />
            </Badge>
          )}
          {filters.isPinned && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Pinned</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => clearFilter('isPinned')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Expanded Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select
              value={filters.category || ''}
              onValueChange={(value) => handleFilterChange('category', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time Range</label>
            <Select
              value={filters.timeRange || 'all'}
              onValueChange={(value) => handleFilterChange('timeRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Options</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasReplies || false}
                  onChange={(e) => handleFilterChange('hasReplies', e.target.checked || undefined)}
                  className="rounded"
                />
                <span className="text-sm">Has replies</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isPinned || false}
                  onChange={(e) => handleFilterChange('isPinned', e.target.checked || undefined)}
                  className="rounded"
                />
                <span className="text-sm">Pinned posts</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
