import React, { useEffect, useRef, useState, useReducer, useMemo } from "react";
import { useSelector } from "react-redux";
import ArrowUp from "@/Components/ArrowUp";
import YakiIntro from "@/Components/YakiIntro";
import { saveUsers } from "@/Helpers/DB";
import { getSubData } from "@/Helpers/Controlers";
import { straightUp } from "@/Helpers/Helpers";
import LoadingLogo from "@/Components/LoadingLogo";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Backbar from "@/Components/Backbar";
import { getParsedMedia, getParsedPacksEvent } from "@/Helpers/Encryptions";
import RecentPosts from "@/Components/RecentPosts";
import MediaMasonryList from "@/Components/MediaMasonryList";
import PackPreview from "../Explore/PackPreview";

const notesReducer = (notes, action) => {
  switch (action.type) {
    case "empty-recent": {
      return [];
    }
    case "remove-events": {
      return [];
    }
    default: {
      let tempArr = [...notes, ...action.note];
      let sortedNotes = tempArr
        .filter((note, index, tempArr) => {
          if (
            tempArr.findIndex(
              (_) =>
                _.id === note.id ||
                (note.kind === 6 &&
                  (note.relatedEvent.id === _.id ||
                    note.relatedEvent.id === _.relatedEvent?.id)) ||
                (_.kind === 6 &&
                  (_.relatedEvent.id === note.id ||
                    _.relatedEvent.id === note.relatedEvent?.id)),
            ) === index
          )
            return note;
        })
        .sort((note_1, note_2) => note_2.created_at - note_1.created_at);
      return sortedNotes;
    }
  }
};

export default function MediaPack({ event }) {
  const router = useRouter();
  const { t } = useTranslation();
  const extrasRef = useRef(null);
  const d = router.query.r;
  const [pack, setPack] = useState(event || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!extrasRef.current) return;

    const handleResize = () => {
      const extrasHeight = extrasRef.current?.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;
      const topValue =
        extrasHeight >= windowHeight ? `calc(95vh - ${extrasHeight}px)` : 0;
      extrasRef.current.style.top = topValue;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(extrasRef.current);
    handleResize();
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getSubData([{ kinds: [39092], "#d": [d] }]);
      if (data.data.length > 0) {
        setPack(getParsedPacksEvent(data.data[0]));
      }
      setIsLoading(false);
    };
    if (!event) fetchData();
  }, [d]);

  if (isLoading)
    return (
      <div className="fit-container fx-centered" style={{ height: "100vh" }}>
        <LoadingLogo size={64} />
      </div>
    );

  return (
    <>
      <div style={{ overflow: "auto" }}>
        <YakiIntro />
        <ArrowUp />
        <div className="fit-container fx-centered fx-start-h fx-start-v">
          <div
            className="fit-container fx-centered fx-start-v fx-start-h"
            style={{ gap: 0 }}
          >
            <div
              style={{ gap: 0 }}
              className={`fx-centered  fx-wrap fit-container`}
            >
              {pack && (
                <>
                  <div
                    className="fit-container fx-centered box-pad-h "
                    style={{
                      padding: 0,
                    }}
                  >
                    <div className="main-middle">
                      <Backbar />
                    </div>
                  </div>
                  <div className="main-middle">
                    <div className="fit-container fx-centered">
                      <div
                        className="fit-container fx-scattered fx-col"
                        style={{ gap: 0 }}
                      >
                        <PackPreview pack={pack} noRedirect={true} />
                      </div>
                    </div>
                    <HomeFeed pubkeys={pack.pTags} />
                  </div>
                </>
              )}
              {!pack && (
                <div
                  className="fit-container fx-centered fx-col"
                  style={{ height: "80vh" }}
                >
                  <div
                    className="yaki-logomark"
                    style={{
                      minWidth: "48px",
                      minHeight: "48px",
                      opacity: 0.5,
                    }}
                  ></div>
                  <h4>{t("A2l1JgC")}</h4>
                  <p
                    className="p-centered gray-c"
                    style={{ maxWidth: "330px" }}
                  >
                    {t("AeujoKN")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const HomeFeed = ({ pubkeys }) => {
  const { t } = useTranslation();
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const [notes, dispatchNotes] = useReducer(notesReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [notesLastEventTime, setNotesLastEventTime] = useState(undefined);
  const [subFilter, setSubfilter] = useState({ filter: [], relays: [] });
  const since = useMemo(
    () => (notes.length > 0 ? notes[0].created_at + 1 : undefined),
    [notes],
  );
  const virtuosoRef = useRef(null);
  const pubkeys_ = useMemo(() => {
    return [...pubkeys].sort(() => Math.random() - 0.5).slice(0, 100);
  }, [pubkeys]);

  useEffect(() => {
    straightUp();
    dispatchNotes({ type: "remove-events" });
    setNotesLastEventTime(undefined);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let eventsPubkeys = [];
      let events = [];
      let fallBackEvents = [];
      let towDaysPeriod = (2 * 24 * 60 * 60 * 1000) / 1000;
      let twoDaysPrior = Math.floor(
        (Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000,
      );
      twoDaysPrior = notesLastEventTime
        ? notesLastEventTime - towDaysPeriod
        : notesLastEventTime;
      let since = twoDaysPrior;
      let filter = [
        {
          kinds: [34235, 34236, 20, 21, 22],
          limit: 100,
          until: notesLastEventTime,
          since,
          authors: pubkeys_,
        },
      ];
      let data = await getSubData(filter, 150);
      setSubfilter({ filter });
      events = data.data
        .splice(0, 50)
        .map((event) => {
          eventsPubkeys.push(event.pubkey);
          return getParsedMedia(event);
        })
        .filter((_) => _);
      let tempEvents =
        events.length > 0 ? Array.from(events) : Array.from(fallBackEvents);
      saveUsers(eventsPubkeys);
      dispatchNotes({ type: "global", note: tempEvents });
      if (tempEvents.length === 0) setIsLoading(false);
    };

    fetchData();
  }, [notesLastEventTime]);

  const handleRecentPostsClick = (notes) => {
    dispatchNotes({ type: "global", note: notes });
    virtuosoRef.current?.scrollToIndex({
      top: 32,
      behavior: "smooth",
    });
  };
  return (
    <div className="fx-centered  fx-wrap fit-container" style={{ gap: 0 }}>
      <RecentPosts
        filter={subFilter}
        since={since}
        onClick={handleRecentPostsClick}
        kind={"media"}
        position="bottom"
      />

      {notes.length > 0 && (
        <MediaMasonryList
          events={notes}
          setLastEventTime={setNotesLastEventTime}
        />
      )}
      {notes?.length === 0 && !isLoading && (
        <div
          className="fit-container fx-centered fx-col"
          style={{ height: "40vh" }}
        >
          <div
            className="yaki-logomark"
            style={{ minWidth: "48px", minHeight: "48px", opacity: 0.5 }}
          ></div>
          <h4>{t("A5BPCrj")}</h4>
          <p className="p-centered gray-c" style={{ maxWidth: "330px" }}>
            {t("AVSfte8")}
          </p>
        </div>
      )}

      <div className="box-pad-v"></div>
      {isLoading && (
        <div
          className="fit-container box-pad-v fx-centered fx-col"
          style={{ height: "60vh" }}
        >
          <LoadingLogo size={64} />
        </div>
      )}
    </div>
  );
};
