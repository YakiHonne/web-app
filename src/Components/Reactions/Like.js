import React, { useEffect, useRef, useState } from "react";
import { setToPublish } from "@/Store/Slides/Publishers";
import { useDispatch, useSelector } from "react-redux";
import { getEventStatAfterEOSE, InitEvent } from "@/Helpers/Controlers";
import { saveEventStats } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";
import LoginSignup from "@/Components/LoginSignup";
import EmojiPicker from "emoji-picker-react";
import EmojiImg from "@/Components/EmojiImg";

export default function Like({ isLiked, event, actions, tagKind = "e" }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [isLoading, setIsLoading] = useState(false);
  const [eventID, setEventID] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const isDarkMode = useSelector((state) => state.isDarkMode);
  const [showEmoji, setShowEmoji] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowEmoji(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef]);

  useEffect(() => {
    const updateDb = async () => {
      let subscription = ndkInstance.subscribe([{ ids: [eventID] }], {
        groupable: false,
        skipVerification: true,
        skipValidation: true,
      });
      subscription.on("event", (event_) => {
        let stats = getEventStatAfterEOSE(event_, "likes", actions, undefined);
        saveEventStats(event.aTag || event.id, stats);
        subscription.stop();
        setEventID(false);
      });
    };
    if (eventID) updateDb();
  }, [eventID]);

  const reactToNote = async (emoji) => {
    // e.stopPropagation();
    if (isLoading) return;
    try {
      if (!userKeys) {
        setIsLogin(true);
        return false;
      }
      if (isLiked) {
        setIsLoading(true);
        let content = "This reaction will be deleted!";
        let tags = [["e", isLiked.id]];
        let eventInitEx = await InitEvent(5, content, tags);
        if (!eventInitEx) {
          setIsLoading(false);
          return;
        }
        dispatch(
          setToPublish({
            eventInitEx,
            allRelays: [],
            toRemoveFromCache: {
              kind: "likes",
              eventId: event.aTag || event.id,
            },
          })
        );
        setEventID(false);
        setIsLoading(false);
        return false;
      }

      setIsLoading(true);
      let content = emoji;
      let tags = [
        [tagKind, event.aTag || event.id],
        ["p", event.pubkey],
      ];
      let eventInitEx = await InitEvent(7, content, tags);
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
        style={{ position: "relative" }}
        className="pointer"
        ref={optionsRef}
      >
        <div
          className={"round-icon-tooltip pointer"}
          data-tooltip={t("AJW1vH9")}
          onClick={() => !isLiked ? setShowEmoji(!showEmoji) : reactToNote(undefined)}
          onDoubleClick={() => reactToNote("+")}
        >
          {!isLiked && <div className={"heart-24"}></div>}
          {isLiked && <EmojiImg content={isLiked?.content} />}
        </div>
        {showEmoji && (
          <div
            className={"drop-down-r"}
            style={{
              position: "absolute",
              bottom: "calc(100% + 5px)",
              zIndex: 102,
            }}
          >
            <EmojiPicker
              reactionsDefaultOpen={true}
              theme={isDarkMode ? "dark" : "light"}
              previewConfig={{ showPreview: false }}
              skinTonesDisabled={true}
              searchDisabled={false}
              height={300}
              onEmojiClick={(data) => reactToNote(data.emoji)}
            />
          </div>
        )}
      </div>
    </>
  );
}
