import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Locate } from 'lucide-react';
import { toast } from 'sonner';

interface LocationSearchProps {
  onSearch: (params: { location: string; distance: number; useCurrentLocation: boolean }) => void;
}

const LocationSearch = ({ onSearch }: LocationSearchProps) => {
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState(50);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const distanceOptions = [25, 50, 100, 200];

  const handleSearch = async () => {
    if (!location.trim() && !useCurrentLocation) {
      toast.error('Please enter a location or use current location');
      return;
    }
    
    setIsSearching(true);
    
    // Simulate search process
    setTimeout(() => {
      onSearch({
        location: useCurrentLocation ? 'Current Location' : location,
        distance,
        useCurrentLocation
      });
      setIsSearching(false);
    }, 500);
  };

  const handleUseCurrentLocation = () => {
    setUseCurrentLocation(!useCurrentLocation);
    if (!useCurrentLocation) {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            toast.success('Current location detected');
            setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          },
          (error) => {
            toast.error('Unable to get current location');
            setUseCurrentLocation(false);
          }
        );
      } else {
        toast.error('Geolocation is not supported by this browser');
        setUseCurrentLocation(false);
      }
    } else {
      setLocation('');
    }
  };

  return (
    <div className="bg-orange-50 p-4 rounded-lg shadow-sm mb-8">
      <div className="space-y-4">
        {/* Location and Distance Row */}
        <div className="flex gap-4 max-w-4xl mx-auto items-end">
          {/* Location Section */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-[#FF4500]" />
                <Input
                  type="text"
                  placeholder="Enter city or area..."
                  value={useCurrentLocation ? 'Using current location...' : location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 text-base"
                  disabled={useCurrentLocation}
                />
              </div>
              <Button
                variant={useCurrentLocation ? "default" : "outline"}
                className={`h-12 px-3 ${useCurrentLocation ? 
                  "bg-[#FF4500] hover:bg-[#FF4500]/90 text-white" : 
                  "border-[#FF4500] text-[#FF4500] hover:bg-[#FFF1E6]"
                }`}
                onClick={handleUseCurrentLocation}
                title="Use your current location for search"
              >
                <Locate className={`h-5 w-5 ${useCurrentLocation ? 'text-white' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Distance Section */}
          <div className="w-32">
            <label className="block text-sm font-medium mb-2" style={{ color: '#800020' }}>
              Distance: {distance} km
            </label>
            <Select value={distance.toString()} onValueChange={(value) => setDistance(parseInt(value))}>
              <SelectTrigger className="h-12 border-2 border-orange-300 focus:border-[#FF4500] focus:ring-0 focus:ring-offset-0 data-[state=open]:border-[#FF4500]">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent className="bg-orange-50 border-orange-300">
                {distanceOptions.map((dist) => (
                  <SelectItem key={dist} value={dist.toString()} className="hover:bg-orange-100 focus:bg-orange-100">
                    {dist} km
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="h-12 px-8 bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSearch; 