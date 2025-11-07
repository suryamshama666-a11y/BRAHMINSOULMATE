
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export interface UserInterest {
  id: string;
  user_id: string;
  interest_name: string;
  category: string;
  created_at: string;
}

export interface InterestExchange {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  created_at: string;
}

export const useInterests = () => {
  const { user } = useSupabaseAuth();
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [sentInterests, setSentInterests] = useState<InterestExchange[]>([]);
  const [receivedInterests, setReceivedInterests] = useState<InterestExchange[]>([]);
  const [mutualInterests, setMutualInterests] = useState<InterestExchange[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock interests data since table doesn't exist
  const mockInterests: UserInterest[] = [
    { id: '1', user_id: user?.id || '', interest_name: 'Photography', category: 'Hobbies', created_at: new Date().toISOString() },
    { id: '2', user_id: user?.id || '', interest_name: 'Cooking', category: 'Hobbies', created_at: new Date().toISOString() },
    { id: '3', user_id: user?.id || '', interest_name: 'Travel', category: 'Lifestyle', created_at: new Date().toISOString() },
    { id: '4', user_id: user?.id || '', interest_name: 'Reading', category: 'Entertainment', created_at: new Date().toISOString() },
    { id: '5', user_id: user?.id || '', interest_name: 'Music', category: 'Entertainment', created_at: new Date().toISOString() }
  ];

  const mockSentInterests: InterestExchange[] = [
    { id: 'sent-1', sender_id: user?.id || '', receiver_id: 'user-2', status: 'pending', message: 'I would like to connect with you.', created_at: new Date().toISOString() },
    { id: 'sent-2', sender_id: user?.id || '', receiver_id: 'user-3', status: 'accepted', message: 'I find your profile interesting.', created_at: new Date().toISOString() }
  ];

  const mockReceivedInterests: InterestExchange[] = [
    { id: 'received-1', sender_id: 'user-4', receiver_id: user?.id || '', status: 'pending', message: 'Hello, I would like to know you better.', created_at: new Date().toISOString() },
    { id: 'received-2', sender_id: 'user-5', receiver_id: user?.id || '', status: 'pending', message: 'Your profile caught my attention.', created_at: new Date().toISOString() }
  ];

  const fetchInterests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Simulate API delay
      setTimeout(() => {
        setInterests(mockInterests);
        setSentInterests(mockSentInterests);
        setReceivedInterests(mockReceivedInterests);
        setMutualInterests(mockSentInterests.filter(i => i.status === 'accepted'));
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching interests:', error);
      toast.error('Failed to load interests');
      setLoading(false);
    }
  };

  const addInterest = async (interestData: { interest_name: string; category: string }) => {
    if (!user) {
      toast.error('Please login to add interests');
      return { success: false };
    }

    try {
      const newInterest: UserInterest = {
        id: `interest-${Date.now()}`,
        user_id: user.id,
        interest_name: interestData.interest_name,
        category: interestData.category,
        created_at: new Date().toISOString()
      };

      setInterests(prev => [...prev, newInterest]);
      toast.success('Interest added successfully!');
      return { success: true, interest: newInterest };
    } catch (error: any) {
      console.error('Error adding interest:', error);
      toast.error('Failed to add interest');
      return { success: false, error: error.message };
    }
  };

  const removeInterest = async (interestId: string) => {
    if (!user) {
      toast.error('Please login to remove interests');
      return { success: false };
    }

    try {
      setInterests(prev => prev.filter(interest => interest.id !== interestId));
      toast.success('Interest removed successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error removing interest:', error);
      toast.error('Failed to remove interest');
      return { success: false, error: error.message };
    }
  };

  const sendInterest = async (receiverId: string, message: string = 'I would like to connect with you.') => {
    if (!user) {
      toast.error('Please login to send interests');
      return { success: false };
    }

    try {
      const newInterest: InterestExchange = {
        id: `sent-${Date.now()}`,
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending',
        message,
        created_at: new Date().toISOString()
      };

      setSentInterests(prev => [...prev, newInterest]);
      toast.success('Interest sent successfully!');
      return { success: true, interest: newInterest };
    } catch (error: any) {
      console.error('Error sending interest:', error);
      toast.error('Failed to send interest');
      return { success: false, error: error.message };
    }
  };

  const respondToInterest = async (interestId: string, response: 'accepted' | 'rejected') => {
    if (!user) {
      toast.error('Please login to respond to interests');
      return { success: false };
    }

    try {
      setReceivedInterests(prev => 
        prev.map(interest => 
          interest.id === interestId 
            ? { ...interest, status: response }
            : interest
        )
      );

      if (response === 'accepted') {
        const acceptedInterest = receivedInterests.find(i => i.id === interestId);
        if (acceptedInterest) {
          setMutualInterests(prev => [...prev, { ...acceptedInterest, status: 'accepted' }]);
        }
      }

      toast.success(`Interest ${response} successfully!`);
      return { success: true };
    } catch (error: any) {
      console.error('Error responding to interest:', error);
      toast.error('Failed to respond to interest');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchInterests();
  }, [user]);

  return {
    interests,
    sentInterests,
    receivedInterests,
    mutualInterests,
    loading,
    fetchInterests,
    addInterest,
    removeInterest,
    sendInterest,
    respondToInterest
  };
};
