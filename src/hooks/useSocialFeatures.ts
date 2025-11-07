
import { useUserFollows } from './social/useUserFollows';
import { useCommunityGroups } from './social/useCommunityGroups';
import { useUserActivities } from './social/useUserActivities';

export type { UserFollow } from './social/useUserFollows';
export type { CommunityGroup } from './social/useCommunityGroups';
export type { UserActivity } from './social/useUserActivities';

export const useSocialFeatures = () => {
  const { following, followers, followUser, unfollowUser, refetch: refetchFollows } = useUserFollows();
  const { communityGroups, fetchCommunityGroups, createCommunityGroup, joinGroup, leaveGroup } = useCommunityGroups();
  const { activities, loading, fetchActivities, createActivity } = useUserActivities();

  return {
    following,
    followers,
    communityGroups,
    activities,
    loading,
    followUser,
    unfollowUser,
    createCommunityGroup,
    joinGroup,
    leaveGroup,
    createActivity,
    fetchActivities,
    fetchCommunityGroups,
    refetchFollows
  };
};
