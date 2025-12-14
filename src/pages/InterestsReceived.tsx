import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Check, X, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { interestsService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const InterestsReceived = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch received interests
  const { data: interests = [], isLoading: loading } = useQuery({
    queryKey: ['interests', 'received', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await interestsService.getReceivedInterests();
    },
    enabled: !!user?.id
  });

  // Accept interest mutation
  const acceptMutation = useMutation({
    mutationFn: async (interestId: string) => {
      await interestsService.acceptInterest(interestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
      toast.success('Interest accepted! You can now message each other.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept interest');
    }
  });

  // Decline interest mutation
  const declineMutation = useMutation({
    mutationFn: async (interestId: string) => {
      await interestsService.declineInterest(interestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
      toast.success('Interest declined');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to decline interest');
    }
  });

  const handleAccept = (interestId: string) => {
    acceptMutation.mutate(interestId);
  };

  const handleDecline = (interestId: string) => {
    declineMutation.mutate(interestId);
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
            <Heart className="h-8 w-8 mr-3 text-red-600" />
            Interests Received
          </h1>
          <p className="text-gray-600">People who are interested in your profile</p>
        </div>

        {interests.filter(i => i.status === 'pending').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interests
              .filter(i => i.status === 'pending')
              .map((interest) => (
              <Card key={interest.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {interest.sender && (
                    <>
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-1">{interest.sender.full_name}</h3>
                        <p className="text-gray-600 text-sm">
                          {interest.sender.age} years • {interest.sender.height} cm
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {interest.sender.city}, {interest.sender.state}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {interest.sender.education}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {interest.sender.occupation}
                        </div>
                        {interest.sender.gotra && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Badge variant="outline">{interest.sender.gotra}</Badge>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm text-gray-700">{interest.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(interest.created_at)}</p>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Button
                          onClick={() => handleAccept(interest.id)}
                          disabled={acceptMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleDecline(interest.id)}
                          disabled={declineMutation.isPending}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
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
              <h3 className="text-xl font-semibold mb-2">No Interests Yet</h3>
              <p className="text-gray-600">You haven't received any interests yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InterestsReceived;
