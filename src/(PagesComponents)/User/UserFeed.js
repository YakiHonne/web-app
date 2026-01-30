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
import LoadingLogo from "@/Components/LoadingLogo";
import { useTranslation } from "react-i18next";
import WidgetCardV2 from "@/Components/WidgetCardV2";
import { useRouter } from "next/router";
import useIsMute from "@/Hooks/useIsMute";
import Slider from "@/Components/Slider";
import { Virtuoso } from "react-virtuoso";
import { SelectTabsNoIndex } from "@/Components/SelectTabsNoIndex";
import MediaMasonryList from "@/Components/MediaMasonryList";
import { useSelector } from "react-redux";

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
};

export default function UserFeed({ user }) {
  const { query } = useRouter();
  const { t } = useTranslation();
  const pubkey = user.pubkey;
  const { isMuted } = useIsMute(pubkey);
  const userKeys = useSelector((state) => state.userKeys);
  const pinnedNotes = useSelector((state) => state.userPinnedNotes);
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

  const getNotesFilter = () => {
    let pinnedNotesIds = isCurrentUser ? pinnedNotes : user.pinned;
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
        const res = await getSubData(filter, 200);
        let data = res.data.slice(0, 100);
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
  }, [lastEventTime, contentFrom, pubkey]);

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

  if (isMuted) return;
  return (
    <div className="fx-centered  fit-container fx-wrap" style={{ gap: 0 }}>
      <div
        className="user-feed-tab sticky fit-container"
        style={{ padding: 0 }}
      >
        <Slider
          items={tabs.map((tab) => {
            return (
              <div
                className={`list-item-b fx-centered fx-shrink ${
                  selectedTab === tab.value ? "selected-list-item-b" : ""
                }`}
                onClick={() => switchSelectedTab(tab.value)}
              >
                {tab.display_name}
              </div>
            );
          })}
          slideBy={100}
          noGap={true}
        />
        {subTabs[selectedTab]?.length > 1 && (
          <div
            className="fx-centered box-pad-h-s box-pad-v-s fx-start-h"
            style={{ borderBottom: "1px solid var(--very-dim-gray)" }}
          >
            <SelectTabsNoIndex
              tabs={subTabs[selectedTab]}
              selectedTab={contentFrom}
              setSelectedTab={switchContentType}
            />
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
              <div
                className="note-2-24"
                style={{ width: "48px", height: "48px" }}
              ></div>
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
              <div
                className="curation-24"
                style={{ width: "48px", height: "48px" }}
              ></div>
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
              <div
                className="posts"
                style={{ width: "48px", height: "48px" }}
              ></div>
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
              <div
                className="play-24"
                style={{ width: "48px", height: "48px" }}
              ></div>
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
              <div
                className="smart-widget-24"
                style={{ width: "48px", height: "48px" }}
              ></div>
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
              if (["curations", "videos", "articles"].includes(contentFrom))
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
          <LoadingLogo />
        </div>
      )}
    </div>
  );
}
