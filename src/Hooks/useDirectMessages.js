import { getWotConfig } from "@/Helpers/ClientHelpers";
import { getUser } from "@/Helpers/Controlers";
import { getWOTScoreForPubkeyLegacy } from "@/Helpers/Encryptions";
import { nip19 } from "nostr-tools";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function useDirectMessages() {
  const userKeys = useSelector((state) => state.userKeys);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userFollowings = useSelector((state) => state.userFollowings);
  const userChatrooms = useSelector((state) => state.userChatrooms);
  const [sortedInbox, setSortedInbox] = useState([]);
  const [msgsCount, setMsgsCount] = useState({
    followings: 0,
    known: 0,
    unknown: 0,
  });
  const isNewMsg = useMemo(() => {
    return userChatrooms.find((chatroom) => !chatroom.checked);
  }, [userChatrooms]);
  useEffect(() => {
    if (!userKeys) setSortedInbox([]);
  }, [userKeys]);

  useEffect(() => {
    let followings = 0;
    let known = 0;
    let unknown = 0;
    let { score, dms } = getWotConfig();
    let tempChatrooms = userChatrooms
      .filter((_) => {
        if (getWOTScoreForPubkeyLegacy(_.pubkey, dms, score).status)
          return true;
      })
      .map((chatroom) => {
        let contact = getUser(chatroom.pubkey);

        let isFollowing = userFollowings?.includes(chatroom.pubkey)
          ? "following"
          : false;
        let isUnknown = false;
        let isKnown = false;
        if (!isFollowing) {
          isUnknown = chatroom.convo.find(
            (conv) => conv.pubkey === userKeys.pub
          )
            ? false
            : "unknown";

          if (!isUnknown) isKnown = "known";
        }
        if (isFollowing) followings = followings + 1;
        if (isUnknown) unknown = unknown + 1;
        if (isKnown) known = known + 1;
        if (contact)
          return {
            ...contact,
            ...chatroom,
            type: isFollowing || isUnknown || isKnown,
          };
        return {
          ...chatroom,
          picture: "",
          display_name: nip19.npubEncode(chatroom.pubkey).substring(0, 10),
          name: nip19.npubEncode(chatroom.pubkey).substring(0, 10),
          type: isFollowing || isUnknown || isKnown,
        };
      });

    setMsgsCount({ followings, known, unknown });
    setSortedInbox(tempChatrooms);

  }, [userChatrooms, userFollowings, nostrAuthors]);

  return { sortedInbox, msgsCount, userChatrooms , isNewMsg};
}
