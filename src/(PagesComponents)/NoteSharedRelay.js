import React, {
  useEffect,
  useRef,
  useState,
  useReducer,
  Fragment,
} from "react";
import { useSelector } from "react-redux";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import ArrowUp from "@/Components/ArrowUp";
import YakiIntro from "@/Components/YakiIntro";
import KindSix from "@/Components/KindSix";
import { saveUsers } from "@/Helpers/DB";
import { getDefaultFilter, getSubData } from "@/Helpers/Controlers";
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
import PostNotePortal from "@/Components/PostNotePortal";

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

export default function NoteSharedRelay() {
  const { t } = useTranslation();
  const router = useRouter();
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
                        className="fit-container fx-scattered fx-col box-marg-s"
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
  const userMutedList = useSelector((state) => state.userMutedList);
  const [notes, dispatchNotes] = useReducer(notesReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [notesLastEventTime, setNotesLastEventTime] = useState(undefined);
  const [isConnected, setIsConnected] = useState(true);

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
        (Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000
      );
      twoDaysPrior = notesLastEventTime
        ? notesLastEventTime - towDaysPeriod
        : notesLastEventTime;
      let since = twoDaysPrior;

      let ndk = await getNDKInstance(relay);
      if (!ndk) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      let data = await getSubData(
        [{ kinds: [1], limit: 100, until: notesLastEventTime, since }],
        50,
        [relay],
        ndk,
        200
      );

      events = data.data
        .splice(0, 50)
        .map((event) => {
          eventsPubkeys.push(event.pubkey);
          let event_ = getParsedNote(event, true);
          if (event_) fallBackEvents.push(event_);
          if (event_) {
            if (event.kind === 6) {
              eventsPubkeys.push(event_.relatedEvent.pubkey);
            }
            return event_;
          }
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

  return (
    <div className="fx-centered  fx-wrap fit-container" style={{ gap: 0 }}>
      {["recent", "recent_with_replies"].includes("global") &&
        notes?.length > 0 && (
          <div className="fit-container box-pad-h">
            <hr />
            <div className="fit-container fx-centered fx-start-h fx-start-v box-pad-h box-pad-v-m">
              <div>
                <div className="eye-opened-24"></div>
              </div>
              <div>
                <p>{t("AZKoEWL")}</p>
                <p className="gray-c">{t("AstvJYT")}</p>
              </div>
            </div>
            <hr />
            <hr />
          </div>
        )}
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
            if (note.kind !== 6)
              return (
                <Fragment key={note.id}>
                  <KindOne event={note} border={true} />
                </Fragment>
              );
          }
        })}

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
