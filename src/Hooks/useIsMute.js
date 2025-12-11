import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InitEvent } from "@/Helpers/Controlers";
import { setToPublish } from "@/Store/Slides/Publishers";

export default function useIsMute(id, kind = "p") {
  const dispatch = useDispatch();
  const { userMutedList, allTags } = useSelector((state) => state.userMutedList);

  const isMuted = useMemo(() => {
    let checkProfile = () => {
      if (!Array.isArray(userMutedList)) return false;
      return userMutedList.includes(id);
    };
    return id ? checkProfile() : false;
  }, [userMutedList, id]);

  const muteUnmute = async () => {
    try {
      if (!Array.isArray(userMutedList)) return;
      let tempTags = Array.from(allTags?.length > 0 ? allTags : userMutedList.map((id) => ["p", id]));
      if (isMuted) {
        tempTags = tempTags.filter((tag) => tag[1] !== id);
      } else {
        tempTags.push([kind, id]);
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
