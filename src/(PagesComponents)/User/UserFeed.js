import React, { useState, useEffect, useReducer, useRef } from "react";
import {
  getEmptyuserMetadata,
  getParsedRepEvent,
  getParsedSW,
} from "@/Helpers/Encryptions";
import { getParsedNote } from "@/Helpers/ClientHelpers";
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
import InfiniteScroll from "@/Components/InfiniteScroll";
import Slider from "@/Components/Slider";
import { Virtuoso } from "react-virtuoso";

const eventsReducer = (notes, action) => {
  switch (action.type) {
    case "notes": {
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
    case "replies": {
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
    case "articles": {
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
    case "curations": {
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
    case "videos": {
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
    case "smart-widget": {
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

    case "flashnews": {
      let nextState = { ...notes };
      nextState[action.type] = action.note;
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
      console.log("wrong action type");
    }
  }
};

const eventsInitialState = {
  notes: [],
  replies: [],
  articles: [],
  flashnews: [],
  curations: [],
  videos: [],
  "smart-widget": [],
};

export default function UserFeed({ user }) {
  const { query } = useRouter();
  const { t } = useTranslation();
  const pubkey = user.pubkey;
  const { isMuted } = useIsMute(pubkey);
  const [events, dispatchEvents] = useReducer(
    eventsReducer,
    eventsInitialState
  );
  const [isLoading, setIsLoading] = useState(true);
  const [contentFrom, setContentFrom] = useState(
    query?.contentType ? query.contentType : "notes"
  );
  const [lastEventTime, setLastEventTime] = useState(undefined);
  const virtuosoRef = useRef(null);
  const getNotesFilter = () => {
    let kinds = {
      notes: [1, 6],
      replies: [1],
      flashnews: [1],
      articles: [30023],
      videos: [34235, 34236, 21, 22],
      curations: [30004],
      "smart-widget": [30033],
    };
    return [
      {
        kinds: kinds[contentFrom],
        authors: [pubkey],
        limit: 100,
        until: lastEventTime,
      },
    ];
  };
  const tabs = [
    { value: "notes", display_name: t("AYIXG83") },
    { value: "replies", display_name: t("AENEcn9") },
    { value: "articles", display_name: t("AesMg52") },
    { value: "smart-widget", display_name: t("A2mdxcf") },
    { value: "curations", display_name: t("AVysZ1s") },
    { value: "videos", display_name: t("AStkKfQ") },
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
        let filter = getNotesFilter();
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
            if ([34235, 34236, 21, 22].includes(event.kind)) {
              let event_ = getParsedRepEvent(event);
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
                  contentFrom === tab.value ? "selected-list-item-b" : ""
                }`}
                onClick={() => switchContentType(tab.value)}
              >
                {tab.display_name}
              </div>
            );
          })}
          slideBy={100}
          noGap={true}
        />
      </div>
      {["notes", "replies"].includes(contentFrom) && (
        <>
          {events[contentFrom].length === 0 && !isLoading && (
            <div
              className="fx-centered fx-col box-pad-v"
              style={{ height: "30vh" }}
            >
              <h4>{t("Aezm5AZ")}</h4>
              <p className="gray-c">{t("AmK41uU", { name: user?.name })}</p>
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
      {events[contentFrom].length > 0 && (
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