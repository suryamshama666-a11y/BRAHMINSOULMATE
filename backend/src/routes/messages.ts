import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get error message
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

// Conversation type
interface Conversation {
  profile: Record<string, unknown> | null;
  lastMessage: Record<string, unknown> | null;
  unreadCount: number;
}

// Send message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const senderId = req.user?.id;
    const { receiverId, content, type = 'text' } = req.body;

    // Check if users are connected
    const { data: connection } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user_id_1.eq.${senderId},user_id_2.eq.${receiverId}),and(user_id_1.eq.${receiverId},user_id_2.eq.${senderId})`)
      .eq('status', 'active')
      .single();

    if (!connection) {
      return res.status(403).json({ success: false, error: 'Users must be connected to message' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        type,
        read: false
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification
    await supabase.from('notifications').insert({
      user_id: receiverId,
      type: 'new_message',
      title: 'New Message',
      message: 'You have a new message',
      action_url: `/messages/${senderId}`,
      sender_id: senderId
    });

    res.json({ success: true, message: data });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Get conversation
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', userId)
      .eq('receiver_id', currentUserId)
      .eq('read', false);

    res.json({ success: true, messages: data });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Get all conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get all unique conversation partners
    const { data: messages, error } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, created_at')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get unique partners
    const partners = new Set<string>();
    messages?.forEach(msg => {
      if (msg.sender_id !== userId) partners.add(msg.sender_id);
      if (msg.receiver_id !== userId) partners.add(msg.receiver_id);
    });

    const conversations: Conversation[] = [];
    for (const partnerId of partners) {
      // Get partner profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single();

      // Get last message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get unread count
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', userId)
        .eq('read', false);

      conversations.push({
        profile,
        lastMessage,
        unreadCount: count || 0
      });
    }

    // Sort by last message time
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.created_at as string | undefined;
      const bTime = b.lastMessage?.created_at as string | undefined;
      return new Date(bTime || 0).getTime() - new Date(aTime || 0).getTime();
    });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Mark as read
router.post('/mark-read/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.params;

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', userId)
      .eq('receiver_id', currentUserId)
      .eq('read', false);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Delete message
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

export default router;
