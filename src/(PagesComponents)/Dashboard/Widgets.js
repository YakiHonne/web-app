import React, { useEffect, useReducer, useState } from "react";
import { useSelector } from "react-redux";
import { getSubData } from "@/Helpers/Controlers";
import { getParsedSW } from "@/Helpers/Encryptions";
import { getArticleDraft, getNoteDraft } from "@/Helpers/ClientHelpers";
import Select from "@/Components/Select";
import { saveUsers } from "@/Helpers/DB";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { customHistory } from "@/Helpers/History";
import LoadingLogo from "@/Components/LoadingLogo";
import { useTranslation } from "react-i18next";
import SWActionPreview from "@/Components/SWActionPreview";
import LaunchSW from "@/Components/LaunchSW";
import Link from "next/link";
import ContentCard from "./ContentCard";

const eventsReducer = (notes, action) => {
  switch (action.type) {
    case "remove-event": {
      let nextState = { ...notes };
      let tempArr = [...action.events];
      nextState[action.toRemoveType] = tempArr;
      return nextState;
    }

    case "remove-events": {
      return eventsInitialState;
    }
    default: {
      let nextState = { ...notes };
      let tempArr = [...nextState[action.type], ...action.events];
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
  articles: [],
  drafts: [],
  curations: [],
  videos: [],
  pictures: [],
  widgets: [],
};
const getLocalDrafts = () => {
  try {
    const artDraft = getArticleDraft();
    const noteDraft = getNoteDraft("root");
    let smartWidgetDraft = localStorage?.getItem("swv2-cdraft");
    try {
      smartWidgetDraft = smartWidgetDraft
        ? JSON.parse(smartWidgetDraft)
        : false;
    } catch (err) {
      smartWidgetDraft = false;
    }

    let localDraft = {
      noteDraft: noteDraft
        ? { kind: 11, content: noteDraft, created_at: false }
        : false,
      // smartWidgetDraft: false,
      smartWidgetDraft: smartWidgetDraft
        ? {
            kind: 300331,
            content: smartWidgetDraft,
            created_at: smartWidgetDraft.created_at,
          }
        : false,
      artDraft: artDraft.default
        ? false
        : artDraft.title || artDraft.content
          ? {
              created_at: artDraft.created_at || Math.floor(Date.now() / 1000),
              kind: 30024,
              title: artDraft.title || "Untitled",
              content: artDraft.content || "Untitled",
              local: true,
            }
          : false,
    };
    return localDraft.artDraft ||
      localDraft.smartWidgetDraft ||
      localDraft.noteDraft
      ? localDraft
      : false;
  } catch (err) {
    return false;
  }
};

export default function Widgets({ setPostToNote, localDrafte }) {
  const userKeys = useSelector((state) => state.userKeys);
  const userSavedTools = useSelector((state) => state.userSavedTools);
  const { t } = useTranslation();
  const contentFrom = "widgets";
  const [isLoading, setIsLoading] = useState(true);
  const [lastEventTime, setLastEventTime] = useState(undefined);
  const [deleteEvent, setDeleteEvent] = useState(false);
  const [selectedSWSet, setSelectedSWSet] = useState(0);
  const [savedTools, setSavedTools] = useState([]);
  const [selectedSW, setSelectedSW] = useState("");
  const [localDraft, setLocalDraft] = useState(getLocalDrafts());
  const [events, dispatchEvents] = useReducer(
    eventsReducer,
    eventsInitialState,
  );
  const emptyContent = {
    widgets: t("AvEJw6B"),
    tools: t("AUexjHk"),
  };

  const SWSets = [
    {
      display_name: t("ACuanyD"),
      value: 0,
    },
    {
      display_name: t("AcD8ZPg"),
      value: 1,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (userSavedTools.length === 0 && savedTools.length > 0) {
        setSavedTools([]);
        return;
      }
      let swIDs = userSavedTools.map((_) => _.split(":")[2]);
      if (swIDs.length === 0) return;
      const data = await getSubData([{ kinds: [30033], "#d": swIDs }]);
      setSavedTools(data.data.map((_) => getParsedSW(_)));
      saveUsers(data.pubkeys);
    };

    fetchData();
  }, [userSavedTools]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        if (!isLoading) setIsLoading(true);
        let filter = getFilter();
        let data = await getSubData([filter]);
        let parsedEvents = data.data.map((event) => {
          return getParsedSW(event);
        });
        dispatchEvents({ type: contentFrom, events: parsedEvents });
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    if (userKeys) fetchHomeData();
  }, [userKeys, lastEventTime]);

  useEffect(() => {
    if (isLoading) return;
    let filter = getFilter();
    let since = Math.floor(Date.now() / 1000);
    let subscription = ndkInstance.subscribe([{ ...filter, since }]);
    subscription.on("event", (event) => {
      let tempEvent = { ...event.rawEvent() };
      tempEvent = getParsedSW(event.rawEvent());
      dispatchEvents({ type: contentFrom, events: [tempEvent] });
    });
    return () => {
      if (subscription) subscription.stop();
    };
  }, [isLoading]);

  useEffect(() => {
    dispatchEvents({ type: "remove-events" });
    setLastEventTime(undefined);
  }, [userKeys]);

  useEffect(() => {
    const handleScroll = () => {
      let container = document.querySelector(".feed-container");

      if (!container) return;
      if (
        container.scrollHeight - container.scrollTop - 60 >
        document.documentElement.offsetHeight
      ) {
        return;
      }
      setLastEventTime(
        events[contentFrom][events[contentFrom].length - 1]?.created_at ||
          undefined,
      );
    };
    document
      .querySelector(".feed-container")
      ?.addEventListener("scroll", handleScroll);
    return () =>
      document
        .querySelector(".feed-container")
        ?.removeEventListener("scroll", handleScroll);
  }, [isLoading]);

  const getFilter = () => {
    let filter = {
      kinds: [30033],
      limit: 20,
      authors: [userKeys.pub],
      until: lastEventTime,
    };
    return filter;
  };

  const handleEventDeletion = (eventID) => {
    let tempArray = structuredClone(events[contentFrom]);
    tempArray = tempArray.filter((event) => event.id !== eventID);
    // dispatchEvents({
    //   type: "remove-event",
    //   toRemoveType: contentFrom,
    //   events: tempArray,
    // });
    dispatchEvents({ type: contentFrom, events: tempArray });

    setDeleteEvent(false);
  };

  const handleAddContent = () => {
    customHistory("/smart-widget-builder");
  };

  const handleDelete = () => {
    setLocalDraft(false);
    localStorage?.removeItem("swv2-cdraft");
  };

  return (
    <>
      {selectedSW && (
        <LaunchSW metadata={selectedSW} exit={() => setSelectedSW("")} />
      )}
      <div className="fit-container">
        <div className="fit-container fx-scattered  box-pad-v-m box-pad-h">
          <h4 className="p-caps">{t("A2mdxcf")}</h4>
          <div className="fx-centered">
            <button className="btn btn-normal" onClick={handleAddContent}>
              <div className="plus-sign"></div>
            </button>
          </div>
        </div>
        <div className="fit-container fx-centered fx-col fx-start-v box-pad-h">
          {contentFrom === "widgets" && localDraft?.smartWidgetDraft && (
            <div className="fit-container fx-centered fx-start-v fx-col">
              <div className="fit-container fx-centered fx-col fx-start-v">
                {localDraft?.smartWidgetDraft && (
                  <>
                    <p className="c1-c">{t("A7noclE")}</p>
                    <ContentCard
                      event={localDraft?.smartWidgetDraft}
                      refreshAfterDeletion={handleEventDeletion}
                      handleDelete={handleDelete}
                    />
                  </>
                )}
              </div>
              {/* {events[contentFrom].length > 0 && <p>{t("AQG30hM")}</p>} */}
            </div>
          )}
          <div className="fit-container fx-scattered">
            <p>{t("AQG30hM")}</p>
            <Select
              options={SWSets}
              value={selectedSWSet}
              setSelectedValue={setSelectedSWSet}
              noBorder={true}
            />
          </div>
          {selectedSWSet === 0 && (
            <>
              {events[contentFrom].map((event) => {
                return (
                  <ContentCard
                    event={event}
                    key={event.id}
                    setDeleteEvent={setDeleteEvent}
                    setPostToNote={setPostToNote}
                    refreshAfterDeletion={handleEventDeletion}
                  />
                );
              })}
              {!isLoading && events[contentFrom].length === 0 && (
                <div
                  className="fit-container fx-centered fx-col"
                  style={{ height: "40vh" }}
                >
                  <h4>{emptyContent[contentFrom]}</h4>
                  <p className="gray-c">{t("AcPmGuk")}</p>
                </div>
              )}
              {isLoading && (
                <div
                  className="fit-container fx-centered"
                  style={{ height: "40vh" }}
                >
                  <div className="fx-centered">
                    <LoadingLogo />
                  </div>
                </div>
              )}
            </>
          )}
          {selectedSWSet === 1 && (
            <>
              {savedTools.map((sw) => {
                return (
                  <div className="ifs-full" key={sw.id}>
                    <SWActionPreview
                      metadata={sw}
                      setSelectSW={(data) => setSelectedSW(data)}
                      cbButton={true}
                      remove={true}
                    />
                  </div>
                );
              })}
              {!isLoading && savedTools.length === 0 && (
                <div
                  className="fit-container fx-centered fx-col"
                  style={{ height: "40vh" }}
                >
                  <h4>{emptyContent.tools}</h4>
                  <p
                    className="gray-c p-centered"
                    style={{ maxWidth: "300px" }}
                  >
                    {t("ASl7AUI")}
                  </p>
                  <Link href={"/smart-widgets"}>
                    <button className="btn btn-small btn-normal">
                      {t("Aa15RS4")}
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
