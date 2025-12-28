import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InitEvent } from "@/Helpers/Controlers";
import { setToPublish } from "@/Store/Slides/Publishers";

export default function useIsPinnedNote(id) {
  const dispatch = useDispatch();
  const pinnedNotes = useSelector((state) => state.userPinnedNotes);

  const isPinned = useMemo(() => {
    let checkProfile = () => {
      if (!Array.isArray(pinnedNotes)) return false;
      return pinnedNotes.includes(id);
    };
    return id ? checkProfile() : false;
  }, [pinnedNotes, id]);

  const pinUnpin = async () => {
    try {
      if (!Array.isArray(pinnedNotes)) return;
      let tempTags = Array.from(pinnedNotes?.length > 0 ? pinnedNotes : []);
      if (isPinned) {
        tempTags = tempTags.filter((e) => e !== id);
      } else {
        tempTags.unshift(id);
      }
      tempTags = tempTags.map((e) => ["e", e]);
      let eventInitEx = await InitEvent(10001, "", tempTags);
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
  return { pinUnpin, isPinned };
}
