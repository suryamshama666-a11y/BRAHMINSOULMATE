
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, ThumbsUp, Reply, Eye, 
  MessageSquare, Share2, Flag, Pin 
} from 'lucide-react';
import { useForumPosts } from '@/hooks/forum/useForumPosts';
import { useForumReplies } from '@/hooks/forum/useForumReplies';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { UserAvatar } from '@/components/community/UserAvatar';
import { formatDistanceToNow } from 'date-fns';

export default function ForumPost() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { posts, fetchPosts, likePost, incrementViewCount } = useForumPosts();
  const { replies, fetchReplies, createReply, likeReply } = useForumReplies();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const post = posts.find(p => p.id === postId);

  useEffect(() => {
    if (postId) {
      // Fetch posts if not already loaded
      if (posts.length === 0) {
        fetchPosts();
      }
      // Fetch replies for this post
      fetchReplies(postId);
      // Increment view count
      incrementViewCount(postId);
    }
  }, [postId, fetchPosts, fetchReplies, incrementViewCount, posts.length]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !postId) return;

    setIsSubmitting(true);
    const result = await createReply(postId, replyContent.trim(), replyToId || undefined);
    
    if (result.success) {
      setReplyContent('');
      setReplyToId(null);
    }
    setIsSubmitting(false);
  };

  const handleLike = async () => {
    if (!postId) return;
    await likePost(postId);
  };

  const handleReplyLike = async (replyId: string) => {
    await likeReply(replyId);
  };

  const handleReplyTo = (replyId: string) => {
    setReplyToId(replyId);
    setReplyContent('');
  };

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Button onClick={() => navigate('/community')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forum
          </Button>
        </div>
      </div>
    );
  }

  const postReplies = replies.filter(r => !r.parent_reply_id);
  const getNestedReplies = (parentId: string) => 
    replies.filter(r => r.parent_reply_id === parentId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/community')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>
      </div>

      {/* Main Post */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <UserAvatar userId={post.author_id} size="lg" />
              <div>
                <UserAvatar userId={post.author_id} showName />
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {post.is_pinned && (
                <Badge variant="secondary">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
              {post.is_locked && (
                <Badge variant="destructive">Locked</Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                disabled={!user}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {post.like_count}
              </Button>
              <div className="flex items-center text-sm text-gray-500">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.reply_count} replies
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="h-4 w-4 mr-1" />
                {post.view_count} views
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {user && !post.is_locked && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Reply to this post</CardTitle>
            {replyToId && (
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">Replying to a comment</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setReplyToId(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReply} className="space-y-4">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                required
              />
              <Button type="submit" disabled={!replyContent.trim() || isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="mb-6">
          <CardContent className="text-center py-6">
            <p className="text-gray-600 mb-4">Please log in to join the discussion</p>
            <Button onClick={() => navigate('/login')}>
              Log In to Reply
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Replies ({postReplies.length})
        </h3>

        {postReplies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No replies yet. Be the first to respond!</p>
            </CardContent>
          </Card>
        ) : (
          postReplies.map((reply) => (
            <div key={reply.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <UserAvatar userId={reply.author_id} size="sm" showName />
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{reply.content}</p>

                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleReplyLike(reply.id)}
                      disabled={!user}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {reply.like_count}
                    </Button>
                    {user && !post.is_locked && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReplyTo(reply.id)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Nested Replies */}
              {getNestedReplies(reply.id).map((nestedReply) => (
                <Card key={nestedReply.id} className="ml-8 mt-2">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <UserAvatar userId={nestedReply.author_id} size="sm" showName />
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(nestedReply.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">{nestedReply.content}</p>

                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReplyLike(nestedReply.id)}
                        disabled={!user}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {nestedReply.like_count}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
