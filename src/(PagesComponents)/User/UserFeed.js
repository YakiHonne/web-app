import React, { useState, useEffect, useReducer, useRef } from "react";
import {
  getEmptyuserMetadata,
  getParsedMedia,
  getParsedRepEvent,
  getParsedSW,
} from "@/Helpers/Encryptions";
import { checkMentionInContent, getParsedNote } from "@/Helpers/ClientHelpers";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import { straightUp } from "@/Helpers/Helpers";
import KindOne from "@/Components/KindOne";
import KindSix from "@/Components/KindSix";
import { saveUsers } from "@/Helpers/DB";
import { getSubData } from "@/Helpers/Controlers";
import Spinner from "@/Components/Spinner";
import { useTranslation } from "react-i18next";
import WidgetCardV2 from "@/Components/WidgetCardV2";
import { useRouter } from "next/router";
import useIsMute from "@/Hooks/useIsMute";
import { Virtuoso } from "react-virtuoso";
import { SelectTabs } from "@/Components/SelectTabs";
import MediaMasonryList from "@/Components/MediaMasonryList";
import { useSelector } from "react-redux";
import Icon from "@/Components/Icon";
import useCreatorSubscription from "@/Hooks/useCreatorSubscription";
import usePremiumRelays from "@/Hooks/usePremiumRelays";

const eventsReducer = (notes, action) => {
  switch (action.type) {
    case "remove-specific-events": {
      let nextState = { ...notes };
      nextState["pinned"] = nextState["pinned"].filter((note) =>
        action.note.includes(note.id),
      );
      return nextState;
    }
    case "empty-followings": {
      let nextState = { ...notes };
      nextState["followings"] = [];
      return nextState;
    }
    case "remove-events": {
      return eventsInitialState;
    }
    default: {
      let nextState = { ...notes };
      let tempArr = [...nextState[action.type], ...action.note];
      let sortedNotes = tempArr
        .filter((note, index, tempArr) => {
          if (tempArr.findIndex((_) => _.id === note.id) === index) return note;
        })
        .sort((note_1, note_2) => note_2.created_at - note_1.created_at);
      nextState[action.type] = sortedNotes;
      return nextState;
    }
  }
};

const eventsInitialState = {
  notes: [],
  replies: [],
  mentions: [],
  articles: [],
  curations: [],
  videos: [],
  pinned: [],
  pictures: [],
  "all-media": [],
  "smart-widget": [],
  "premium-notes": [],
  "premium-articles": [],
};

