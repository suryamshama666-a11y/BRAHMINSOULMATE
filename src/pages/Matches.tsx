import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Briefcase, GraduationCap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { matchingService, interestsService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Matches = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch matches
  const { data: matches = [], isLoading: loading } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const data = await matchingService.getMatches(user.id, 20);
      return data;
    },
    enabled: !!user?.id
  });

  // Recalculate matches mutation
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      await matchingService.calculateMatches(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Matches recalculated successfully!');
    },
    onError: () => {
      toast.error('Failed to recalculate matches');
    }
  });

  // Send interest mutation
  const sendInterestMutation = useMutation({
    mutationFn: async ({ profileId, message }: { profileId: string; message: string }) => {
      await interestsService.sendInterest(profileId, message);
    },
    onSuccess: () => {
      toast.success('Interest sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send interest');
    }
  });

  const handleSendInterest = async (profileId: string) => {
    sendInterestMutation.mutate({
      profileId,
      message: 'Hi! I found your profile interesting and would like to connect.'
    });
  };

  const handleRecalculate = () => {
    recalculateMutation.mutate();
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Your Matches</h1>
            <p className="text-gray-600">
              {matches.length} profiles matched based on your preferences
            </p>
          </div>
          <Button
            onClick={handleRecalculate}
            disabled={recalculateMutation.isPending}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
            Recalculate Matches
          </Button>
        </div>

        {matches.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No matches found yet.</p>
              <Button onClick={handleRecalculate}>Calculate Matches</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {match.compatibility_score}% Match
                    </Badge>
                  </div>
                  
                  {match.profile && (
                    <>
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-1">{match.profile.full_name}</h3>
                        <p className="text-gray-600 text-sm">
                          {match.profile.age} years • {match.profile.height} cm
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {match.profile.city}, {match.profile.state}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {match.profile.education}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {match.profile.occupation}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSendInterest(match.profile.user_id)}
                        disabled={sendInterestMutation.isPending}
                        className="w-full"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Send Interest
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
