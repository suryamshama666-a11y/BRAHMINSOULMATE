import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

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
  updated_at: string;
}

export const useInterests = () => {
  const { user } = useSupabaseAuth();
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [sentInterests, setSentInterests] = useState<InterestExchange[]>([]);
  const [receivedInterests, setReceivedInterests] = useState<InterestExchange[]>([]);
  const [mutualInterests, setMutualInterests] = useState<InterestExchange[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInterests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user's own interests
      const { data: userInterests, error: interestError } = await (supabase as any)
        .from('user_interests')
        .select('*')
        .eq('user_id', user.id);

      if (interestError) throw interestError;
      setInterests(userInterests || []);

      // Fetch sent interest exchanges
      const { data: sent, error: sentError } = await (supabase as any)
        .from('interest_exchanges')
        .select('*')
        .eq('sender_id', user.id);

      if (sentError) throw sentError;
      setSentInterests(sent || []);

      // Fetch received interest exchanges
      const { data: received, error: receivedError } = await (supabase as any)
        .from('interest_exchanges')
        .select('*')
        .eq('receiver_id', user.id);

      if (receivedError) throw receivedError;
      setReceivedInterests(received || []);

      // Filter mutual interests (where status is accepted)
      const mutual = [
        ...(sent || []).filter((i: any) => i.status === 'accepted'),
        ...(received || []).filter((i: any) => i.status === 'accepted')
      ];
      setMutualInterests(mutual);

    } catch (error) {
      logger.error('Error fetching interests:', error);
      toast.error('Failed to load interests');
    } finally {
      setLoading(false);
    }
  };

  // effect:audited — Real-time Supabase subscription for interest exchanges
  useEffect(() => {
    if (!user) return;

    fetchInterests();

    const channel = supabase
      .channel('interest_exchanges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interest_exchanges',
          filter: `sender_id=eq.${user.id}`,
        },
        () => fetchInterests()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interest_exchanges',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => fetchInterests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addInterest = async (interestData: { interest_name: string; category: string }) => {
    if (!user) {
      toast.error('Please login to add interests');
      return { success: false };
    }

    try {
      const { data, error } = await (supabase as any)
        .from('user_interests')
        .insert({
          user_id: user.id,
          interest_name: interestData.interest_name,
          category: interestData.category
        })
        .select()
        .single();

      if (error) throw error;

      setInterests(prev => [...prev, data]);
      toast.success('Interest added successfully!');
      return { success: true, interest: data };
    } catch (error: any) {
      logger.error('Error adding interest:', error);
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
      const { error } = await (supabase as any)
        .from('user_interests')
        .delete()
        .eq('id', interestId)
        .eq('user_id', user.id);

      if (error) throw error;

      setInterests(prev => prev.filter(interest => interest.id !== interestId));
      toast.success('Interest removed successfully!');
      return { success: true };
    } catch (error: any) {
      logger.error('Error removing interest:', error);
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
      const { data, error } = await (supabase as any)
        .from('interest_exchanges')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          message,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Interest sent successfully!');
      return { success: true, interest: data };
    } catch (error: any) {
      logger.error('Error sending interest:', error);
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
      const { data, error } = await (supabase as any)
        .from('interest_exchanges')
        .update({ status: response, updated_at: new Date().toISOString() })
        .eq('id', interestId)
        .eq('receiver_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Interest ${response} successfully!`);
      return { success: true, interest: data };
    } catch (error: any) {
      logger.error('Error responding to interest:', error);
      toast.error('Failed to respond to interest');
      return { success: false, error: error.message };
    }
  };

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
