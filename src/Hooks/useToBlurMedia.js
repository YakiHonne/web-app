import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import useCustomizationSettings from "./useCustomizationSettings";

export default function useToBlurMedia({ pubkey, noBlur = false }) {
  const [isOpened, setIsOpened] = useState(false);
  const userKeys = useSelector((state) => state.userKeys);
  const userFollowings = useSelector((state) => state.userFollowings);
  const { blurNonFollowedMedia } = useCustomizationSettings();
  const toBlur = useMemo(() => {
    const toBlurSettings =
      blurNonFollowedMedia === undefined ? true : blurNonFollowedMedia;
    let isFollowed = [...userFollowings, userKeys?.pub].includes(pubkey);
    if (noBlur) return false;
    return !toBlurSettings ? false : isFollowed ? false : true;
  }, [userFollowings, isOpened, userKeys, blurNonFollowedMedia]);

  return {
    toBlur,
    setIsOpened,
  };
}
