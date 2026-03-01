import { getParsedPacksEvent } from "@/Helpers/Encryptions";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { deleteMediaPack, deleteStarterPack } from "@/Helpers/DB";

export default function usePacks() {
  const userKeys = useSelector((state) => state.userKeys);
  const userStarterPacks = useSelector((state) => state.userStarterPacks);
  const userMediaPacks = useSelector((state) => state.userMediaPacks);
  const userStarterPacksSimplified = useMemo(() => {
    let tempObj = { ...userStarterPacks };
    delete tempObj.last_timestamp;
    return Object.entries(tempObj).map(([key, event]) => {
      let parsedEvent = getParsedPacksEvent(event);
      return {
        id: key,
        ...parsedEvent,
      };
    });
  }, [userStarterPacks]);
  const userMediaPacksSimplified = useMemo(() => {
    let tempObj = { ...userMediaPacks };
    delete tempObj.last_timestamp;
    return Object.entries(tempObj).map(([key, event]) => {
      let parsedEvent = getParsedPacksEvent(event);
      return {
        id: key,
        ...parsedEvent,
      };
    });
  }, [userMediaPacks]);

  const removePack = (id, type = "s") => {
    if (type === "s") {
      let pack = userStarterPacksSimplified.find((_) => _.id === id);
      deleteStarterPack(pack.aTag, userKeys.pub);
    } else {
      let pack = userMediaPacksSimplified.find((_) => _.id === id);
      deleteMediaPack(pack.aTag, userKeys.pub);
    }
  };

  return {
    userStarterPacks,
    userStarterPacksSimplified,
    userMediaPacks,
    userMediaPacksSimplified,
    removePack,
  };
}
