import React from 'react';
import { PageHeader } from './components/PageHeader';
import { SearchHeader } from './components/SearchHeader';
import LocationSearch from '@/components/search/LocationSearch';
import ProfileGrid from '@/components/search/ProfileGrid';
import { backendCall } from '@/services/api/base';

  const SearchPage = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [profiles, setProfiles] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [itemsPerPage, setItemsPerPage] = React.useState('8');
    
    const fetchProfiles = async (limit: string) => {
      setIsLoading(true);
      try {
        const response = await backendCall<any[]>(`profile/search/all?limit=${limit}`);
        if (response.data) {
          setProfiles(response.data);
        } else if (response.error) {
          console.error('Error fetching profiles:', response.error.message);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    React.useEffect(() => {
      fetchProfiles(itemsPerPage);
    }, [itemsPerPage]);
    
    const handleSearch = () => {
      fetchProfiles(itemsPerPage);
    };

    const handleAdvancedSearch = () => {
      // Implement advanced search logic
    };

    const handleLocationSearch = (_params: { location: string; distance: number; useCurrentLocation: boolean }) => {
      // Implement location search logic
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        
        <SearchHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          onAdvancedSearch={handleAdvancedSearch}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ProfileGrid
              profiles={profiles}
              onSendInterest={(name, id) => logger.log('Send interest', name, id)}
              onShortlist={(id, name) => logger.log('Shortlist', id, name)}
              onMessage={(id) => logger.log('Message', id)}
            />
          )}
        </div>
        
        <div className="lg:col-span-1">
          <LocationSearch onSearch={handleLocationSearch} />
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 