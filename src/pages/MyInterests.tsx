import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Heart, Clock, CheckCircle, XCircle, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { interestsService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

const MyInterests = () => {
  const { user } = useAuth();

  // Fetch sent interests
  const { data: interests = [], isLoading: loading } = useQuery({
    queryKey: ['interests', 'sent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await interestsService.getSentInterests();
    },
    enabled: !!user?.id
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                  <Heart className="h-8 w-8 mr-3" />
                  My Interests
                </h1>
                <p className="text-amber-100">Interests you've sent to other profiles</p>
              </div>
              <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold">
                {interests.length} Sent
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-green-100/50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-green-600">
                {interests.filter(i => i.status === 'accepted').length}
              </h3>
              <p className="text-sm text-gray-600">Accepted</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-yellow-100/50">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-yellow-600">
                {interests.filter(i => i.status === 'pending').length}
              </h3>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-red-100/50">
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-red-600">
                {interests.filter(i => i.status === 'declined').length}
              </h3>
              <p className="text-sm text-gray-600">Declined</p>
            </CardContent>
          </Card>
        </div>

        {/* Interests Grid */}
        {interests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interests.map((interest) => (
              <Card key={interest.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {interest.receiver && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          variant={
                            interest.status === 'accepted' ? 'default' : 
                            interest.status === 'declined' ? 'destructive' : 
                            'secondary'
                          }
                          className={
                            interest.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            interest.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-1">{interest.receiver.full_name}</h3>
                        <p className="text-gray-600 text-sm">
                          {interest.receiver.age} years • {interest.receiver.height} cm
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {interest.receiver.city}, {interest.receiver.state}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {interest.receiver.education}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {interest.receiver.occupation}
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{interest.message}</p>
                        <p className="text-xs text-gray-500 mt-1">Sent {formatDate(interest.created_at)}</p>
                      </div>

                      {interest.status === 'accepted' && (
                        <Link to={`/messages?user=${interest.receiver.user_id}`}>
                          <Button className="w-full mt-4">
                            Start Conversation
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Interests Sent Yet</h3>
              <p className="text-gray-600 mb-6">Start expressing interest in profiles you like</p>
              <Link to="/search">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Browse Profiles
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyInterests;
