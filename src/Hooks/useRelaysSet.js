import { getParsedRelaySet, shortenKey } from "@/Helpers/Encryptions";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

export default function useRelaysSet() {
  const userRelaysSet = useSelector((state) => state.userRelaysSet);
  const userRelaysSetSimplified = useMemo(() => {
    let tempObj = { ...userRelaysSet };
    delete tempObj.last_timestamp;
    return Object.entries(tempObj).map(([key, event]) => {
     let parsedEvent = getParsedRelaySet(event)
      return {
        id: key,
        ...parsedEvent
      };
    });
  }, [userRelaysSet]);

  return { userRelaysSet, userRelaysSetSimplified };
}
