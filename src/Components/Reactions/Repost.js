import React, { useEffect, useState } from "react";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { useDispatch, useSelector } from "react-redux";
import { getEventStatAfterEOSE, InitEvent } from "@/Helpers/Controlers";
import { saveEventStats } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";
import LoginSignup from "@/Components/LoginSignup";

export default function Repost({ isReposted, event, actions }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [isLoading, setIsLoading] = useState(false);
  const [eventID, setEventID] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const updateDb = async () => {
      let subscription = ndkInstance.subscribe([{ ids: [eventID] }], {
        groupable: false,
        skipVerification: true,
        skipValidation: true,
      });
      subscription.on("event", (event_) => {
        let stats = getEventStatAfterEOSE(
          event_,
          "reposts",
          actions,
          undefined
        );

        saveEventStats(event.id, stats);
        subscription.stop();
        setEventID(false);
      });
    };
    if (eventID) updateDb();
  }, [eventID]);
  const reactToNote = async (e) => {
    e.stopPropagation();
    if (isLoading) return;
    try {
      if (!userKeys) {
        setIsLogin(true);
        return false;
      }
      if (isReposted) {
        setIsLoading(true);
        let content = "This repost will be deleted!";
        let tags = [["e", isReposted.id]];
        let eventInitEx = await InitEvent(5, content, tags);
        if (!eventInitEx) {
          setIsLoading(false);
          return;
        }
        dispatch(
          setToPublish({
            eventInitEx,
            allRelays: [],
            toRemoveFromCache: { kind: "reposts", eventId: event.id },
          })
        );
        setEventID(false);
        setIsLoading(false);
        return false;
      }
      setIsLoading(true);
      let toRepost = {
        id: event.id,
        pubkey: event.pubkey,
        content: event.content,
        tags: event.tags,
        created_at: event.created_at,
        kind: event.kind,
        sig: event.sig,
      };
      let content = JSON.stringify(toRepost);
      let tags = [
        ["e", event.id],
        ["p", event.pubkey],
      ];
      let eventInitEx = await InitEvent(6, content, tags);
      if (!eventInitEx) {
        setIsLoading(false);
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );

      setIsLoading(false);
      setEventID(eventInitEx.id);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      <div
        className={"round-icon-tooltip"}
        data-tooltip={t("AUvmzyU")}
        onClick={reactToNote}
      >
        <div
          className={
            isReposted ? "switch-arrows-bold-24" : "switch-arrows-24 opacity-4"
          }
        ></div>
      </div>
    </>
  );
}
