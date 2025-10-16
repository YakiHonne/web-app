import { getCustomSettings } from "@/Helpers/ClientHelpers";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function useToBlurMedia({ pubkey }) {
  const [isOpened, setIsOpened] = useState(false);
  const userKeys = useSelector((state) => state.userKeys);
  const userFollowings = useSelector((state) => state.userFollowings);
  const customSettings = getCustomSettings();
  const toBlurSettings =
    customSettings.blurNonFollowedMedia === undefined
      ? true
      : customSettings.blurNonFollowedMedia;
  const toBlur = useMemo(() => {
    let isFollowed = [...userFollowings, userKeys?.pub].includes(pubkey);
    return !toBlurSettings ? false : isFollowed ? false : !isOpened;
  }, [userFollowings, isOpened, userKeys]);

  return {
    toBlur,
    setIsOpened,
  };
}
