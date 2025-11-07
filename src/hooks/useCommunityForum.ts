
import { useForumCategories } from './forum/useForumCategories';
import { useForumPosts, ForumPost } from './forum/useForumPosts';
import { useForumReplies } from './forum/useForumReplies';

export type { ForumCategory } from './forum/useForumCategories';
export type { ForumPost } from './forum/useForumPosts';
export type { ForumReply } from './forum/useForumReplies';

export const useCommunityForum = () => {
  const { categories, fetchCategories } = useForumCategories();
  const { 
    posts, 
    loading, 
    fetchPosts, 
    createPost, 
    likePost, 
    incrementViewCount 
  } = useForumPosts();
  const { 
    replies, 
    fetchReplies, 
    createReply, 
    likeReply 
  } = useForumReplies();

  return {
    categories,
    posts,
    replies,
    loading,
    fetchCategories,
    fetchPosts,
    fetchReplies,
    createPost,
    createReply,
    likePost,
    likeReply,
    incrementViewCount
  };
};
