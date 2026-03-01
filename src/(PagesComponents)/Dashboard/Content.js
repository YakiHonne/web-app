import React, { useEffect, useReducer, useState } from "react";
import { useSelector } from "react-redux";
import { getSubData } from "@/Helpers/Controlers";
import { getParsedRepEvent, getParsedSW } from "@/Helpers/Encryptions";
import { straightUp } from "@/Helpers/Helpers";
import Select from "@/Components/Select";
import AddCuration from "@/Components/AddCuration";
import AddVideo from "@/Components/AddVideo";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { customHistory } from "@/Helpers/History";
import LoadingLogo from "@/Components/LoadingLogo";
import { useTranslation } from "react-i18next";
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

export default function Content({ filter, setPostToNote, localDraft, init }) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [contentFrom, setContentFrom] = useState(filter);
  const [isLoading, setIsLoading] = useState(true);
  const [lastEventTime, setLastEventTime] = useState(undefined);
  const [editEvent, setEditEvent] = useState(false);
  const [showCurationCreator, setShowCurationCreator] = useState(
    filter === "curations" && init ? true : false,
  );
  const [showVideosCreator, setShowVideosCreator] = useState(
    filter === "videos" && init ? true : false,
  );
  const [events, dispatchEvents] = useReducer(
    eventsReducer,
    eventsInitialState,
  );
  const emptyContent = {
    articles: t("AH90wGL"),
    drafts: t("A14HHPP"),
    curations: t("AAUycZW"),
    videos: t("AQIAfYS"),
    pictures: t("Aa73Zgk"),
    widgets: t("AvEJw6B"),
    notes: t("A6rkFum"),
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        if (!isLoading) setIsLoading(true);
        let filter = getFilter();
        let data = await getSubData([filter]);
        let parsedEvents = data.data.map((event) => {
          if (event.kind === 1) {
            return event;
          }
          if ([30033].includes(event.kind)) {
            return getParsedSW(event);
          }
          return getParsedRepEvent(event);
        });
        dispatchEvents({ type: contentFrom, events: parsedEvents });
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    if (userKeys) fetchHomeData();
  }, [userKeys, contentFrom, lastEventTime]);

  useEffect(() => {
    if (isLoading) return;
    let filter = getFilter();
    let since = Math.floor(Date.now() / 1000);
    let subscription = ndkInstance.subscribe([{ ...filter, since }]);
    subscription.on("event", (event) => {
      let tempEvent = { ...event.rawEvent() };
      if (![1, 6, 30033].includes(event.kind)) {
        tempEvent = getParsedRepEvent(event.rawEvent());
      }
      if ([30033].includes(event.kind)) {
        tempEvent = getParsedSW(event.rawEvent());
      }
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
    setContentFrom(filter);
  }, [filter]);

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
      limit: 20,
      authors: [userKeys.pub],
      until: lastEventTime,
    };
    if (contentFrom === "articles") filter.kinds = [30023];
    if (contentFrom === "drafts") filter.kinds = [30024];
    if (contentFrom === "curations") filter.kinds = [30004, 30005];
    if (contentFrom === "videos") filter.kinds = [34235, 21, 22];
    if (contentFrom === "pictures") filter.kinds = [20];
    if (contentFrom === "widgets") filter.kinds = [30033];
    if (contentFrom === "notes") filter.kinds = [1, 6];
    return filter;
  };

  const switchContentType = (type) => {
    straightUp();
    setIsLoading(true);
    dispatchEvents({ type: "remove-events" });
    setLastEventTime(undefined);
    setContentFrom(type);
  };

  const handleEventDeletion = (id) => {
    let tempArray = structuredClone(events[contentFrom]);
    tempArray = tempArray.filter((event) => event.id !== id);
    dispatchEvents({
      type: "remove-event",
      toRemoveType: contentFrom,
      events: tempArray,
    });
  };

  const handleAddContent = () => {
    if (["articles", "drafts"].includes(contentFrom)) {
      customHistory("/write-article");
      return;
    }
    if (["widgets"].includes(contentFrom)) {
      customHistory("/smart-widget-builder");
      return;
    }
    if (["notes"].includes(contentFrom)) {
      setPostToNote("");
      return;
    }
    if (["curations"].includes(contentFrom)) {
      setShowCurationCreator(true);
      return;
    }
    if (["videos"].includes(contentFrom)) {
      setShowVideosCreator(true);
      return;
    }
  };
  const handleEditItem = (event) => {
    if ([30004, 30005].includes(event.kind)) {
      setShowCurationCreator(true);
    } else {
      setShowVideosCreator(true);
    }
    setEditEvent(event);
  };

  return (
    <>
      {showVideosCreator && (
        <AddVideo
          exit={() => {
            setShowVideosCreator(false);
          }}
        />
      )}
      {showCurationCreator && (
        <AddCuration
          exit={() => {
            setShowCurationCreator(false);
            setEditEvent(false);
          }}
          curation={editEvent ? editEvent : null}
          tags={editEvent.tags}
          relaysToPublish={[]}
        />
      )}
      <div className="fit-container">
        <div className="fit-container fx-scattered  box-pad-v-m box-pad-h">
          <h4 className="p-caps">
            {["articles", "drafts"].includes(contentFrom) && t("AesMg52")}
            {contentFrom === "widgets" && t("A2mdxcf")}
            {contentFrom === "pictures" && t("Aa73Zgk")}
            {contentFrom === "videos" && t("AStkKfQ")}
            {contentFrom === "curations" && t("AVysZ1s")}
            {contentFrom === "notes" && t("AYIXG83")}
          </h4>
          <div className="fx-centered">
            {["articles", "drafts"].includes(contentFrom) && (
              <Select
                options={[
                  { display_name: t("A65LO6w"), value: "articles" },
                  { display_name: t("Ayh5F4w"), value: "drafts" },
                ]}
                value={contentFrom}
                setSelectedValue={switchContentType}
                noBorder={true}
              />
            )}
            {["articles", "drafts", "notes"].includes(contentFrom) && (
              <button className="btn btn-normal" onClick={handleAddContent}>
                <div className="plus-sign"></div>
              </button>
            )}
          </div>
        </div>
        <div className="fit-container fx-centered fx-col fx-start-v box-pad-h">
          {contentFrom === "drafts" && localDraft?.artDraft && (
            <div className="fit-container fx-centered fx-start-v fx-col">
              <div className="fit-container fx-centered fx-col fx-start-v">
                {localDraft?.artDraft && (
                  <>
                    <p className="c1-c">{t("A7noclE")}</p>
                    <ContentCard event={localDraft?.artDraft} />
                  </>
                )}
              </div>
              {events[contentFrom].length > 0 && <p>Saved</p>}
            </div>
          )}
          {contentFrom === "notes" && localDraft?.noteDraft && (
            <div className="fit-container fx-centered fx-start-v fx-col">
              <div className="fit-container fx-centered fx-col fx-start-v">
                {localDraft?.noteDraft && (
                  <>
                    <p className="c1-c">{t("A7noclE")}</p>
                    <ContentCard
                      event={localDraft?.noteDraft}
                      setPostToNote={setPostToNote}
                      refreshAfterDeletion={handleEventDeletion}
                    />
                  </>
                )}
              </div>
              {events[contentFrom].length > 0 && <p>{t("AQG30hM")}</p>}
            </div>
          )}
          {contentFrom === "widgets" && localDraft?.smartWidgetDraft && (
            <div className="fit-container fx-centered fx-start-v fx-col">
              <div className="fit-container fx-centered fx-col fx-start-v">
                {localDraft?.smartWidgetDraft && (
                  <>
                    <p className="c1-c">{t("A7noclE")}</p>
                    <ContentCard event={localDraft?.smartWidgetDraft} />
                  </>
                )}
              </div>
              {events[contentFrom].length > 0 && <p>{t("AQG30hM")}</p>}
            </div>
          )}
          {events[contentFrom].map((event) => {
            return (
              <ContentCard
                event={event}
                key={event.id}
                refreshAfterDeletion={handleEventDeletion}
                setPostToNote={setPostToNote}
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
        </div>
      </div>
    </>
  );
}
