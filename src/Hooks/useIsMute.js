import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InitEvent } from "@/Helpers/Controlers";
import { setToPublish } from "@/Store/Slides/Publishers";

export default function useIsMute(pubkey) {
  const dispatch = useDispatch();
  const userMutedList = useSelector((state) => state.userMutedList);

  const isMuted = useMemo(() => {
    let checkProfile = () => {
      if (!Array.isArray(userMutedList)) return false;
      let index = userMutedList.findIndex(
        (item) => item === pubkey
      );
      if (index === -1) {
        return false;
      }
      return { index };
    };
    return pubkey ? checkProfile() : false;
  }, [userMutedList]);

  const muteUnmute = async () => {
    try {
      if (!Array.isArray(userMutedList)) return;
      let tempTags = Array.from(userMutedList.map((pubkey) => ["p", pubkey]));
      if (isMuted) {
        tempTags.splice(isMuted.index, 1);
      } else {
        tempTags.push(["p", pubkey]);
      }
      let eventInitEx = await InitEvent(10000, "", tempTags);
      if (eventInitEx) {
        dispatch(
          setToPublish({
            eventInitEx,
          })
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  return { muteUnmute, isMuted };
}
