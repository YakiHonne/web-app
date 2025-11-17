import React, {
  useEffect,
  useRef,
  useState,
  useReducer,
  Fragment,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import ArrowUp from "@/Components/ArrowUp";
import YakiIntro from "@/Components/YakiIntro";
import KindSix from "@/Components/KindSix";
import { saveUsers } from "@/Helpers/DB";
import { getSubData } from "@/Helpers/Controlers";
import { straightUp } from "@/Helpers/Helpers";
import LoadingLogo from "@/Components/LoadingLogo";
import KindOne from "@/Components/KindOne";
import bannedList from "@/Content/BannedList";
import { useRouter } from "next/router";
import InfiniteScroll from "@/Components/InfiniteScroll";
import { t } from "i18next";
import RelayPreview from "./Relays/RelayPreview/RelayPreview";
import { useTranslation } from "react-i18next";
import Backbar from "@/Components/Backbar";
import { getNDKInstance } from "@/Helpers/utils";
import Slider from "@/Components/Slider";
import { getParsedRepEvent } from "@/Helpers/Encryptions";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import PostNotePortal from "@/Components/PostNotePortal";
import RecentPosts from "@/Components/RecentPosts";

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
                    _.relatedEvent.id === note.relatedEvent?.id))
            ) === index
          )
            return note;
        })
        .sort((note_1, note_2) => note_2.created_at - note_1.created_at);
      return sortedNotes;
    }
  }
};

export default function ContentSharedRelay() {
  const router = useRouter();
  const { t } = useTranslation();
  //   const selectedFilter = getDefaultFilter(2);
  const extrasRef = useRef(null);
  const relay = router.query.r;

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
              {relay && (
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
                        <RelayPreview url={relay} addToFavList={true} />
                      </div>
                    </div>
                    <PostNotePortal
                      protectedRelay={relay}
                      label={t("AJj3cLI")}
                    />
                    <HomeFeed relay={relay} />
                  </div>
                </>
              )}
              {!relay && (
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

const HomeFeed = ({ relay }) => {
  const { t } = useTranslation();
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const [notes, dispatchNotes] = useReducer(notesReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [notesLastEventTime, setNotesLastEventTime] = useState(undefined);
  const [contentFrom, setContentFrom] = useState("all");
  const [isConnected, setIsConnected] = useState(true);
  const [subFilter, setSubfilter] = useState({ filter: [], relays: [] });
  const since = useMemo(
    () => (notes.length > 0 ? notes[0].created_at + 1 : undefined),
    [notes]
  );

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
      let kinds = [1, 6, 30023, 34235, 21, 22];

      let towDaysPeriod = (2 * 24 * 60 * 60 * 1000) / 1000;
      let twoDaysPrior = Math.floor(
        (Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000
      );
      twoDaysPrior = notesLastEventTime
        ? notesLastEventTime - towDaysPeriod
        : notesLastEventTime;
      let since = twoDaysPrior;

      if (contentFrom === "notes") kinds = [1, 6];
      if (contentFrom === "articles") kinds = [30023];
      if (contentFrom === "videos") kinds = [34235, 21, 22];
      if (contentFrom === "curations") kinds = [30004, 30005];

      let ndk = await getNDKInstance(relay);
      if (!ndk) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      let filter = [{ kinds, limit: 100, until: notesLastEventTime, since }];
      let data = await getSubData(filter, 50, [relay], ndk, 200);
      setSubfilter({ filter, relays: [relay], ndk });
      events = data.data
        .splice(0, 50)
        .map((event) => {
          eventsPubkeys.push(event.pubkey);
          if ([1, 6].includes(event.kind)) {
            let event_ = getParsedNote(event, true);
            if (event_) fallBackEvents.push(event_);
            if (event_) {
              if (event.kind === 6) {
                eventsPubkeys.push(event_.relatedEvent.pubkey);
              }
              return event_;
            }
          } else return getParsedRepEvent(event);
        })
        .filter((_) => _);
      let tempEvents =
        events.length > 0 ? Array.from(events) : Array.from(fallBackEvents);
      saveUsers(eventsPubkeys);
      dispatchNotes({ type: "global", note: tempEvents });
      if (tempEvents.length === 0) setIsLoading(false);
    };

    fetchData();
  }, [notesLastEventTime, contentFrom]);

  const switchContentType = (type) => {
    straightUp();
    setIsLoading(true);
    dispatchNotes({ type: "remove-events" });
    setNotesLastEventTime(undefined);
    setContentFrom(type);
  };

  const handleRecentPostsClick = (notes) => {
    dispatchNotes({ type: "global", note: notes });
    straightUp(undefined, "smooth");
  };
  return (
    <div className="fx-centered  fx-wrap fit-container" style={{ gap: 0 }}>
      <div
        className="user-feed-tab sticky fx-even fit-container"
        style={{ padding: 0, gap: 0 }}
      >
        <div
          className={`list-item-b fx-centered fx ${
            contentFrom === "all" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("all")}
        >
          {t("AR9ctVs")}
        </div>
        <div
          className={`list-item-b fx-centered fx ${
            contentFrom === "notes" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("notes")}
        >
          {t("AYIXG83")}
        </div>
        <div
          className={`list-item-b fx-centered fx ${
            contentFrom === "articles" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("articles")}
        >
          {t("AesMg52")}
        </div>

        <div
          className={`list-item-b fx-centered fx ${
            contentFrom === "videos" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("videos")}
        >
          {t("AStkKfQ")}
        </div>
        <div
          className={`list-item-b fx-centered fx ${
            contentFrom === "curations" ? "selected-list-item-b" : ""
          }`}
          onClick={() => switchContentType("curations")}
        >
          {t("AVysZ1s")}
        </div>
      </div>
      <RecentPosts
        filter={subFilter}
        since={since}
        onClick={handleRecentPostsClick}
        kind={contentFrom}
        position="bottom"
      />
      <InfiniteScroll events={notes} onRefresh={setNotesLastEventTime}>
        {notes.map((note, index) => {
          if (![...userMutedList, ...bannedList].includes(note.pubkey)) {
            if (
              note.kind === 6 &&
              ![...userMutedList, ...bannedList].includes(
                note.relatedEvent.pubkey
              )
            )
              return (
                <Fragment key={note.id}>
                  <KindSix event={note} />
                </Fragment>
              );
            if (note.kind === 1)
              return (
                <Fragment key={note.id}>
                  <KindOne event={note} border={true} />
                </Fragment>
              );
            if ([30023, 34235, 21, 22, 30004, 30005].includes(note.kind))
              return (
                <Fragment key={note.id}>
                  <RepEventPreviewCard item={note} />
                </Fragment>
              );
            return null;
          }
        })}
        {notes?.length === 0 && !isLoading && isConnected && (
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
              {t("AB9jjjH")}
            </p>
          </div>
        )}
        {notes?.length === 0 && !isLoading && !isConnected && (
          <div
            className="fit-container fx-centered fx-col"
            style={{ height: "40vh" }}
          >
            <div
              className="link"
              style={{ minWidth: "48px", minHeight: "48px", opacity: 0.5 }}
            ></div>
            <h4>{t("AZ826Ej")}</h4>
            <p className="p-centered gray-c" style={{ maxWidth: "330px" }}>
              {t("A5ebGh9")}
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
      </InfiniteScroll>
    </div>
  );
};
