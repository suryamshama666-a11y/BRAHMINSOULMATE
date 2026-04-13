import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SavedSearch, SearchFilters } from '@/hooks/useAdvancedSearch';
import { Bookmark, Clock, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SavedSearchesProps {
  savedSearches: SavedSearch[];
  onSearchLoad: (filters: SearchFilters) => void;
}

export const SavedSearches: React.FC<SavedSearchesProps> = ({
  savedSearches,
  onSearchLoad
}) => {
  if (savedSearches.length === 0) return null;

  // Format the search criteria for display
  const formatSearchCriteria = (criteria: SearchFilters): string => {
    const parts = [];
    
    if (criteria.ageRange) {
      parts.push(`Age ${criteria.ageRange[0]}-${criteria.ageRange[1]}`);
    }
    
    if (criteria.religion) {
      parts.push(criteria.religion);
    }
    
    if (criteria.maritalStatus && criteria.maritalStatus.length > 0) {
      parts.push(criteria.maritalStatus[0].replace('_', ' '));
    }
    
    return parts.join(' • ');
  };

  return (
    <Card className="mb-6 border-amber-100">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Bookmark className="h-5 w-5 mr-2 text-amber-600" />
            Your Saved Searches
          </CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            {savedSearches.length} saved
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {savedSearches.map((search) => (
            <div 
              key={search.id} 
              className="border border-amber-100 rounded-lg p-3 hover:bg-amber-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-amber-900">{search.name}</h3>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {formatSearchCriteria(search.search_criteria)}
              </p>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSearchLoad(search.search_criteria)}
                  className="text-xs border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                >
                  Apply Search
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-red-600 p-0 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
