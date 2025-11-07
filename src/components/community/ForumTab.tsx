
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Reply, Eye, Pin, Plus, MessageSquare } from 'lucide-react';
import { useCommunityForum } from '@/hooks/useCommunityForum';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { ForumSearch, ForumFilters } from './ForumSearch';
import { UserAvatar } from './UserAvatar';
import { formatDistanceToNow } from 'date-fns';

interface ForumTabProps {
  onCreatePost: () => void;
}

export const ForumTab: React.FC<ForumTabProps> = ({ onCreatePost }) => {
  const { user } = useSupabaseAuth();
  const { categories, posts, loading: forumLoading, likePost } = useCommunityForum();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ForumFilters>({ sortBy: 'newest' });

  // Filter and sort posts based on search and filters
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(post => post.category_id === filters.category);
    }

    if (filters.timeRange) {
      const now = new Date();
      const timeLimit = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          timeLimit.setHours(0, 0, 0, 0);
          break;
        case 'week':
          timeLimit.setDate(now.getDate() - 7);
          break;
        case 'month':
          timeLimit.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (filters.timeRange !== 'all') {
        filtered = filtered.filter(post => new Date(post.created_at) >= timeLimit);
      }
    }

    if (filters.hasReplies) {
      filtered = filtered.filter(post => post.reply_count > 0);
    }

    if (filters.isPinned) {
      filtered = filtered.filter(post => post.is_pinned);
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'popular':
          return b.like_count - a.like_count;
        case 'replies':
          return b.reply_count - a.reply_count;
        case 'newest':
        default:
          // Pinned posts first, then by date
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [posts, searchQuery, filters]);

  const handleLike = async (postId: string) => {
    await likePost(postId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Discussion Forum</h2>
        {user && (
          <Button onClick={onCreatePost}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      <ForumSearch
        onSearch={setSearchQuery}
        onFilterChange={setFilters}
        categories={categories}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Categories</h3>
              <div className="space-y-2">
                <Button 
                  variant={!filters.category ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilters(prev => ({ ...prev, category: undefined }))}
                >
                  All Categories ({posts.length})
                </Button>
                {categories.map((category) => {
                  const categoryPostCount = posts.filter(p => p.category_id === category.id).length;
                  return (
                    <Button
                      key={category.id}
                      variant={filters.category === category.id ? 'default' : 'ghost'}
                      className="w-full justify-between"
                      onClick={() => setFilters(prev => ({ ...prev, category: category.id }))}
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {categoryPostCount}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {forumLoading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  {searchQuery || Object.keys(filters).length > 1 
                    ? 'No posts match your search criteria.' 
                    : 'No posts yet. Be the first to start a discussion!'
                  }
                </p>
                {user && !searchQuery && Object.keys(filters).length <= 1 && (
                  <Button onClick={onCreatePost} className="mt-4">
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <UserAvatar userId={post.author_id} size="md" showName />
                      <div className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
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

                  <Link to={`/community/post/${post.id}`}>
                    <h3 className="text-lg font-semibold mb-2 hover:text-red-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        disabled={!user}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {post.like_count}
                      </Button>
                      <div className="flex items-center text-sm text-gray-500">
                        <Reply className="h-4 w-4 mr-1" />
                        {post.reply_count}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.view_count}
                      </div>
                    </div>
                    <Link to={`/community/post/${post.id}`}>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
