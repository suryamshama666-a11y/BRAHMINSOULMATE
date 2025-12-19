import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { interestsService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProfileCard from '@/components/ProfileCard';

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

  const handleAction = (action: string, interestId: string) => {
    if (action === 'accept') {
      acceptMutation.mutate(interestId);
    } else if (action === 'decline') {
      declineMutation.mutate(interestId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const pendingInterests = interests.filter(i => i.status === 'pending');

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

        {pendingInterests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingInterests.map((interest) => (
              interest.sender && (
                <ProfileCard 
                  key={interest.id}
                  profile={{
                    ...interest.sender,
                    id: interest.id, // Using interest.id as profile.id for the action handler
                    name: interest.sender.full_name,
                    status: interest.status,
                    message: interest.message,
                    receivedDate: new Date(interest.created_at).toLocaleDateString()
                  }}
                  variant="received"
                  onAction={(action) => handleAction(action, interest.id)}
                />
              )
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