export default function UserFeed({ user }) {
  const { query } = useRouter();
  const { t } = useTranslation();
  const pubkey = user.pubkey;
  const { isMuted } = useIsMute(pubkey);
  const userKeys = useSelector((state) => state.userKeys);
  const pinnedNotes = useSelector((state) => state.userPinnedNotes);
  const [userPinnedNotes, setUserPinnedNotes] = useState([]);
  const isCurrentUser = userKeys?.pub === pubkey;
  const [events, dispatchEvents] = useReducer(
    eventsReducer,
    eventsInitialState,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [contentFrom, setContentFrom] = useState(
    query?.contentType ? query.contentType : "notes",
  );
  const [selectedTab, setSelectedTab] = useState(
    query?.contentType ? query.contentType : "notes",
  );
  const [lastEventTime, setLastEventTime] = useState(undefined);
  const virtuosoRef = useRef(null);
  const lastScrollY = useRef(0);
  const tabBarRef = useRef(null);
  const [showSubTabDropdown, setShowSubTabDropdown] = useState(false);
  const [dismissingSubTab, setDismissingSubTab] = useState(false);
  const subTabBtnRef = useRef(null);
  const [hidden, setHidden] = useState(false);
  const { isSubChekingLoading, providers } = useCreatorSubscription({ pubkey });
  const hasPremium = !isSubChekingLoading && providers.length > 0;
  const { premiumRelays, isPremiumRelaysLoading, getPremiumNDK } =
    usePremiumRelays(pubkey, hasPremium);

  const closeSubTabDropdown = () => {
    setDismissingSubTab(true);
    setTimeout(() => { setShowSubTabDropdown(false); setDismissingSubTab(false); }, 200);
  };

  // useEffect(() => {
  //   const onScroll = () => {
  //     const y = window.scrollY;
  //     const bar = tabBarRef.current;
  //     if (!bar) { lastScrollY.current = y; return; }
  //     const rect = bar.getBoundingClientRect();
  //     // Only hide when the bar is fully out of viewport (scrolled past it)
  //     if (rect.bottom <= 0) {
  //       setHidden(y > lastScrollY.current);
  //     } else {
  //       setHidden(false);
  //     }
  //     lastScrollY.current = y;
  //   };
  //   window.addEventListener("scroll", onScroll, { passive: true });
  //   return () => window.removeEventListener("scroll", onScroll);
  // }, []);

  // useEffect(() => {
  //   if (!showSubTabDropdown) return;
  //   const handleClick = (e) => {
  //     if (subTabBtnRef.current && !subTabBtnRef.current.contains(e.target)) {
  //       closeSubTabDropdown();
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClick);
  //   return () => document.removeEventListener("mousedown", handleClick);
  // }, [showSubTabDropdown]);

  const getNotesFilter = () => {
    let pinnedNotesIds = isCurrentUser ? pinnedNotes : userPinnedNotes;
    let kinds = {
      notes: [1, 6],
      replies: [1],
      mentions: [1],
      articles: [30023],
      videos: [34235, 34236, 21, 22],
      curations: [30004],
      "all-media": [34235, 34236, 20, 21, 22],
      pictures: [20],
      "smart-widget": [30033],
      "premium-notes": [1],
      "premium-articles": [30023],
    };
    if (contentFrom === "pinned" && pinnedNotesIds.length === 0) return false;
    if (contentFrom === "pinned" && pinnedNotesIds.length > 0)
      return [
        {
          kinds: [1],
          ids: pinnedNotesIds,
          limit: 100,
          until: lastEventTime,
        },
      ];
    return [
      {
        kinds: kinds[contentFrom],
        authors: contentFrom === "mentions" ? undefined : [pubkey],
        "#p": contentFrom === "mentions" ? [pubkey] : undefined,
        limit: 100,
        until: lastEventTime,
      },
    ];
  };
  const tabs = [
    { value: "notes", display_name: t("AYIXG83") },
    ...(hasPremium
      ? [{ value: "premium", display_name: t("AMT1D0j") }]
      : []),
    { value: "articles", display_name: t("AesMg52") },
    { value: "media", display_name: t("A0i2SOt") },
    { value: "others", display_name: t("A2qQXRV") },
  ];

  const subTabs = {
    notes: [
      { value: "pinned", display_name: t("AKRLwG6") },
      { value: "notes", display_name: t("AYIXG83") },
      { value: "replies", display_name: t("AENEcn9") },
      { value: "mentions", display_name: t("A8Da0of") },
    ],
    articles: [{ value: "articles", display_name: t("AesMg52") }],
    premium: [
      { value: "premium-notes", display_name: t("AYIXG83") },
      { value: "premium-articles", display_name: t("AesMg52") },
    ],
    media: [
      { value: "all-media", display_name: t("AR9ctVs") },
      { value: "pictures", display_name: t("Aa73Zgk") },
      { value: "videos", display_name: t("AStkKfQ") },
    ],
    others: [
      { value: "curations", display_name: t("AVysZ1s") },
      { value: "smart-widget", display_name: t("A2mdxcf") },
    ],
  };

  useEffect(() => {
    if (isCurrentUser && contentFrom === "pinned") {
      dispatchEvents({ type: "remove-specific-events", note: pinnedNotes });
    }
  }, [pinnedNotes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let filter = getNotesFilter();
        if (!filter) {
          setIsLoading(false);
          return;
        }
        const isPremiumFeed = contentFrom.startsWith("premium-");
        let premiumNDK;
        if (isPremiumFeed) {
          if (isPremiumRelaysLoading) return;
          if (premiumRelays.length === 0) {
            setIsLoading(false);
            return;
          }
          premiumNDK = await getPremiumNDK();
          if (!premiumNDK) {
            setIsLoading(false);
            return;
          }
        }
        const res = isPremiumFeed
          ? await getSubData(
              filter,
              200,
              premiumRelays,
              premiumNDK,
              undefined,
              undefined,
              "ONLY_RELAY",
            )
          : await getSubData(filter, 200);
        let data = res.data.slice(0, 100);
        if (isPremiumFeed) {
          data = data.filter((event) =>
            (event.tags || []).some((tag) => tag[0] === "nip63"),
          );
        }
        let pubkeys = res.pubkeys;
        let ev = [];
        if (data.length > 0) {
          ev = data.map((event) => {
            if ([1, 6].includes(event.kind)) {
              let event_ = getParsedNote(event, true);
              if (event_) {
                if (
                  contentFrom === "replies" &&
                  event_.isComment &&
                  event_.isQuote === ""
                ) {
                  return event_;
                } else if (contentFrom === "notes" && !event_.isComment) {
                  if (event.kind === 6) {
                    pubkeys.push(event_.relatedEvent.pubkey);
                  }
                  return event_;
                } else if (contentFrom === "mentions") {
                  let isMention = checkMentionInContent(event.content, pubkey);
                  if (isMention) return event_;
                } else if (contentFrom === "pinned") {
                  return event_;
                } else if (contentFrom === "premium-notes") {
                  return event_;
                }
              }
            }
            if ([30023, 30004].includes(event.kind)) {
              let event_ = getParsedRepEvent(event);
              return event_;
            }
            if ([30033].includes(event.kind) && event.id) {
              let event_ = getParsedSW(event);
              try {
                return {
                  ...event_,
                  metadata: event_,
                  author: getEmptyuserMetadata(event.pubkey),
                };
              } catch (err) {
                console.log(err);
              }
            }
            if ([34235, 34236, 21, 22, 20].includes(event.kind)) {
              let event_ = getParsedMedia(event);
              return event_;
            }
          });
          ev = ev.filter((_) => _);
          if (ev.length > 0) {
            saveUsers(pubkeys);
          }
          dispatchEvents({ type: contentFrom, note: ev });
        }
        if (ev.length === 0) setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    if (!pubkey) return;
    fetchData();
  }, [
    lastEventTime,
    contentFrom,
    pubkey,
    isPremiumRelaysLoading,
    premiumRelays,
  ]);

  useEffect(() => {
    if (userPinnedNotes?.length === 0) {
      getSubData([{ authors: [user.pubkey], kinds: [10001] }], 1000, 3).then(
        (_) => {
          if (_.data.length > 0)
            setUserPinnedNotes(
              _.data[0].tags.filter((_) => _[0] === "e").map((_) => _[1]),
            );
        },
      );
    }
  }, [user]);

  const switchSelectedTab = (type) => {
    straightUp();
    setIsLoading(true);
    dispatchEvents({ type: "remove-events" });
    setLastEventTime(undefined);
    setSelectedTab(type);
    setContentFrom(type === "notes" ? "notes" : subTabs[type][0].value);
  };
  const switchContentType = (type) => {
    straightUp();
    setIsLoading(true);
    dispatchEvents({ type: "remove-events" });
    setLastEventTime(undefined);
    setContentFrom(type);
  };

  const activeSubTab = subTabs[selectedTab]?.find((t) => t.value === contentFrom);
  const hasSubTabs = subTabs[selectedTab]?.length > 1;

  if (isMuted) return;
  const tabsIndex = tabs.findIndex((t) => t.value === selectedTab);
  const tabsLabels = tabs.map((t) => t.display_name);
  return (
    <div className="fx-centered fit-container fx-wrap" style={{ gap: 0 }}>

      {/* Tab bar — stays in normal flow, sticks to top after profile header scrolls away */}
      <div
        ref={tabBarRef}
        className="fx-centered fx-col fit-container"
        style={{
          gap: "8px",
          padding: "12px 0",
          position: "sticky",
          top: hidden ? "-300px" : "56px",
          transition: "top 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 200,
        }}
      >
        <div >
          <SelectTabs
            selectedTab={tabsIndex}
            tabs={tabsLabels}
            setSelectedTab={(i) => switchSelectedTab(tabs[i].value)}
          />
        </div>
        {hasSubTabs && (
          <div ref={subTabBtnRef} style={{ position: "relative" }}>
            <div
              className="uplift-filter-bar fx-scattered if pointer"
              style={{ height: "40px", padding: "0 1rem", gap: "8px", borderRadius: "9999px", position: "relative", top: "initial" }}
              onClick={() => showSubTabDropdown ? closeSubTabDropdown() : setShowSubTabDropdown(true)}
            >
              <span>{activeSubTab?.display_name}</span>
              <Icon name="arrow" />
            </div>
            {showSubTabDropdown && (
              <SubTabDropdown
                btnRef={subTabBtnRef}
                dismissing={dismissingSubTab}
                tabs={subTabs[selectedTab]}
                selectedTab={contentFrom}
                onSelect={(val) => { switchContentType(val); closeSubTabDropdown(); }}
              />
            )}
          </div>
        )}
      </div>


      {["notes", "replies", "mentions", "pinned"].includes(contentFrom) && (
        <>
          {events[contentFrom].length === 0 && !isLoading && (
            <div
              className="fx-centered fx-col box-pad-v"
              style={{ height: "30vh" }}
            >
              <h4>{t("Aezm5AZ")}</h4>
              <p className="gray-c">{t("A6rkFum")}</p>
              <Icon name="note-2" size={24} />
            </div>
          )}
        </>
      )}
      {contentFrom === "curations" && (
        <>
          {events[contentFrom].length === 0 && !isLoading && (
            <div
              className="fx-centered fx-col box-pad-v"
              style={{ height: "30vh" }}
            >
              <h4>{t("Aezm5AZ")}</h4>
              <p className="gray-c">{t("A8pbTGs", { name: user?.name })}</p>
              <Icon name="curation" size={24} />
            </div>
          )}
        </>
      )}
      {contentFrom === "articles" && (
        <>
          {events[contentFrom].length === 0 && !isLoading && (
            <div
              className="fx-centered fx-col box-pad-v"
              style={{ height: "30vh" }}
            >
              <h4>{t("AUBYIOq")}</h4>
              <p className="gray-c">{t("AkqCrW5", { name: user?.name })}</p>
              <Icon name="posts" />
            </div>
          )}
        </>
      )}
      {contentFrom === "videos" && (
        <>
          {events[contentFrom].length === 0 && !isLoading && (
            <div
              className="fx-centered fx-col box-pad-v"
              style={{ height: "30vh" }}
            >
              <h4>{t("A3QrgxE")}</h4>
              <p className="gray-c">{t("A70xEba", { name: user?.name })}</p>
              <Icon name="play" size={24} />
            </div>
          )}
        </>
      )}
      {contentFrom === "smart-widget" && (
        <>
          {events[contentFrom].length === 0 && !isLoading && (
            <div
              className="fx-centered fx-col box-pad-v"
              style={{ height: "30vh" }}
            >
              <h4>{t("Aezm5AZ")}</h4>
              <p className="gray-c">{t("A1MlrcU", { name: user?.name })}</p>
              <Icon name="smart-widget" size={24} />
            </div>
          )}
        </>
      )}
      {selectedTab !== "media" && events[contentFrom].length > 0 && (
        <>
          <Virtuoso
            style={{ width: "100%", height: "100vh" }}
            totalCount={events[contentFrom].length}
            increaseViewportBy={1000}
            endReached={(index) => {
              setLastEventTime(events[contentFrom][index].created_at - 1);
            }}
            overscan={1000}
            skipAnimationFrameInResizeObserver={true}
            useWindowScroll={true}
            ref={virtuosoRef}
            itemContent={(index) => {
              let item = events[contentFrom][index];
              if (
                ["curations", "videos", "articles", "premium-articles"].includes(
                  contentFrom,
                )
              )
                return <RepEventPreviewCard key={item.id} item={item} />;
              if (contentFrom === "smart-widget")
                return (
                  <WidgetCardV2
                    widget={item}
                    key={item.id}
                    deleteWidget={() => null}
                  />
                );
              if (item.kind === 6)
                return <KindSix event={item} key={item.id} />;
              return <KindOne event={item} key={item.id} border={true} />;
            }}
          />
        </>
      )}
      {selectedTab === "media" && events[contentFrom].length > 0 && (
        <>
          <MediaMasonryList
            events={events[contentFrom]}
            setLastEventTime={setLastEventTime}
          />
        </>
      )}
      {isLoading && (
        <div
          className="fit-container box-pad-v fx-centered fx-col"
          style={{ height: "60vh" }}
        >
          <Spinner size={32} />
        </div>
      )}
    </div>
  );
}

function SubTabDropdown({ btnRef, dismissing, tabs, selectedTab, onSelect }) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!btnRef?.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, centerX: rect.left + rect.width / 2 });
  }, [btnRef]);

  if (!pos) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.centerX,
        transform: "translateX(-50%)",
        width: "200px",
        zIndex: 99999,
      }}
    >
      <div ref={panelRef} className={`di-wrapper${dismissing ? " dismissing" : ""}`}>
        <div className="di-panel" style={{ borderRadius: "16px", overflow: "hidden" }}>
          {tabs.map((tab) => (
            <div
              key={tab.value}
              className="fx-scattered pointer option-no-scale box-pad-h-s box-pad-v-s"
              style={{ borderRadius: "10px" }}
              onClick={() => onSelect(tab.value)}
            >
              <span>{tab.display_name}</span>
              {selectedTab === tab.value && <Icon name="check" size={18} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
