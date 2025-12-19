import React from 'react';
import { PageHeader } from './components/PageHeader';
import { SearchHeader } from './components/SearchHeader';
import LocationSearch from '@/components/search/LocationSearch';
import ProfileGrid from '@/components/search/ProfileGrid';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [profiles, setProfiles] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile/search/all`);
        const data = await response.json();
        if (data.success) {
          setProfiles(data.profiles);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, []);
  
  const handleSearch = () => {
    // Implement search logic
  };

  const handleAdvancedSearch = () => {
    // Implement advanced search logic
  };

  const handleLocationSearch = (params: { location: string; distance: number; useCurrentLocation: boolean }) => {
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
              onSendInterest={(name, id) => console.log('Send interest', name, id)}
              onShortlist={(id, name) => console.log('Shortlist', id, name)}
              onMessage={(id) => console.log('Message', id)}
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