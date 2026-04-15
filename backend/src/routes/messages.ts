import express from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { messageLimiter } from '../middleware/rateLimiter';
import { softDelete, filterDeleted } from '../middleware/softDelete';

const router = express.Router();

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
router.post('/send', authMiddleware, messageLimiter, async (req, res) => {
  try {
    const senderId = req.user?.id;
    const { receiverId, content, type = 'text', attachmentUrl = null } = req.body;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(receiverId)) {
      return res.status(400).json({ success: false, error: 'Invalid receiver ID format' });
    }

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
        message_type: type,
        attachment_url: attachmentUrl,
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
      .is('deleted_at', null)  // ✅ NEW: Filter out deleted messages
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', userId)
      .eq('receiver_id', currentUserId)
      .eq('read', false)
      .is('deleted_at', null);  // ✅ NEW: Only update non-deleted messages

    res.json({ success: true, messages: data });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Get all conversations - Optimized with batched queries to avoid N+1
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    // 1. Get all unique conversation partners in one call
    const { data: partnersData, error: partnersError } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, created_at, content, message_type, read')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .is('deleted_at', null)  // ✅ NEW: Filter out deleted messages
      .order('created_at', { ascending: false });

    if (partnersError) throw partnersError;

    // 2. Identify unique partner IDs and their latest message
    const partnerMap = new Map<string, any>();
    partnersData?.forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          lastMessage: msg,
          unreadCount: 0
        });
      }
      // Increment unread count if applicable
      if (msg.receiver_id === userId && !msg.read) {
        partnerMap.get(partnerId).unreadCount++;
      }
    });

    const partnerIds = Array.from(partnerMap.keys());
    if (partnerIds.length === 0) {
      return res.json({ success: true, conversations: [] });
    }

    // 3. Batch fetch all partner profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, display_name, profile_picture_url, last_active, verified')
      .in('user_id', partnerIds);

    if (profilesError) throw profilesError;

    // 4. Assemble final conversations array
    const conversations = profiles.map(profile => {
      const partnerData = partnerMap.get(profile.user_id);
      return {
        profile,
        lastMessage: partnerData.lastMessage,
        unreadCount: partnerData.unreadCount
      };
    });

    // 5. Final sort by last message time
    conversations.sort((a, b) => {
      return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
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

    // SECURITY FIX: Verify ownership BEFORE delete (was reversed - IDOR vulnerability)
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('id, sender_id')
      .eq('id', messageId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    if (message.sender_id !== userId) {
      return res.status(403).json({ success: false, error: 'You can only delete your own messages' });
    }

    // Now safe to soft delete — ownership verified
    const { error } = await softDelete('messages', messageId);
    if (error) throw error;

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

export default router;
