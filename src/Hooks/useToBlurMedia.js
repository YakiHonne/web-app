import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function useToBlurMedia({ pubkey }) {
  const [isOpened, setIsOpened] = useState(false);
  const userFollowings = useSelector((state) => state.userFollowings);
  const toBlur = useMemo(() => {
    let isFollowed = userFollowings.includes(pubkey);
    return isFollowed ? false : !isOpened;
  }, [userFollowings, isOpened]);

  return {
    toBlur,
    setIsOpened,
  };
}
