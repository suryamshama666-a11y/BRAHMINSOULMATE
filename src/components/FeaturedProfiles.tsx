import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

const FeaturedProfiles: React.FC = () => {
  const [featuredProfiles, setFeaturedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProfiles = async () => {
      try {
        setLoading(true);
        const result = await api.getProfiles({ page: 1, limit: 6 });
        const profiles = Array.isArray(result) ? result : result.data || [];
        setFeaturedProfiles(profiles);
      } catch (error) {
        console.error('Error loading featured profiles:', error);
        setFeaturedProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProfiles();
  }, []);

  return (
    <section className="py-12">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Featured Profiles</h2>
        <p className="text-lg text-gray-600 max-w-2xl text-center">
          Discover our hand-picked selection of profiles that match your preferences
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProfiles.map((profile) => (
          <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-[4/5] relative overflow-hidden">
              <img
                src={profile.images[0] || '/placeholder.svg'}
                alt={profile.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              {profile.isVerified && (
                <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
                  Verified
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="text-xl font-medium text-gray-900">{profile.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1 mb-2">
                      <Badge variant="outline" className="text-xs bg-gray-100">
                        {profile.age} yrs • {profile.height || "5'11\""}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-gray-100">
                        {profile.employment?.profession || 'Professional'}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-gray-100">
                        {profile.location?.city || "Mumbai"}
                      </Badge>
                  </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                {profile.about}
              </p>
              <Link to={`/profile/${profile.id}`} className="w-full block">
                <Button variant="maroon-outline" className="w-full text-brahmin-primary border-brahmin-primary/30 hover:bg-brahmin-primary/5">
                  View Profile <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link to="/search">
          <Button variant="outline" className="border-brahmin-primary text-brahmin-primary hover:bg-brahmin-primary/5">
            View More Profiles <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProfiles;
