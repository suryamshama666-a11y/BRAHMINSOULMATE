import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Clock, MapPin, Filter, Users, UserPlus } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const OnlineProfiles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlineProfiles, setOnlineProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  
  const [filterOnline, setFilterOnline] = useState(true);
  const [filterNewMember, setFilterNewMember] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterWithPhoto, setFilterWithPhoto] = useState(false);
  const [sortBy, setSortBy] = useState('lastActive');

  useEffect(() => {
    const loadOnlineProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .gt('last_active', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .order('last_active', { ascending: false });

        if (error) throw error;

        const transformed = (data || []).map(p => ({
          id: p.id,
          name: p.first_name + (p.last_name ? ' ' + p.last_name : ''),
          age: p.age || 25,
          gender: p.gender,
          height: p.height || 160,
          religion: p.religion || 'Hindu',
          caste: p.caste || 'Brahmin',
          location: `${p.city || 'Mumbai'}, ${p.state || 'Maharashtra'}`,
          education: p.education_level || 'Graduate',
          profession: p.occupation || 'Professional',
          subscription_type: p.subscription_type || 'free',
          onlineStatus: 'Online now',
          lastSeen: 'Active now',
          profile_picture_url: p.profile_picture_url
        }));
        
        setOnlineProfiles(transformed);
      } catch (error) {
        console.error('Error loading online profiles:', error);
        toast.error('Failed to load online profiles');
      } finally {
        setLoading(false);
      }
    };

    loadOnlineProfiles();
  }, [user]);

  const handleProfileAction = (action: string, profileId: string) => {
    const targetProfile = onlineProfiles.find(p => p.id === profileId);
    const profileName = targetProfile?.name || 'User';
    
    switch(action) {
      case 'view':
        navigate(`/profile/${profileId}`);
        break;
      case 'message':
        navigate(`/messages?partnerId=${profileId}&partnerName=${encodeURIComponent(profileName)}`);
        toast.success(`Opening chat with ${profileName}`);
        break;
      case 'expressInterest':
        toast.success(`Interest expressed to ${profileName}!`);
        break;
      case 'report':
        toast.success(`Report submitted for ${profileName}. Our team will review.`);
        break;
      case 'block':
        toast.success(`${profileName} has been blocked`);
        break;
      case 'unblock':
        toast.success(`${profileName} has been unblocked`);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const resetFilters = () => {
    setFilterOnline(true);
    setFilterNewMember(false);
    setFilterVerified(false);
    setFilterWithPhoto(false);
    setSortBy('lastActive');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-amber-50/40">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-green-600 mb-2 flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              Online Profiles
            </h1>
            <p className="text-gray-600">
              {onlineProfiles.length} members online now
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {showFilters && (
                <Card className="lg:col-span-1 h-fit">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-green-700">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={resetFilters} className="text-green-600 h-8 px-2 hover:bg-green-50">
                        Reset
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-green-50/50 rounded-lg border border-green-100">
                        <Label htmlFor="online" className="text-sm font-medium cursor-pointer">Online Now</Label>
                        <Checkbox 
                          id="online" 
                          checked={filterOnline} 
                          onCheckedChange={(checked) => setFilterOnline(!!checked)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                          <Label htmlFor="new" className="text-sm cursor-pointer">New Members</Label>
                          <Checkbox 
                            id="new" 
                            checked={filterNewMember} 
                            onCheckedChange={(checked) => setFilterNewMember(!!checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                          <Label htmlFor="verified" className="text-sm cursor-pointer">Verified Only</Label>
                          <Checkbox 
                            id="verified" 
                            checked={filterVerified} 
                            onCheckedChange={(checked) => setFilterVerified(!!checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                          <Label htmlFor="photo" className="text-sm cursor-pointer">With Photo</Label>
                          <Checkbox 
                            id="photo" 
                            checked={filterWithPhoto} 
                            onCheckedChange={(checked) => setFilterWithPhoto(!!checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <Label className="text-sm font-semibold mb-2 block text-gray-700">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lastActive">Last Active</SelectItem>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="age">Age: Low to High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
                <div className={cn(showFilters ? 'lg:col-span-2' : 'lg:col-span-3')}>
                {onlineProfiles.length > 0 ? (
                  <div className={cn("grid grid-cols-1 gap-4", showFilters ? "md:grid-cols-2" : "md:grid-cols-3")}>
                {onlineProfiles.map((profile) => (
                  <ProfileCard 
                    key={profile.id}
                    profile={{
                      ...profile, 
                      lastSeen: profile.lastSeen,
                      gotra: profile.gotra || 'Gotra not specified'
                    }}
                    variant="online"
                    onAction={handleProfileAction}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No One Online Right Now</h3>
                  <p className="text-gray-600 mb-6">Check back later or browse all profiles</p>
                    <Link to="/search">
                      <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                        Browse All Profiles
                      </Button>
                    </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineProfiles;