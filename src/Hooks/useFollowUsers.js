import { useSelector } from "react-redux";
import { useMemo, useState } from "react";
import { publishFollowChanges } from "@/Helpers/FollowList";

const checkFollowing = (list, toFollowKey) => {
  if (!list) return false;
  return list.find((people) => people === toFollowKey) ? true : false;
};
export default function useFollowUsers({ pubkey, pubkeys }) {
  const userFollowings = useSelector((state) => state.userFollowings);
  const isFollowing = useMemo(() => {
    if (!pubkey) return false;
    let memo = checkFollowing(userFollowings, pubkey);
    return memo;
  }, [userFollowings, pubkey]);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const isAllFollowing = useMemo(() => {
    const supersetSet = new Set(userFollowings);
    const isAllIncluded = pubkeys.every((item) => supersetSet.has(item));
    return isAllIncluded;
  }, [userFollowings, pubkey]);
  const followUnfollow = async () => {
    try {
      if (isFollowLoading) return;
      setIsFollowLoading(true);
      await publishFollowChanges(
        isFollowing ? { unfollow: [pubkey] } : { follow: [pubkey] },
      );
      setIsFollowLoading(false);
    } catch (error) {
      console.log(error);
      setIsFollowLoading(false);
    }
  };
  const followUnfollowBulk = async (pubkeys) => {
    try {
      if (isFollowLoading) return;
      setIsFollowLoading(true);
      await publishFollowChanges(
        isAllFollowing ? { unfollow: pubkeys } : { follow: pubkeys },
      );
      setIsFollowLoading(false);
    } catch (error) {
      console.log(error);
      setIsFollowLoading(false);
    }
  };

  return {
    isFollowing,
    followUnfollow,
    followUnfollowBulk,
    isFollowLoading,
    isAllFollowing,
  };
}
