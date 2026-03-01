import { useDispatch, useSelector } from "react-redux";
import { InitEvent } from "@/Helpers/Controlers";
import { setToPublish } from "@/Store/Slides/Publishers";
import { useMemo, useState } from "react";

const checkFollowing = (list, toFollowKey) => {
  if (!list) return false;
  return list.find((people) => people === toFollowKey) ? true : false;
};
export default function useFollowUsers({ pubkey, pubkeys }) {
  const dispatch = useDispatch();
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
      if (isFollowLoading) setIsFollowLoading(true);
      let tempTags = Array.from(userFollowings || []);
      if (isFollowing) {
        let index = tempTags.findIndex((item) => item === pubkey);
        tempTags.splice(index, 1);
      } else {
        tempTags.push(pubkey);
      }
      const eventInitEx = await InitEvent(
        3,
        "",
        tempTags.map((p) => ["p", p]),
      );
      if (!eventInitEx) {
        setIsFollowLoading(false);
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
        }),
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
      let tempTags = Array.from(userFollowings || []);
      if (!isAllFollowing) {
        tempTags.push(...pubkeys);
      } else tempTags = tempTags.filter((_) => !pubkeys.includes(_));
      tempTags = [...new Set(tempTags)];
      const eventInitEx = await InitEvent(
        3,
        "",
        tempTags.map((p) => ["p", p]),
      );
      if (!eventInitEx) {
        setIsFollowLoading(false);
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
        }),
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
