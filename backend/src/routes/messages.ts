import express from 'express';
import { getSupabase } from '../config/supabase';

const router = express.Router();

// Send a message
router.post('/send', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { receiver_id, content, message_type = 'text', media_url } = req.body;
    const sender_id = req.user?.id || req.user?.user_id;

    if (!receiver_id || !content) {
      return res.status(400).json({ success: false, error: 'receiver_id and content are required' });
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id,
        receiver_id,
        content,
        message_type,
        media_url
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: message });
  } catch (error: any) {
    console.error('Send message error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Get conversation with a specific user
router.get('/conversation/:userId', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const currentUserId = req.user?.id || req.user?.user_id;
    const otherUserId = req.params.userId;
    const { limit = 50, offset = 0 } = req.query;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: {
        with: otherUserId,
        messages: messages || []
      }
    });
  } catch (error: any) {
    console.error('Get conversation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
});

// Get all conversations for current user
router.get('/conversations', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const currentUserId = req.user?.id || req.user?.user_id;

    // Get latest message for each conversation
    const { data: conversations, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender_profile:profiles!messages_sender_id_fkey(id, first_name, last_name, profile_picture_url),
        receiver_profile:profiles!messages_receiver_id_fkey(id, first_name, last_name, profile_picture_url)
      `)
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Group by conversation partner and get latest message
    const conversationMap = new Map();

    conversations?.forEach(message => {
      const partnerId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
      const partnerProfile = message.sender_id === currentUserId ? message.receiver_profile : message.sender_profile;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner_id: partnerId,
          partner_profile: partnerProfile,
          latest_message: message,
          unread_count: 0
        });
      }

      // Count unread messages (messages sent to current user that haven't been read)
      if (message.receiver_id === currentUserId && !message.read_at) {
        conversationMap.get(partnerId).unread_count++;
      }
    });

    const conversationList = Array.from(conversationMap.values());

    return res.json({ success: true, data: conversationList });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// Mark messages as read
router.post('/mark-read', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { sender_id } = req.body;
    const currentUserId = req.user?.id || req.user?.user_id;

    if (!sender_id) {
      return res.status(400).json({ success: false, error: 'sender_id is required' });
    }

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', sender_id)
      .eq('receiver_id', currentUserId)
      .is('read_at', null);

    if (error) {
      throw error;
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Mark read error:', error);
    return res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const messageId = req.params.id;
    const currentUserId = req.user?.id || req.user?.user_id;

    // Only allow deleting own messages
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', currentUserId);

    if (error) {
      throw error;
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Delete message error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
});

// Block user (placeholder - would need a blocked_users table)
router.post('/block', async (req, res) => {
  try {
    // This would typically create a record in a blocked_users table
    // For now, return success as placeholder
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    // TODO: Implement blocking logic with blocked_users table
    console.log(`User ${req.user?.id} wants to block user ${user_id}`);

    return res.json({ success: true, message: 'User blocked (placeholder)' });
  } catch (error: any) {
    console.error('Block user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to block user' });
  }
});

// Unblock user (placeholder - would need a blocked_users table)
router.post('/unblock', async (req, res) => {
  try {
    // This would typically remove a record from a blocked_users table
    // For now, return success as placeholder
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    // TODO: Implement unblocking logic with blocked_users table
    console.log(`User ${req.user?.id} wants to unblock user ${user_id}`);

    return res.json({ success: true, message: 'User unblocked (placeholder)' });
  } catch (error: any) {
    console.error('Unblock user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to unblock user' });
  }
});

export default router;

