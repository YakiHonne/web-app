import React, { useEffect, useRef, useState, useMemo } from "react";
import { setToPublish } from "@/Store/Slides/Publishers";
import { useDispatch, useSelector } from "react-redux";
import Overlay from "@/Components/Overlay";
import { getEventStatAfterEOSE, InitEvent } from "@/Helpers/Controlers";
import { saveEventStats } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useTranslation } from "react-i18next";
import LoginSignup from "@/Components/LoginSignup";
import WriteNote from "@/Components/WriteNote";
import NumberShrink from "@/Components/NumberShrink";
import Icon from "@/Components/Icon";
import { iconsNames } from "@/Content/IconV2URL";

export default function RepostWithQuote({ isReposted, isQuoted, event, actions, totalCount }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [isLoading, setIsLoading] = useState(false);
  const [repostEventID, setRepostEventID] = useState(false);
  const [quoteEventID, setQuoteEventID] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [showQuoteBox, setShowQuoteBox] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = isReposted || isQuoted;

  useEffect(() => {
    const closeDropdown = () => {
      setDismissing(true);
      setTimeout(() => { setShowDropdown(false); setDismissing(false); }, 200);
    };
    const handleOffClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        closeDropdown();
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => document.removeEventListener("mousedown", handleOffClick);
  }, []);

  useEffect(() => {
    if (!repostEventID) return;
    const sub = ndkInstance.subscribe([{ ids: [repostEventID] }], { groupable: false });
    sub.on("event", (event_) => {
      let stats = getEventStatAfterEOSE(event_, "reposts", actions, undefined);
      saveEventStats(event.id, stats);
      sub.stop();
      setRepostEventID(false);
    });
  }, [repostEventID]);

  useEffect(() => {
    if (!quoteEventID) return;
    const sub = ndkInstance.subscribe([{ ids: [quoteEventID] }], { groupable: false });
    sub.on("event", (event_) => {
      let stats = getEventStatAfterEOSE(event_, "quotes", actions, undefined);
      saveEventStats(event.aTag || event.id, stats);
      sub.stop();
      setQuoteEventID(false);
    });
  }, [quoteEventID]);

  const closeDropdown = () => {
    setDismissing(true);
    setTimeout(() => { setShowDropdown(false); setDismissing(false); }, 200);
  };

  const handleRepost = async (e) => {
    e.stopPropagation();
    closeDropdown();
    if (isLoading) return;
    if (!userKeys) { setIsLogin(true); return; }

    try {
      if (isReposted) {
        setIsLoading(true);
        let eventInitEx = await InitEvent(5, "This repost will be deleted!", [["e", isReposted.id]]);
        if (!eventInitEx) { setIsLoading(false); return; }
        dispatch(setToPublish({ eventInitEx, allRelays: [], toRemoveFromCache: { kind: "reposts", eventId: event.id } }));
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      let toRepost = { id: event.id, pubkey: event.pubkey, content: event.content, tags: event.tags, created_at: event.created_at, kind: event.kind, sig: event.sig };
      let eventInitEx = await InitEvent(6, JSON.stringify(toRepost), [["e", event.id], ["p", event.pubkey]]);
      if (!eventInitEx) { setIsLoading(false); return; }
      dispatch(setToPublish({ eventInitEx, allRelays: [] }));
      setRepostEventID(eventInitEx.id);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleQuote = (e) => {
    e.stopPropagation();
    closeDropdown();
    if (!userKeys) { setIsLogin(true); return; }
    setShowQuoteBox(true);
  };

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    if (showDropdown) { closeDropdown(); } else { setShowDropdown(true); }
  };

  return (
    <>
      {showQuoteBox && (
        <Overlay exit={() => setShowQuoteBox(false)} width={600}>
          <div>
            <WriteNote exit={() => setShowQuoteBox(false)} linkedEvent={event} isQuote={true} content={""} />
          </div>
        </Overlay>
      )}
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}

      <div style={{ position: "relative" }} ref={dropdownRef}>
        <div
          className="fx-centered pointer repost-quote-btn"
          style={{ columnGap: "4px", borderRadius: "20px", padding: "4px 8px", transition: "background-color 0.15s ease" }}
          onClick={handleToggleDropdown}
        >
          <Icon
            name={iconsNames.arrow_reload_02}
            size={20}
            v={2}
            opacity={!isActive ? 0.4 : "initial"}
            isColored={isActive}
            isBoldThemeColor={isActive}
          />
          <span className={`p-medium ${isActive ? "orange-c" : "opacity-4"}`}>
            <NumberShrink value={totalCount} />
          </span>
        </div>

        {showDropdown && (
          <div
            className={`drop-down-r bg-dropdown box-pad-h-s box-pad-v-s fx-centered fx-col fx-start-v dynamic-island-dropdown${dismissing ? " dismissing" : ""}`}
            style={{ position: "absolute", top: "calc(100% + 6px)", zIndex: 102, minWidth: "140px", borderRadius: "16px", transformOrigin: "top left" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="fx-centered fx-start-h fit-container pointer option-no-scale box-pad-h-s box-pad-v-s repost-dropdown-item"
              style={{ columnGap: "10px" }}
              onClick={handleRepost}
            >
              <Icon
                name={iconsNames.arrow_reload_02}
                size={18}
                v={2}
                opacity={!isReposted ? 0.6 : "initial"}
                isColored={isReposted}
                isBoldThemeColor={isReposted}
              />
              <p className={isReposted ? "orange-c" : ""}>
                {isReposted ? t("AUvmzyU") + " ✓" : t("AUvmzyU")}
              </p>
            </div>
            <div
              className="fx-centered fx-start-h fit-container pointer option-no-scale box-pad-h-s box-pad-v-s repost-dropdown-item"
              style={{ columnGap: "10px" }}
              onClick={handleQuote}
            >
              <Icon
                name={iconsNames.double_quotes_r}
                size={18}
                v={2}
                opacity={!isQuoted ? 0.6 : "initial"}
                isColored={isQuoted}
                isBoldThemeColor={isQuoted}
              />
              <p className={isQuoted ? "orange-c" : ""}>{t("A5XLJln")}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
