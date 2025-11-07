
import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

interface OnlineSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const OnlineSearchBar = ({ searchTerm, setSearchTerm }: OnlineSearchBarProps) => {
  return (
    <Card className="mb-6 border-2 border-red-100/50 rounded-3xl shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50 rounded-t-3xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg rounded-full border border-gray-600 focus:border-amber-500 focus:bg-amber-50 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
            />
          </div>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-full px-6 py-3 font-medium">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
