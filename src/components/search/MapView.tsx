import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize2, Minimize2, User } from 'lucide-react';
import { Profile } from '@/types/profile';

interface MapViewProps {
  profiles: Profile[];
  onProfileSelect: (profileId: string) => void;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({ 
  profiles, 
  onProfileSelect,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // In a real implementation, this would use a mapping library like Google Maps, Mapbox, or Leaflet
  // For this demo, we'll create a simplified map representation
  
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleProfileClick = (profileId: string) => {
    setSelectedProfileId(profileId);
    onProfileSelect(profileId);
  };

  const getProfilesWithCoordinates = () => {
    return profiles.filter(profile => 
      profile.location && 
      profile.location.coordinates &&
      profile.location.coordinates.latitude &&
      profile.location.coordinates.longitude
    );
  };

  const profilesWithCoordinates = getProfilesWithCoordinates();

  return (
    <Card className={`relative overflow-hidden ${expanded ? 'h-[600px]' : 'h-[300px]'} ${className}`}>
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      
      {!mapLoaded ? (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2"></div>
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      ) : (
        <div className="h-full w-full bg-gray-100 relative">
          {/* This is a simplified map representation */}
          {/* Using an existing public asset to avoid build-time unresolved URL warnings */}
          <div className="h-full w-full bg-[url('/placeholder.svg')] bg-cover bg-center opacity-70"></div>
          
          {/* Profile markers */}
          {profilesWithCoordinates.map(profile => {
            // In a real implementation, these would be positioned based on lat/lng
            // Here we're just randomly positioning them for demonstration
            const top = `${Math.floor(Math.random() * 80) + 10}%`;
            const left = `${Math.floor(Math.random() * 80) + 10}%`;
            
            const isSelected = profile.id === selectedProfileId;
            
            return (
              <div 
                key={profile.id}
                className={`absolute cursor-pointer transition-all ${isSelected ? 'z-10' : 'z-0'}`}
                style={{ top, left }}
                onClick={() => handleProfileClick(profile.id)}
              >
                <div className={`
                  flex flex-col items-center
                  ${isSelected ? 'scale-110' : 'scale-100 hover:scale-110'}
                `}>
                  <div className={`
                    rounded-full p-1
                    ${isSelected ? 'bg-red-500 text-white' : 'bg-white text-red-500'}
                  `}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  
                  {isSelected && (
                    <div className="mt-1 bg-white p-2 rounded-md shadow-md text-xs w-32">
                      <div className="font-medium">{profile.name}, {profile.age}</div>
                      <div className="text-gray-500 truncate">{profile.location.city}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {profilesWithCoordinates.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-4 rounded-md shadow-md text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">No profiles with location data found</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2 text-xs text-gray-500 text-center">
        Showing {profilesWithCoordinates.length} profiles on the map
      </div>
    </Card>
  );
};

export default MapView; 