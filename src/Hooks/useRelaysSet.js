import { shortenKey } from "@/Helpers/Encryptions";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

export default function useRelaysSet() {
  const userRelaysSet = useSelector((state) => state.userRelaysSet);
  const userRelaysSetSimplified = useMemo(() => {
    let tempObj = { ...userRelaysSet };
    delete tempObj.last_timestamp;
    return Object.entries(tempObj).map(([key, event]) => {
      let title = "";
      let description = "";
      let image = "";
      let relays = [];
      for (let tag of event.tags) {
        if (tag[0] === "title") title = tag[1];
        if (tag[0] === "description") description = tag[1];
        if (tag[0] === "image") image = tag[1];
        if (tag[0] === "relay") relays.push(tag[1]);
      }
      if (!title) {
        let allRelays = relays.join(", ").replaceAll("wss://", "").replaceAll("ws://", "");
        title =
          allRelays.length > 20
            ? shortenKey(allRelays, 8)
            : allRelays || `Relays set (${relays.length}) relays`;
      }
      return {
        id: key,
        title,
        description,
        image,
        relays,
      };
    });
  }, [userRelaysSet]);

  return { userRelaysSet, userRelaysSetSimplified };
}
