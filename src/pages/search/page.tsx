import React from 'react';
import { PageHeader } from './components/PageHeader';
import { SearchHeader } from './components/SearchHeader';
import LocationSearch from '@/components/search/LocationSearch';
import ProfileGrid from '@/components/search/ProfileGrid';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const handleSearch = () => {
    // Implement search logic
  };

  const handleAdvancedSearch = () => {
    // Implement advanced search logic
  };

  const handleLocationSearch = (params: { location: string; distance: number; useCurrentLocation: boolean }) => {
    // Implement location search logic
  };

  // Dummy data for testing
  const profiles = [
    {
      id: '1',
      name: 'John Doe',
      age: 28,
      photos: ['/placeholder-profile.jpg'],
      education: { degree: 'B.Tech', institution: 'IIT Delhi', year: '2018' },
      profession: 'Software Engineer',
      location: { city: 'Bangalore' },
      isVerified: true,
      isPremium: true
    },
    // Add more dummy profiles as needed
  ];

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
          <ProfileGrid
            profiles={profiles}
            onSendInterest={(name, id) => console.log('Send interest', name, id)}
            onShortlist={(id, name) => console.log('Shortlist', id, name)}
            onMessage={(id) => console.log('Message', id)}
          />
        </div>
        
        <div className="lg:col-span-1">
          <LocationSearch onSearch={handleLocationSearch} />
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 