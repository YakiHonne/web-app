import React, { useState, useEffect, useReducer } from "react";
import {
  getEmptyuserMetadata,
  getParsedRepEvent,
  getParsedSW,
} from "@/Helpers/Encryptions";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import { nip19 } from "nostr-tools";
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
  const getNotesFilter = () => {
    let kinds = {
      notes: [1, 6],
      replies: [1],
      flashnews: [1],
      articles: [30023],
      videos: [34235, 34236],
      curations: [30004],
      "smart-widget": [30033],
    };
    return [
      {
        kinds: kinds[contentFrom],
        authors: [pubkey],
        limit: 50,
        until: lastEventTime,
      },
    ];
  };

  useEffect(() => {
    const handleScroll = () => {
      // if (notesContentFrom === "trending") return;
      let container = document.querySelector(".main-page-nostr-container");

      if (!container) return;
      if (
        container.scrollHeight - container.scrollTop - 60 >
          document.documentElement.offsetHeight &&
        events[contentFrom].length > 4
      ) {
        return;
      }
      setLastEventTime(
        events[contentFrom][events[contentFrom].length - 1]?.created_at ||
          undefined
      );
    };
    document
      .querySelector(".main-page-nostr-container")
      ?.addEventListener("scroll", handleScroll);
    return () =>
      document
        .querySelector(".main-page-nostr-container")
        ?.removeEventListener("scroll", handleScroll);
  }, [isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let filter = getNotesFilter();
        const res = await getSubData(filter, 50);
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
            if ([34235, 34236].includes(event.kind)) {
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
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    if (!pubkey) return;
    setIsLoading(true);
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
    <div className="fx-centered  fx-wrap fit-container" style={{ gap: 0 }}>
      <div
        className="fit-container fx-even sticky box-pad-h"
        style={{
          top: "-1px",
          paddingTop: 0,
          paddingBottom: 0,
          columnGap: 0,
          borderBottom: "1px solid var(--very-dim-gray)",
          borderTop: "1px solid var(--very-dim-gray)",
        }}
      >
        <div
          className={`list-item-b fx-centered fx-shrink ${
            contentFrom === "notes" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("notes")}
        >
          {t("AYIXG83")}
        </div>
        <div
          className={`list-item-b fx-centered fx-shrink ${
            contentFrom === "replies" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("replies")}
        >
          {t("AENEcn9")}
        </div>
        <div
          className={`list-item-b fx-centered fx-shrink ${
            contentFrom === "articles" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("articles")}
        >
          {t("AesMg52")}
        </div>
        <div
          className={`list-item-b fx-centered fx-shrink ${
            contentFrom === "smart-widget" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("smart-widget")}
        >
          {t("A2mdxcf")}
        </div>
        <div
          className={`list-item-b fx-centered fx-shrink ${
            contentFrom === "curations" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("curations")}
        >
          {t("AVysZ1s")}
        </div>
        <div
          className={`list-item-b fx-centered fx-shrink ${
            contentFrom === "videos" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("videos")}
        >
          {t("AStkKfQ")}
        </div>
      </div>
      {["notes", "replies"].includes(contentFrom) && (
        <div className="fit-container fx-centered fx-col">
          {events[contentFrom].length > 0 && (
            <>
              <div
                style={{ width: "min(100%,800px)", gap: 0 }}
                className="fx-around fx-wrap"
              >
                {events[contentFrom].map((note) => {
                  if (note.kind === 6)
                    return <KindSix event={note} key={note.id} />;
                  return <KindOne event={note} key={note.id} border={true} />;
                })}
              </div>
            </>
          )}
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
        </div>
      )}
      {contentFrom === "curations" && (
        <div className="fit-container fx-centered fx-col">
          {events[contentFrom].length > 0 && (
            <>
              <div
                style={{ width: "min(100%,800px)" }}
                className="fx-around fx-wrap posts-cards"
              >
                {events[contentFrom].map((item) => {
                  return <RepEventPreviewCard key={item.id} item={item} />;
                })}
              </div>
            </>
          )}
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
        </div>
      )}
      {contentFrom === "articles" && (
        <div className="fit-container fx-centered fx-col">
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
          {events[contentFrom].length > 0 && (
            <>
              <div
                style={{ width: "min(100%,800px)", gap: 0 }}
                className="fx-around fx-wrap posts-cards"
              >
                {events[contentFrom].map((post) => {
                  let fullPost = {
                    ...post,
                    author_img: user?.picture,
                  };
                  return (
                    <div key={post.id} className="fx-centered fit-container">
                      <RepEventPreviewCard item={fullPost} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
      {contentFrom === "videos" && (
        <div className="fit-container fx-centered fx-col">
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
          {events[contentFrom].length > 0 && (
            <>
              <div
                style={{ width: "min(100%,800px)" }}
                className="fx-around fx-wrap posts-cards"
              >
                {events[contentFrom].map((video) => {
                  return (
                    <div key={video.id} className="fx-centered fit-container">
                      <RepEventPreviewCard item={video} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
      {contentFrom === "smart-widget" && (
        <div className="fit-container fx-centered fx-col">
          {events[contentFrom].length === 0 && !isLoading && (
            <div
              className="fx-centered fx-col box-pad-v"
              style={{ height: "30vh" }}
            >
              <h4>{t("Aezm5AZ")}</h4>
              <p className="gray-c">{t("A1MlrcU", { name: user?.name })}</p>
              <div
                className="play-24"
                style={{ width: "48px", height: "48px" }}
              ></div>
            </div>
          )}
          {events[contentFrom].length > 0 && (
            <>
              <div
                style={{ width: "min(100%,800px)" }}
                className="fx-around fx-wrap box-pad-v-s"
              >
                {events[contentFrom].map((widget) => {
                  return (
                    <div key={widget.id} className="fx-centered fit-container">
                      <WidgetCardV2
                        widget={widget}
                        key={widget.id}
                        deleteWidget={() => null}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
      {isLoading && (
        <div
          className="fit-container box-pad-v fx-centered fx-col"
          style={{ height: "40vh" }}
        >
          <LoadingLogo />
        </div>
      )}
    </div>
  );
}
