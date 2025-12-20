import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Locate, User, Heart, MessageCircle, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface LocationSearchProps {
  onSearch: (params: { location: string; distance: number; useCurrentLocation: boolean }) => void;
}

interface NearbyProfile {
  id: string;
  name: string;
  age: number;
  distance: number;
  photo: string;
  profession: string;
  city: string;
  isVerified: boolean;
  isPremium: boolean;
}

const LocationSearch = ({ onSearch }: LocationSearchProps) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState(50);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [nearbyProfiles, setNearbyProfiles] = useState<NearbyProfile[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const distanceOptions = [25, 50, 100, 200];

  const generateNearbyProfiles = (maxDistance: number): NearbyProfile[] => {
    const names = [
      { name: 'Priya Sharma', profession: 'Doctor', city: 'Bangalore' },
      { name: 'Ananya Iyer', profession: 'Software Engineer', city: 'Chennai' },
      { name: 'Meera Krishnan', profession: 'Teacher', city: 'Mysore' },
      { name: 'Kavitha Rao', profession: 'Architect', city: 'Hyderabad' },
      { name: 'Deepa Namboodiri', profession: 'Lawyer', city: 'Kochi' },
      { name: 'Sneha Bhat', profession: 'Business Analyst', city: 'Pune' },
      { name: 'Lakshmi Venkat', profession: 'CA', city: 'Mumbai' },
      { name: 'Divya Hegde', profession: 'Designer', city: 'Mangalore' },
    ];

    const count = Math.min(Math.floor(maxDistance / 20) + 2, 8);
    
    return names.slice(0, count).map((p, i) => ({
      id: `nearby-${i}`,
      name: p.name,
      age: 21 + Math.floor(Math.random() * 8), // Default to 21+ for Brahmin focus
      distance: Math.floor(Math.random() * (maxDistance - 5)) + 5,
      photo: `/placeholder.svg`,
      profession: p.profession,
      city: p.city,
      isVerified: Math.random() > 0.3,
      isPremium: Math.random() > 0.5,
    })).sort((a, b) => a.distance - b.distance);
  };

  const handleSearch = async () => {
    if (!location.trim() && !useCurrentLocation) {
      toast.error('Please enter a location or use current location');
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    
    setTimeout(() => {
      const profiles = generateNearbyProfiles(distance);
      setNearbyProfiles(profiles);
      onSearch({
        location: useCurrentLocation ? 'Current Location' : location,
        distance,
        useCurrentLocation
      });
      setIsSearching(false);
      toast.success(`Found ${profiles.length} profiles within ${distance} km`);
    }, 1000);
  };

  const handleUseCurrentLocation = () => {
    setUseCurrentLocation(!useCurrentLocation);
    if (!useCurrentLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            toast.success('Current location detected');
            setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
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

  const handleViewProfile = (id: string) => {
    navigate(`/profile/${id}`);
  };

  const handleMessage = (id: string, name: string) => {
    toast.success(`Opening chat with ${name}`);
    navigate('/messages', { state: { profileId: id } });
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-red-600" />
          Find Nearby Profiles
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
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
            
            <div className="flex gap-2">
              <Button
                variant={useCurrentLocation ? "default" : "outline"}
                className={`flex-1 h-10 ${useCurrentLocation ? 
                  "bg-[#FF4500] hover:bg-[#FF4500]/90 text-white" : 
                  "border-[#FF4500] text-[#FF4500] hover:bg-[#FFF1E6]"
                }`}
                onClick={handleUseCurrentLocation}
              >
                <Locate className={`h-4 w-4 mr-2 ${useCurrentLocation ? 'text-white' : ''}`} />
                {useCurrentLocation ? 'Using GPS' : 'Use GPS'}
              </Button>
              
              <Select value={distance.toString()} onValueChange={(value) => setDistance(parseInt(value))}>
                <SelectTrigger className="w-28 h-10 border-2 border-orange-300 focus:border-[#FF4500]">
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

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full h-10 bg-red-600 hover:bg-red-700 text-white"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search Nearby'
              )}
            </Button>
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 flex items-center justify-between">
            <span>Profiles within {distance} km</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {nearbyProfiles.length} found
            </Badge>
          </h4>
          
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          ) : nearbyProfiles.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {nearbyProfiles.map((profile) => (
                <Card key={profile.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-orange-100">
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={profile.photo} 
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {profile.isVerified && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-gray-900 truncate">{profile.name}</h5>
                          {profile.isPremium && (
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{profile.age} yrs • {profile.profession}</p>
                        <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{profile.distance} km away • {profile.city}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleViewProfile(profile.id)}
                      >
                        <User className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700"
                        onClick={() => handleMessage(profile.id, profile.name)}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No profiles found within {distance} km</p>
              <p className="text-sm">Try increasing the distance</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;