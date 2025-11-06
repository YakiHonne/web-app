import React, { useEffect, useMemo, useReducer, useState } from "react";
import UserProfilePic from "@/Components/UserProfilePic";
import { useDispatch, useSelector } from "react-redux";
import Date_ from "@/Components/Date_";
import { getPopularNotes, getUserStats } from "@/Helpers/WSInstance";
import LoadingDots from "@/Components/LoadingDots";
import NumberShrink from "@/Components/NumberShrink";
import axios from "axios";
import { getSubData } from "@/Helpers/Controlers";
import {
  convertDate,
  getParsedRepEvent,
  getParsedSW,
  sortEvents,
  timeAgo,
} from "@/Helpers/Encryptions";
import useNoteStats from "@/Hooks/useNoteStats";
import { sleepTimer, straightUp, getLinkFromAddr } from "@/Helpers/Helpers";
import {
  compactContent,
  getArticleDraft,
  nEventEncode,
  getNoteDraft,
  getParsedNote,
} from "@/Helpers/ClientHelpers";
import OptionsDropdown from "@/Components/OptionsDropdown";
import { nip19 } from "nostr-tools";
import { setToPublish } from "@/Store/Slides/Publishers";
import useRepEventStats from "@/Hooks/useRepEventStats";
import Select from "@/Components/Select";
import AddCuration from "@/Components/AddCuration";
import BookmarkEvent from "@/Components/BookmarkEvent";
import AddBookmark from "@/Components/AddBookMark";
import { saveBookmarks, saveUsers } from "@/Helpers/DB";
import ToDeleteGeneral from "@/Components/ToDeleteGeneral";
import PostAsNote from "@/Components/PostAsNote";
import AddVideo from "@/Components/AddVideo";
import InterestSuggestions from "@/Content/InterestSuggestions";
import InterestSuggestionsCards from "@/Components/SuggestionsCards/InterestSuggestionsCards";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { customHistory } from "@/Helpers/History";
import LoadingLogo from "@/Components/LoadingLogo";
import { useTranslation } from "react-i18next";
import ShowPeople from "@/Components/ShowPeople";
import UserFollowers from "@/Components/UserFollowers";
import SWActionPreview from "@/Components/SWActionPreview";
import LaunchSW from "@/Components/LaunchSW";
import EventOptions from "@/Components/ElementOptions/EventOptions";
import { useRouter } from "next/router";
import Link from "next/link";
import { DraggableComp } from "@/Components/DraggableComp";

const eventsReducer = (notes, action) => {
  switch (action.type) {
    case "notes": {
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
    case "articles": {
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
    case "drafts": {
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
    case "curations": {
      let nextState = { ...notes };
      let tempArr = [...nextState[action.type], ...action.events];
      let sortedNotes = tempArr
        .sort((note_1, note_2) => note_2.created_at - note_1.created_at)
        .filter((note, index, tempArr) => {
          if (tempArr.findIndex((_) => _.d === note.d) === index) return note;
        });
      nextState[action.type] = sortedNotes;
      return nextState;
    }
    case "videos": {
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
    case "widgets": {
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
      console.log("wrong action type");
    }
  }
};
const eventsInitialState = {
  notes: [],
  articles: [],
  drafts: [],
  curations: [],
  videos: [],
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
        : {
            created_at: artDraft.created_at || Math.floor(Date.now() / 1000),
            kind: 30024,
            title: artDraft.title || "Untitled",
            content: artDraft.content || "Untitled",
            local: true,
          },
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
const getInterestList = (list) => {
  let tempList = [];
  for (let item of list) {
    let icon = InterestSuggestions.find(
      (_) =>
        _.main_tag.toLowerCase() === item.toLowerCase() ||
        _.sub_tags.find(($) => $.toLowerCase() === item.toLowerCase())
    );
    tempList.push({
      icon: icon?.icon || "",
      item,
      toDelete: false,
    });
  }
  return tempList;
};

export default function Dashboard() {
  const { query } = useRouter();
  const userKeys = useSelector((state) => state.userKeys);
  const [selectedTab, setSelectedTab] = useState(
    query?.tabNumber ? parseInt(query.tabNumber) : 0
  );
  const [userPreview, setUserPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [postToNote, setPostToNote] = useState(query?.init ? "" : false);

  const getNostrBandStats = async (pubkey) => {
    try {
      let stats = await Promise.race([
        axios.get(`https://api.nostr.band/v0/stats/profile/${pubkey}`),
        sleepTimer(),
      ]);
      return stats;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        let [userProfile, sats, popularNotes, userContent] = await Promise.all([
          Promise.race([getUserStats(userKeys.pub), sleepTimer(2000)]),
          getNostrBandStats(userKeys.pub),
          Promise.race([getPopularNotes(userKeys.pub), sleepTimer(2000)]),
          getSubData([
            {
              kinds: [30023, 30004, 30005, 34235, 21, 22],
              limit: 5,
              authors: [userKeys.pub],
            },
            { kinds: [30024], limit: 5, authors: [userKeys.pub] },
          ]),
        ]);
        userProfile = userProfile
          ? JSON.parse(
              userProfile.find((event) => event.kind === 10000105).content
            )
          : { time_joined: Math.floor(Date.now() / 1000) };

        let zaps_sent = sats
          ? sats.data.stats[userKeys.pub].zaps_sent
          : { count: 0, msats: 0 };
        let drafts = userContent.data
          .filter((event) => event.kind === 30024)
          .map((event) => getParsedRepEvent(event));
        let latestPublished = userContent.data
          .filter((event) => event.kind !== 30024)
          .map((event) => getParsedRepEvent(event));

        let localDraft = getLocalDrafts();
        setUserPreview({
          userProfile: {
            ...userProfile,
            zaps_sent,
          },
          popularNotes: popularNotes
            ? sortEvents(popularNotes.filter((_) => _.kind === 1))
            : [],
          drafts: sortEvents(drafts),
          latestPublished: sortEvents(latestPublished),
          localDraft,
        });

        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    if (userKeys) fetchHomeData();
  }, [userKeys]);

  const handleUpdate = async () => {
    let userContent = await getSubData([
      {
        kinds: [30023, 30004, 30005, 34235, 21, 22],
        limit: 5,
        authors: [userKeys.pub],
      },
      { kinds: [30024], limit: 5, authors: [userKeys.pub] },
    ]);
    let latestPublished = userContent.data
      .filter((event) => event.kind !== 30024)
      .map((event) => getParsedRepEvent(event));

    setUserPreview((prev) => {
      return { ...prev, latestPublished: sortEvents(latestPublished) };
    });
  };
  return (
    <>
      {postToNote !== false && (
        <PostAsNote
          exit={() => setPostToNote(false)}
          content={typeof postToNote === "string" ? postToNote : ""}
          linkedEvent={typeof postToNote !== "string" ? postToNote : ""}
        />
      )}
      <div>
        <div
          className="fx-centered fit-container fx-start-h fx-start-v"
          style={{ gap: 0 }}
        >
          <div className="dahsboard-section fit-container">
            <div
              className="fit-height fit-container feed-container"
              style={{ overflow: "scroll" }}
            >
              <SideMenu
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
              <div className="fit-container">
                {selectedTab === 0 && isLoading && (
                  <div
                    className="fit-container fx-centered"
                    style={{ height: "100vh" }}
                  >
                    <div className="fx-centered">
                      <LoadingLogo />
                    </div>
                  </div>
                )}

                {selectedTab === 0 && userPreview && !isLoading && (
                  <HomeTab
                    data={userPreview}
                    setPostToNote={setPostToNote}
                    setSelectedTab={setSelectedTab}
                    handleUpdate={handleUpdate}
                  />
                )}
                {selectedTab === 1 && (
                  <Content
                    filter={"notes"}
                    localDraft={userPreview.localDraft}
                    init={postToNote || false}
                    setPostToNote={setPostToNote}
                  />
                )}
                {selectedTab === 2 && (
                  <Content
                    filter={query?.filter || "articles"}
                    localDraft={userPreview.localDraft}
                    init={postToNote || false}
                    setPostToNote={setPostToNote}
                  />
                )}
                {selectedTab === 3 && (
                  <Content
                    filter={"curations"}
                    localDraft={userPreview.localDraft}
                    init={postToNote || false}
                    setPostToNote={setPostToNote}
                  />
                )}
                {selectedTab === 4 && (
                  <Content
                    filter={"videos"}
                    localDraft={userPreview.localDraft}
                    init={postToNote || false}
                    setPostToNote={setPostToNote}
                  />
                )}
                {selectedTab === 5 && (
                  <Widgets
                    setPostToNote={setPostToNote}
                    localDraft={userPreview.localDraft}
                  />
                )}
                {selectedTab === 6 && <Bookmarks />}
                {selectedTab === 7 && <Interests />}
                <div style={{ marginBottom: "100px" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const SideMenu = ({ setSelectedTab, selectedTab }) => {
  return (
    <>
      <SideMenuDesktop
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
      <SideMenuMobile
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
    </>
  );
};

const SideMenuDesktop = ({ setSelectedTab, selectedTab }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        height: "100vh",
        width: "300px",
        overflow: "hidden",
        borderRight: "1px solid var(--pale-gray)",
        position: "sticky",
        top: 0,
      }}
      className="mb-hide-800"
    >
      <div className="box-pad-h box-pad-v">
        <h4>{t("ALBhi3j")}</h4>
      </div>
      <div className="fx-centered fx-start-v fx-col" style={{ gap: "0" }}>
        <p
          className="option fit-container box-pad-h box-pad-v-m pointer"
          style={{
            backgroundColor: selectedTab === 0 ? "var(--pale-gray)" : "",
          }}
          onClick={() => setSelectedTab(0)}
        >
          {t("AJDdA3h")}
        </p>
        <p
          className="option fit-container box-pad-h box-pad-v-m pointer"
          style={{
            backgroundColor: selectedTab === 1 ? "var(--pale-gray)" : "",
          }}
          onClick={() => setSelectedTab(1)}
        >
          {t("AYIXG83")}
        </p>
        <p
          className="option fit-container box-pad-h box-pad-v-m pointer"
          style={{
            backgroundColor: selectedTab === 2 ? "var(--pale-gray)" : "",
          }}
          onClick={() => setSelectedTab(2)}
        >
          {t("AesMg52")}
        </p>
        <p
          className="option fit-container box-pad-h box-pad-v-m pointer"
          style={{
            backgroundColor: selectedTab === 3 ? "var(--pale-gray)" : "",
          }}
          onClick={() => setSelectedTab(3)}
        >
          {t("AVysZ1s")}
        </p>
        <p
          className="option fit-container box-pad-h box-pad-v-m pointer"
          style={{
            backgroundColor: selectedTab === 4 ? "var(--pale-gray)" : "",
          }}
          onClick={() => setSelectedTab(4)}
        >
          {t("AStkKfQ")}
        </p>
        <p
          className="option fit-container box-pad-h box-pad-v-m pointer"
          style={{
            backgroundColor: selectedTab === 5 ? "var(--pale-gray)" : "",
          }}
          onClick={() => setSelectedTab(5)}
        >
          {t("A2mdxcf")}
        </p>
        <p
          className="option fit-container box-pad-h box-pad-v-m pointer"
          style={{
            backgroundColor: selectedTab === 6 ? "var(--pale-gray)" : "",
          }}
          onClick={() => setSelectedTab(6)}
        >
          {t("AqwEL0G")}
        </p>
        <p
          className="option fit-container box-pad-h box-pad-v-m pointer"
          style={{
            backgroundColor: selectedTab === 7 ? "var(--pale-gray)" : "",
          }}
          onClick={() => setSelectedTab(7)}
        >
          {t("AvcFYqP")}
        </p>
      </div>
    </div>
  );
};

const SideMenuMobile = ({ setSelectedTab, selectedTab }) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid var(--pale-gray)",
        position: "relative",
      }}
      className="desk-hide fit-container"
    >
      <div className="box-pad-h-m box-pad-v-m fit-container fx-scattered">
        <h4>{t("ALBhi3j")}</h4>
        <div
          className="burger-menu"
          onClick={() => setShowMenu(!showMenu)}
        ></div>
      </div>
      {showMenu && (
        <div
          className="fixed-container fx-centered fx-end-h"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        >
          <div
            className="fx-centered fx-start-h fx-start-v fx-col sc-s-18 slide-right"
            style={{
              gap: "0",
              width: "70%",
              height: "100vh",
              borderRadius: "0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="box-pad-h box-pad-v fx-scattered fit-container">
              <h4>{t("ALBhi3j")}</h4>
              <div
                className="close"
                style={{ position: "static" }}
                onClick={() => setShowMenu(!showMenu)}
              >
                <div></div>
              </div>
            </div>
            <p
              className="option fit-container box-pad-h box-pad-v-m pointer"
              style={{
                backgroundColor: selectedTab === 0 ? "var(--pale-gray)" : "",
              }}
              onClick={() => {
                setSelectedTab(0);
                setShowMenu(false);
              }}
            >
              {t("AJDdA3h")}
            </p>
            <p
              className="option fit-container box-pad-h box-pad-v-m pointer"
              style={{
                backgroundColor: selectedTab === 1 ? "var(--pale-gray)" : "",
              }}
              onClick={() => {
                setSelectedTab(1);
                setShowMenu(false);
              }}
            >
              {t("AYIXG83")}
            </p>
            <p
              className="option fit-container box-pad-h box-pad-v-m pointer"
              style={{
                backgroundColor: selectedTab === 2 ? "var(--pale-gray)" : "",
              }}
              onClick={() => {
                setSelectedTab(2);
                setShowMenu(false);
              }}
            >
              {t("AesMg52")}
            </p>
            <p
              className="option fit-container box-pad-h box-pad-v-m pointer"
              style={{
                backgroundColor: selectedTab === 3 ? "var(--pale-gray)" : "",
              }}
              onClick={() => {
                setSelectedTab(3);
                setShowMenu(false);
              }}
            >
              {t("AVysZ1s")}
            </p>
            <p
              className="option fit-container box-pad-h box-pad-v-m pointer"
              style={{
                backgroundColor: selectedTab === 4 ? "var(--pale-gray)" : "",
              }}
              onClick={() => {
                setSelectedTab(4);
                setShowMenu(false);
              }}
            >
              {t("AStkKfQ")}
            </p>
            <p
              className="option fit-container box-pad-h box-pad-v-m pointer"
              style={{
                backgroundColor: selectedTab === 5 ? "var(--pale-gray)" : "",
              }}
              onClick={() => {
                setSelectedTab(5);
                setShowMenu(false);
              }}
            >
              {t("A2mdxcf")}
            </p>
            <p
              className="option fit-container box-pad-h box-pad-v-m pointer"
              style={{
                backgroundColor: selectedTab === 6 ? "var(--pale-gray)" : "",
              }}
              onClick={() => {
                setSelectedTab(6);
                setShowMenu(false);
              }}
            >
              {t("AqwEL0G")}
            </p>
            <p
              className="option fit-container box-pad-h box-pad-v-m pointer"
              style={{
                backgroundColor: selectedTab === 7 ? "var(--pale-gray)" : "",
              }}
              onClick={() => {
                setSelectedTab(7);
                setShowMenu(false);
              }}
            >
              {t("AvcFYqP")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const Content = ({ filter, setPostToNote, localDraft, init }) => {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [contentFrom, setContentFrom] = useState(filter);
  const [isLoading, setIsLoading] = useState(true);
  const [lastEventTime, setLastEventTime] = useState(undefined);
  const [editEvent, setEditEvent] = useState(false);
  const [showCurationCreator, setShowCurationCreator] = useState(
    filter === "curations" && init ? true : false
  );
  const [showVideosCreator, setShowVideosCreator] = useState(
    filter === "videos" && init ? true : false
  );
  const [events, dispatchEvents] = useReducer(
    eventsReducer,
    eventsInitialState
  );
  const emptyContent = {
    articles: t("AH90wGL"),
    drafts: t("A14HHPP"),
    curations: t("AAUycZW"),
    videos: t("AQIAfYS"),
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
          undefined
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
};

const Widgets = ({ setPostToNote, localDraft }) => {
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

  const [events, dispatchEvents] = useReducer(
    eventsReducer,
    eventsInitialState
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
          undefined
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
};

const Bookmarks = () => {
  const userKeys = useSelector((state) => state.userKeys);
  const userBookmarks = useSelector((state) => state.userBookmarks);
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [editBookmark, setEditBookmark] = useState(false);
  const [deleteBookmark, setDeleteBookmark] = useState(false);

  useEffect(() => {
    if (userKeys) setShowDetails(false);
  }, [userKeys]);

  const handleBookmarkDeletion = () => {
    let tempArr = Array.from(userBookmarks);
    let index = tempArr.findIndex(
      (bookmark) => bookmark.id === deleteBookmark.id
    );
    tempArr.splice(index, 1);
    saveBookmarks(tempArr, userKeys.pub);
    setDeleteBookmark(false);
  };

  return (
    <>
      {showAddBookmark && (
        <AddBookmark exit={() => setShowAddBookmark(false)} />
      )}
      {editBookmark && (
        <AddBookmark
          bookmark={editBookmark}
          tags={editBookmark.tags}
          exit={() => setEditBookmark(false)}
        />
      )}
      {deleteBookmark && (
        <ToDeleteGeneral
          eventId={deleteBookmark.id}
          title={deleteBookmark.title}
          kind={t("AtlqBGm")}
          refresh={handleBookmarkDeletion}
          cancel={() => setDeleteBookmark(false)}
          aTag={deleteBookmark.aTag}
        />
      )}
      <div className="fit-container">
        <div className="fit-container fx-scattered  box-pad-v-m box-pad-h">
          <h4 className="p-caps">{t("AqwEL0G")}</h4>
          <button
            className="btn btn-normal"
            onClick={() => setShowAddBookmark(true)}
          >
            <div className="plus-sign"></div>
          </button>
        </div>
        <div className="fit-container fx-centered fx-col fx-start-v box-pad-h">
          {!showDetails &&
            userBookmarks.map((event) => {
              return (
                <BookmarkCard
                  event={event}
                  key={event.id}
                  showDetails={setShowDetails}
                  deleteEvent={setDeleteBookmark}
                  editEvent={setEditBookmark}
                />
              );
            })}
          {showDetails && (
            <BookmarkContent
              bookmark={showDetails}
              exit={() => setShowDetails(false)}
              setToDeleteBoormark={() => null}
              setToEditBookmark={() => null}
            />
          )}
        </div>
      </div>
    </>
  );
};

const Interests = () => {
  const userInterestList = useSelector((state) => state.userInterestList);
  const { t } = useTranslation();
  const interests = useMemo(() => {
    return getInterestList(userInterestList);
  }, [userInterestList]);

  const [isManage, setIsManage] = useState(false);
  return (
    <div className="fit-container">
      <div className="fit-container fx-scattered  box-pad-v-m box-pad-h">
        <h4 className="p-caps">{t("AvcFYqP")}</h4>
        {userInterestList.length > 0 && !isManage && (
          <button className="btn btn-normal" onClick={() => setIsManage(true)}>
            {t("A8RA6c7")}
          </button>
        )}
      </div>
      {userInterestList.length === 0 && !isManage && (
        <div className="fit-container fx-centered" style={{ padding: "3rem" }}>
          <div
            className="sc-s-18 fit-container  fx-centered fx-col"
            style={{ backgroundColor: "transparent", padding: "3rem" }}
          >
            <h4>{t("AI11KEH")}</h4>
            <p
              className="p-centered gray-c box-pad-v-m"
              style={{ maxWidth: "500px" }}
            >
              {t("A70Zdvz")}
            </p>
            <button
              className="btn btn-normal fx-centered"
              onClick={() => setIsManage(true)}
            >
              <div className="plus-sign"></div>
              {t("AIUAUcP")}
            </button>
          </div>
        </div>
      )}
      {!isManage && (
        <div className="fx-centered fx-col box-pad-h">
          {interests.map((item, index) => {
            return (
              <div
                className="fx-centered fx-start-h sc-s-18 box-pad-h-m box-pad-v-m fit-container"
                style={{ backgroundColor: "transparent" }}
                key={index}
              >
                <div
                  style={{
                    minWidth: `38px`,
                    aspectRatio: "1/1",
                    position: "relative",
                  }}
                  className="sc-s-18 fx-centered"
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      zIndex: 2,
                      backgroundImage: `url(${item.icon})`,
                    }}
                    className="bg-img cover-bg  fit-container fit-height"
                  ></div>
                  <p
                    className={"p-bold p-caps p-big"}
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    {item.item.charAt(0)}
                  </p>
                </div>
                <p className="p-caps">{item.item}</p>
              </div>
            );
          })}
        </div>
      )}
      {isManage && <ManageInterest exit={() => setIsManage(false)} />}
    </div>
  );
};

const HomeTab = ({ data, setPostToNote, setSelectedTab, handleUpdate }) => {
  const userMetadata = useSelector((state) => state.userMetadata);
  const userFollowings = useSelector((state) => state.userFollowings);
  const { t } = useTranslation();
  const [deleteEvent, setDeleteEvent] = useState(false);
  const [addArtsToCur, setAddArtsToCur] = useState(false);
  const [showCurationCreator, setShowCurationCreator] = useState(false);
  const [editEvent, setEditEvent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [showPeople, setShowPeople] = useState(false);

  const handleEditItem = (event) => {
    if ([30004, 30005].includes(event.kind)) {
      setShowCurationCreator(true);
    }
    setEditEvent(event);
  };

  const handleUpdateEvent = () => {
    let timer = setTimeout(() => {
      setShowCurationCreator(false);
      setEditEvent(false);
      setDeleteEvent(false);
      handleUpdate();
      clearTimeout(timer);
    }, [1000]);
  };

  return (
    <>
      {deleteEvent && (
        <ToDeleteGeneral
          eventId={deleteEvent.id}
          title={deleteEvent.title}
          refresh={handleUpdateEvent}
          cancel={() => setDeleteEvent(false)}
          aTag={deleteEvent.aTag}
        />
      )}
      {showCurationCreator && (
        <AddCuration
          exit={handleUpdateEvent}
          curation={editEvent ? editEvent : null}
          tags={editEvent.tags}
          relaysToPublish={[]}
        />
      )}
      {showPeople === "followers" && (
        <UserFollowers
          id={userMetadata.pubkey}
          exit={() => setShowPeople(false)}
          expand={true}
        />
      )}
      {showPeople === "following" && (
        <ShowPeople
          exit={() => setShowPeople(false)}
          list={userFollowings}
          type={"following"}
        />
      )}
      <div className="fit-container box-pad-h">
        <div className="fit-container fx-scattered">
          {/* <h4>{t("AJDdA3h")}</h4> */}
          {/* <div style={{ width: "150px" }}>
          <WriteNew exit={() => null} />
        </div> */}
        </div>
        <div className="fit-container fx-centered fx-col box-pad-v">
          <div className="fit-container fx-centered fx-stretch fx-wrap">
            <div
              className="sc-s-18 box-pad-v fx"
              style={{ position: "relative", flex: "1 1 400px" }}
            >
              <div
                style={{
                  backgroundImage: `url(${userMetadata.banner})`,
                  position: "absolute",
                  left: 0,
                  top: 0,
                  zIndex: 0,
                  height: "40%",
                  width: "100%",
                }}
                className="bg-img cover-bg"
              ></div>
              <div
                className="box-pad-h fx fx-centered fx-start-h fx-end-v"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div
                  style={{
                    border: "6px solid var(--c1-side)",
                    borderRadius: "22px",
                  }}
                >
                  <UserProfilePic mainAccountUser={true} size={150} />
                </div>
                <div className="box-pad-v-s fit-container fx-scattered fx-wrap">
                  <div className="fx-centered fx-col fx-start-v">
                    <h4>{userMetadata.display_name || userMetadata.name}</h4>
                    <p className="gray-c">
                      {t("AcqUGhB", {
                        date: convertDate(
                          new Date(data.userProfile.time_joined * 1000)
                        ),
                      })}{" "}
                      {/* <Date_
                      toConvert={new Date(data.userProfile.time_joined * 1000)}
                      /> */}
                    </p>
                  </div>
                  <Link href={`/yaki-points`}>
                    <button className="btn btn-small btn-normal fx-centered">
                      <div className="cup"></div> Yaki {t("A4IGG0z")}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div
              className="fx-centered fit-container fx-wrap"
              style={{ flex: "1 1 400px" }}
            >
              <div
                className="fx-centered fx-wrap"
                style={{ flex: "1 1 300px" }}
              >
                <div
                  className="sc-s-18 option pointer fx-centered fx-col fx-start-h fx-start-v box-pad-h box-pad-v fit-height"
                  style={{
                    backgroundColor: "transparent",
                    gap: "16px",
                    flex: "1 1 100px",
                  }}
                  onClick={() => setShowPeople("following")}
                >
                  <div
                    className="user-followed-24"
                    style={{ minWidth: "32px", minHeight: "32px" }}
                  ></div>
                  <div className="fx-centered fx-wrap fx-start-h">
                    <p className="p-big">
                      {data.userProfile?.follows_count || 0}
                    </p>
                    <p className="gray-c">{t("A9TqNxQ")}</p>
                  </div>
                </div>
                <div
                  className="sc-s-18 option pointer fx-centered fx-col fx-start-h fx-start-v box-pad-h box-pad-v fit-height"
                  style={{
                    backgroundColor: "transparent",
                    gap: "16px",
                    flex: "1 1 100px",
                  }}
                  onClick={() => setShowPeople("followers")}
                >
                  <div
                    className="user-followed-24"
                    style={{ minWidth: "32px", minHeight: "32px" }}
                  ></div>
                  <div className="fx-centered fx-wrap fx-start-h">
                    <p className="p-big">
                      {data.userProfile?.followers_count || 0}
                    </p>
                    <p className="gray-c">{t("A6huCnT")}</p>
                  </div>
                </div>
              </div>
              <div
                className="fx fx-centered fx-wrap"
                style={{ flex: "1 1 300px" }}
              >
                <Link
                  className="sc-s-18 option pointer fx-centered fx-col fx-start-v box-pad-h box-pad-v fit-height"
                  style={{
                    backgroundColor: "transparent",
                    gap: "16px",
                    flex: "1 1 100px",
                  }}
                  href={`/profile/${nip19.nprofileEncode({
                    pubkey: userMetadata.pubkey,
                  })}`}
                >
                  <div
                    className="note-24"
                    style={{ minWidth: "32px", minHeight: "32px" }}
                  ></div>
                  <div className="fx-centered fx-wrap fx-start-h">
                    <p className="p-big">{data.userProfile?.note_count || 0}</p>
                    <p className="gray-c">{t("AYIXG83")}</p>
                  </div>
                </Link>
                <Link
                  className="sc-s-18 option pointer fx-centered fx-col fx-start-v box-pad-h box-pad-v fit-height"
                  style={{
                    backgroundColor: "transparent",
                    gap: "16px",
                    flex: "1 1 100px",
                  }}
                  href={{
                    pathname: `/profile/${nip19.nprofileEncode({
                      pubkey: userMetadata.pubkey,
                    })}`,
                    query: { contentType: "replies" },
                  }}
                >
                  <div
                    className="comment-icon"
                    style={{ minWidth: "32px", minHeight: "32px" }}
                  ></div>
                  <div className="fx-centered fx-wrap fx-start-h">
                    <p className="p-big">
                      {data.userProfile?.reply_count || 0}
                    </p>
                    <p className="gray-c">{t("AENEcn9")}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <div className="fit-container fx-centered fx-wrap">
            <div
              className="sc-s-18  fx-centered fx-col fx-start-h fx-start-v box-pad-h box-pad-v "
              style={{
                backgroundColor: "transparent",
                gap: "16px",
                flex: "1 1 200px",
              }}
            >
              <div
                className="bolt-24"
                style={{ minWidth: "32px", minHeight: "32px" }}
              ></div>
              <div className="fx-centered">
                <div>
                  <p className="p-big">
                    <NumberShrink
                      value={data.userProfile?.total_zap_count || 0}
                    />
                  </p>
                  <p className="gray-c">{t("AFk1EBA")}</p>
                </div>
                <p className="gray-c p-medium">&#8226; </p>
                <div>
                  <p className="p-big">
                    <NumberShrink
                      value={data.userProfile?.total_satszapped || 0}
                    />
                  </p>
                  <p className="gray-c">{t("AUb1YTL")}</p>
                </div>
              </div>
            </div>
            <div
              className="sc-s-18  fx-centered fx-col fx-start-h fx-start-v box-pad-h box-pad-v "
              style={{
                backgroundColor: "transparent",
                gap: "16px",
                flex: "1 1 200px",
              }}
            >
              <div
                className="bolt-24"
                style={{ minWidth: "32px", minHeight: "32px" }}
              ></div>
              <div className="fx-centered">
                <div>
                  <p className="p-big">
                    {
                      <NumberShrink
                        value={data.userProfile?.zaps_sent?.count || 0}
                      />
                    }
                  </p>
                  <p className="gray-c">{t("AmdnVra")}</p>
                </div>
                <p className="gray-c p-medium">&#8226; </p>
                <div>
                  <p className="p-big">
                    <NumberShrink
                      value={(data.userProfile?.zaps_sent?.msats || 0) / 1000}
                    />
                  </p>
                  <p className="gray-c">{t("AUb1YTL")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="fit-container fx-even sticky box-pad-h"
          style={{
            top: "-1px",
            // padding: "1rem",
            paddingTop: 0,
            paddingBottom: 0,
            columnGap: 0,
            borderBottom: "1px solid var(--very-dim-gray)",
            borderTop: "1px solid var(--very-dim-gray)",
          }}
        >
          <div
            className={`list-item-b fx-centered fx ${
              selectedCategory === 0 ? "selected-list-item-b" : ""
            }`}
            onClick={() => setSelectedCategory(0)}
          >
            {t("At9t6yz")}
          </div>
          <div
            className={`list-item-b fx-centered fx ${
              selectedCategory === 1 ? "selected-list-item-b" : ""
            }`}
            onClick={() => setSelectedCategory(1)}
          >
            {t("Ayh5F4w")}
          </div>
          <div
            className={`list-item-b fx-centered fx ${
              selectedCategory === 2 ? "selected-list-item-b" : ""
            }`}
            onClick={() => setSelectedCategory(2)}
          >
            {t("AU2yMBa")}
          </div>
        </div>
        {selectedCategory === 0 && (
          <div>
            {data.latestPublished.length > 0 && (
              <div className="fit-container fx-centered fx-start-v fx-col box-pad-v-m">
                <div className="fit-container fx-centered fx-col fx-start-v">
                  {data.latestPublished.map((event) => {
                    return (
                      <ContentCard
                        key={event.id}
                        event={event}
                        setPostToNote={setPostToNote}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {selectedCategory === 1 && (
          <div>
            {(data.localDraft || data.drafts.length > 0) && (
              <div className="fit-container fx-centered fx-start-v fx-col box-pad-v-m">
                <div className="fit-container fx-centered fx-col fx-start-v">
                  {data.localDraft && (
                    <>
                      <p className="c1-c">{t("A7noclE")}</p>
                      {data.localDraft.noteDraft && (
                        <ContentCard
                          event={data.localDraft.noteDraft}
                          setPostToNote={setPostToNote}
                        />
                      )}
                      {data.localDraft.artDraft && (
                        <ContentCard event={data.localDraft.artDraft} />
                      )}
                      {data.localDraft.smartWidgetDraft && (
                        <ContentCard event={data.localDraft.smartWidgetDraft} />
                      )}
                    </>
                  )}
                  {data.drafts.length > 0 && (
                    <>
                      <div className="fit-container fx-scattered">
                        <p>{t("AQG30hM")}</p>
                        {data.drafts.length > 4 && (
                          <p
                            className="btn-text-gray pointer"
                            onClick={() => {
                              setSelectedTab(1);
                            }}
                          >
                            {t("A4N51J3")}
                          </p>
                        )}
                      </div>
                      {data.drafts.slice(0, 4).map((event) => {
                        return <ContentCard key={event.id} event={event} />;
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {selectedCategory === 2 && (
          <div>
            {data.popularNotes.length > 0 && (
              <div className="fit-container fx-centered fx-start-v fx-col box-pad-v-m">
                <div className="fit-container fx-centered fx-col">
                  {data.popularNotes.map((event) => {
                    return <ContentCard key={event.id} event={event} />;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const ContentCard = ({ event, refreshAfterDeletion, setPostToNote }) => {
  return (
    <>
      {[1, 6].includes(event.kind) && <NoteCard event={event} />}
      {[11, 300331].includes(event.kind) && (
        <DraftCardOthers event={event} setPostToNote={setPostToNote} />
      )}
      {event.kind === 30024 && (
        <DraftCard event={event} refreshAfterDeletion={refreshAfterDeletion} />
      )}
      {[30004, 30005, 30023, 34235, 30033, 21, 22].includes(event.kind) && (
        <RepCard event={event} refreshAfterDeletion={refreshAfterDeletion} />
      )}
      {event.kind === 30003 && <BookmarkCard event={event} />}
    </>
  );
};

const DraftCard = ({ event, refreshAfterDeletion }) => {
  const { t } = useTranslation();
  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m pointer"
      style={{
        backgroundColor: "transparent",
        gap: "32px",
        overflow: "visible",
        borderColor: event.local ? "var(--c1)" : "",
      }}
      onClick={(e) => {
        e.stopPropagation();
        event.local
          ? customHistory("/write-article")
          : customHistory("/write-article", {
              post_pubkey: event.pubkey,
              post_id: event.id,
              post_kind: event.kind,
              post_title: event.title,
              post_desc: event.description,
              post_thumbnail: event.image,
              post_tags: event.items,
              post_d: event.d,
              post_content: event.content,
              post_published_at: event.published_at,
            });
      }}
    >
      <div className="fx-centered fx-start-v">
        <div className="round-icon">
          <div className="posts-24"></div>
        </div>

        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <div className="fx-centered">
            <p className="gray-c p-medium">
              {t("AcKscQl", {
                date: timeAgo(new Date(event.created_at * 1000)),
              })}
            </p>
            {event.local && (
              <div className="sticker sticker-normal sticker-gray-black">
                {t("AyYkCrS")}
              </div>
            )}
          </div>
          <p className="p-two-lines">
            {event.title || (
              <span className="p-italic gray-c">{t("AaWkOl3")}</span>
            )}
          </p>
        </div>
      </div>
      {!event.local && (
        <EventOptions
          event={event}
          component="dashboardArticlesDraft"
          refreshAfterDeletion={refreshAfterDeletion}
        />
      )}
    </div>
  );
};

const DraftCardOthers = ({ event, setPostToNote }) => {
  const { t } = useTranslation();
  const handleRedirect = (e) => {
    e.stopPropagation();
    if (event.kind === 11) {
      setPostToNote("");
      return;
    }
    if (event.kind === 300331) {
      customHistory("/smart-widget-builder");
    }
  };
  const eventKindsDisplayName = {
    1: t("Az5ftet"),
    11: t("Az5ftet"),
    7: t("Alz0E9Y"),
    6: t("Aai65RJ"),
    30023: t("AyYkCrS"),
    30024: t("AsQyoY0"),
    30004: t("Ac6UnVb"),
    30005: t("Ac6UnVb"),
    34235: t("AVdmifm"),
    21: t("AVdmifm"),
    22: t("AVdmifm"),
    34236: t("AVdmifm"),
    300331: t("AkvXmyz"),
    30033: t("AkvXmyz"),
  };
  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m pointer"
      style={{
        backgroundColor: "transparent",
        gap: "32px",
        overflow: "visible",
        borderColor: "var(--c1)",
      }}
      onClick={handleRedirect}
    >
      <div className="fx-centered fx-start-v">
        <div className="round-icon">
          {event.kind === 11 && <div className="note-24"></div>}
          {event.kind === 300331 && !event.content.image && (
            <div className="smart-widget-24"></div>
          )}

          {event.kind === 300331 && event.content.image && (
            <img
              src={event.content.image}
              className="sc-s fx-centered"
              style={{
                width: "45px",
                height: "45px",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <div className="fx-centered">
            <p className="gray-c p-medium">
              {t("AcKscQl", {
                date: event.created_at
                  ? timeAgo(new Date(event.created_at * 1000))
                  : t("AiAJcg1"),
              })}
            </p>
            <div className="sticker sticker-normal sticker-gray-black">
              {eventKindsDisplayName[event.kind]}
            </div>
          </div>
          <p className="p-two-lines">
            {event.kind === 11 && (
              <>{compactContent(event.content, event.pubkey)}</>
            )}
            {event.kind === 300331 && (
              <>
                <span>{t("AkvXmyz")}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <OptionsDropdown
        options={[
          <div className="pointer" onClick={handleRedirect}>
            <p>{t("Ai4af1h")}</p>
          </div>,
        ]}
      />
    </div>
  );
};

const RepCard = ({ event, refreshAfterDeletion }) => {
  const { t } = useTranslation();
  const { postActions } = useRepEventStats(event.aTag, event.pubkey);

  const eventKindsDisplayName = {
    1: t("Az5ftet"),
    11: t("Az5ftet"),
    7: t("Alz0E9Y"),
    6: t("Aai65RJ"),
    30023: t("AyYkCrS"),
    30024: t("AsQyoY0"),
    30004: t("Ac6UnVb"),
    30005: t("Ac6UnVb"),
    34235: t("AVdmifm"),
    22: t("AVdmifm"),
    21: t("AVdmifm"),
    34236: t("AVdmifm"),
    300331: t("AkvXmyz"),
    30033: t("AkvXmyz"),
  };

  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m pointer"
      style={{
        backgroundColor: "transparent",
        gap: "32px",
        overflow: "visible",
      }}
      onClick={(e) => {
        e.stopPropagation();
        customHistory(getLinkFromAddr(event.naddr));
      }}
    >
      <div className="fx-centered fx-start-v">
        {!event.image && (
          <div className="round-icon">
            {[30004, 30005].includes(event.kind) && (
              <div className="curation-24"></div>
            )}
            {[30023].includes(event.kind) && <div className="posts-24"></div>}
            {[34235, 21, 22].includes(event.kind) && (
              <div className="play-24"></div>
            )}
            {[30033].includes(event.kind) && (
              <div className="smart-widget-24"></div>
            )}
          </div>
        )}
        {event.image && (
          <div
            className="sc-s-18 bg-img cover-bg"
            style={{
              backgroundImage: `url(${event.image})`,
              minWidth: "48px",
              aspectRatio: "1/1",
            }}
          ></div>
        )}

        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <p className="gray-c p-medium">
            {t("AcKscQl", { date: timeAgo(new Date(event.created_at * 1000)) })}{" "}
          </p>
          <p className="p-two-lines">
            {event.title || (
              <span className="p-italic gray-c">{t("AaWkOl3")}</span>
            )}
          </p>
          <div className="fx-centered">
            <div className="fx-centered">
              <div className="heart"></div>
              <div className="gray-c">{postActions.likes.likes.length}</div>
            </div>
            <div className="fx-centered">
              <div className="comment-icon"></div>
              <p className="gray-c">{postActions.replies.replies.length}</p>
            </div>
            <div className="fx-centered">
              <div className="bolt"></div>
              <p className="gray-c">{postActions.zaps.total}</p>
            </div>
            <div className="box-pad-h-s">
              <div className="sticker sticker-normal sticker-gray-black">
                {eventKindsDisplayName[event.kind]}
              </div>
            </div>
          </div>
        </div>
      </div>
      {!event.local && (
        <div
          className="fx-centered"
          onClick={(e) => e.stopPropagation()}
          style={{ minWidth: "max-content" }}
        >
          {event.kind === 30033 && (
            <EventOptions
              event={event}
              component="dashboardSW"
              refreshAfterDeletion={refreshAfterDeletion}
            />
          )}
          {[30023, 30024].includes(event.kind) && (
            <EventOptions
              event={event}
              component="dashboardArticles"
              refreshAfterDeletion={refreshAfterDeletion}
            />
          )}
          {[34235, 34236, 21, 22].includes(event.kind) && (
            <EventOptions
              event={event}
              component="dashboardVideos"
              refreshAfterDeletion={refreshAfterDeletion}
            />
          )}
          {[30004, 30005].includes(event.kind) && (
            <EventOptions
              event={event}
              component="dashboardCuration"
              refreshAfterDeletion={refreshAfterDeletion}
            />
          )}
        </div>
      )}
    </div>
  );
};

const NoteCard = ({ event }) => {
  const { t } = useTranslation();
  const isRepost =
    event.kind === 6
      ? getParsedNote(JSON.parse(event.content))
      : getParsedNote(event);
  if (!isRepost) return null;
  const { postActions } = useNoteStats(isRepost.id, isRepost.pubkey);
  const isFlashNews = isRepost.tags.find(
    (tag) => tag[0] === "l" && tag[1] === "FLASH NEWS"
  )
    ? true
    : false;
  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m  pointer"
      style={{
        backgroundColor: "transparent",
        gap: "32px",
        overflow: "visible",
      }}
      onClick={(e) => {
        e.stopPropagation();
        customHistory(`/note/${nEventEncode(isRepost.id)}`);
      }}
    >
      <div className="fx-centered fx-start-v">
        <div className="round-icon">
          <div className="note-24"></div>
        </div>
        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <div className="fx-centered">
            <p className="gray-c p-medium">
              {t("A65LO6w", {
                date: timeAgo(new Date(isRepost.created_at * 1000)),
              })}{" "}
            </p>
          </div>
          <p className="p-two-lines">
            {compactContent(isRepost.content, isRepost.pubkey)}
          </p>
          <div className="fx-centered">
            <div className="fx-centered">
              <div className="heart"></div>
              <div className="gray-c">{postActions.likes.likes.length}</div>
            </div>
            <div className="fx-centered">
              <div className="comment-icon"></div>
              <p className="gray-c">{postActions.replies.replies.length}</p>
            </div>
            <div className="fx-centered">
              <div className="bolt"></div>
              <p className="gray-c">{postActions.zaps.total}</p>
            </div>
            {isFlashNews && (
              <div className="sticker sticker-normal sticker-gray-black">
                {t("AAg9D6c")}
              </div>
            )}
            {event.kind === 6 && (
              <div className="sticker sticker-normal sticker-gray-black fx-centered">
                {t("AqWa0gF")} <div className="switch-arrows"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="fx-centered" style={{ minWidth: "max-content" }}>
        <EventOptions event={isRepost} component="dashboardNotes" />
      </div>
    </div>
  );
};

const BookmarkCard = ({ event, showDetails, deleteEvent, editEvent }) => {
  const { t } = useTranslation();
  return (
    <div
      className="fit-container fx-scattered sc-s-18 box-pad-h-m box-pad-v-m pointer"
      style={{
        backgroundColor: "transparent",
        gap: "32px",
        overflow: "visible",
      }}
      onClick={(e) => {
        e.stopPropagation();
        showDetails(event);
      }}
    >
      <div className="fx-centered fx-start-v">
        {!event.image && (
          <div className="round-icon">
            <div className="bookmark-24"></div>
          </div>
        )}
        {event.image && (
          <div
            className="sc-s-18 bg-img cover-bg"
            style={{
              backgroundImage: `url(${event.image})`,
              minWidth: "48px",
              aspectRatio: "1/1",
            }}
          ></div>
        )}

        <div className="fx-centered fx-col fx-start-h fx-start-v">
          <p className="gray-c p-medium">
            {t("AcKscQl", { date: timeAgo(new Date(event.created_at * 1000)) })}{" "}
          </p>
          <div className="fx-centered">
            <p className="p-two-lines">
              {event.title || (
                <span className="p-italic gray-c">{t("AaWkOl3")}</span>
              )}
            </p>
            <span className="sticker sticker-gray-black sticker-small">
              {t("A04okTg", { count: event.items.length })}
            </span>
          </div>
        </div>
      </div>

      <div className="fx-centered" style={{ minWidth: "max-content" }}>
        <OptionsDropdown
          options={[
            <div
              className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
              onClick={(e) => {
                e.stopPropagation();
                editEvent(event);
              }}
              style={{ width: "100px" }}
            >
              <p>{t("AsXohpb")}</p>
            </div>,
            <div
              className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale"
              onClick={(e) => {
                e.stopPropagation();
                deleteEvent(event);
              }}
              style={{ width: "100px" }}
            >
              <p className="red-c">{t("Almq94P")}</p>
            </div>,
          ]}
        />
      </div>
    </div>
  );
};

const BookmarkContent = ({ bookmark, exit }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [postKind, setPostKind] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsNumber = useMemo(() => {
    if (postKind === 0)
      return content.length >= 10 || content.length === 0
        ? content.length
        : `0${content.length}`;
    let num = content.filter((item) => item.kind === postKind).length;
    return num >= 10 || num === 0 ? num : `0${num}`;
  }, [postKind, content]);
  const bookmarkFilterOptions = [
    {
      display_name: "All content",
      value: 0,
    },
    {
      display_name: t("AesMg52"),
      value: 30023,
    },
    {
      display_name: "Articles curations",
      value: 30004,
    },
    {
      display_name: "Video curations",
      value: 30005,
    },
    {
      display_name: "Notes",
      value: 1,
    },
    {
      display_name: "Paid notes",
      value: 11,
    },
    {
      display_name: "Videos",
      value: 34235,
    },
  ];
  useEffect(() => {
    const fetchData = async () => {
      let tags = bookmark.tags.filter((tag) => ["a", "e"].includes(tag[0]));
      let aDs = [];
      let aKinds = [];
      let eIDs = [];
      for (let tag of tags) {
        tag[0] === "a" &&
          aDs.push(tag[1].split(":").splice(2, 100).join(":")) &&
          aKinds.push(parseInt(tag[1].split(":")[0]));
        tag[0] === "e" && eIDs.push(tag[1]);
      }
      aKinds = [...new Set(aKinds)];

      let filter = [];
      aDs.length > 0 && filter.push({ kinds: aKinds, "#d": aDs });
      eIDs.length > 0 && filter.push({ kinds: [1], ids: eIDs });
      setIsLoading(true);
      let events = await getSubData(filter);

      events = events.data.map((event) => {
        if ([30004, 30005, 30023, 34235, 21, 22].includes(event.kind)) {
          let parsedEvent = getParsedRepEvent(event);
          return parsedEvent;
        }

        let l = event.tags.find((tag) => tag[0] === "l" && tag[1]);
        let kind = l
          ? event.kind === 1 && l[1] === "FLASH NEWS"
            ? 1
            : 11
          : 111;
        let tempEvent = { ...event };
        tempEvent.kind = kind;
        return tempEvent;
      });
      setContent(events);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div
      className="fit-container fx-centered"
      onClick={(e) => {
        e.stopPropagation();
        setShowFilter(false);
      }}
    >
      <div style={{ flex: 1 }}>
        <div className="fit-container fx-scattered box-marg-s">
          <div className="fx-centered fx-start-h pointer" onClick={exit}>
            <div className="round-icon">
              <div
                className="arrow"
                style={{ transform: "rotate(90deg)" }}
              ></div>
            </div>
            <p>{t("A8VdJyb")}</p>
          </div>
        </div>
        <div className="fx-centered fx-start-h  fx-col fx-stretch">
          <div
            className="fit-container bg-img cover-bg sc-s-18 fx-centered fx-end-v box-marg-s"
            style={{
              backgroundImage: `url(${bookmark.image})`,
              aspectRatio: "10 / 3",
            }}
          ></div>
          <div className="fx-scattered fx-col fx-start-v">
            <div className="fx-centered fx-col fx-start-v">
              <h4 className="p-caps">{bookmark.title}</h4>
              <p className="gray-c">{bookmark.description}</p>
            </div>
            <p className="gray-c">
              {bookmark.items.length} item(s) &#8226;{" "}
              <span className="orange-c">
                Edited{" "}
                <Date_ toConvert={new Date(bookmark.created_at * 1000)} />
              </span>
            </p>
          </div>
        </div>
        {content.length > 0 && !isLoading && (
          <div className="fx-centered fx-col" style={{ marginTop: "1rem" }}>
            <div className="box-marg-s fit-container fx-scattered">
              <h4 className="gray-c fx-start-h">List</h4>

              <Select
                options={bookmarkFilterOptions}
                setSelectedValue={setPostKind}
                value={postKind}
              />
            </div>
            {itemsNumber === 0 && (
              <div
                className="fx-centered fx-col fit-container"
                style={{ height: "20vh" }}
              >
                <h4>{t("AklxVKp")}</h4>
                <p className="gray-c p-centered" style={{ maxWidth: "350px" }}>
                  {t("APCvbSy")}
                </p>
              </div>
            )}
            {content.map((item) => {
              let content = getParsedRepEvent(item);
              let naddr = [30004, 30023, 30005, 34235, 21, 22].includes(
                item.kind
              )
                ? nip19.naddrEncode({
                    identifier: content.d,
                    pubkey: item.pubkey,
                    kind: item.kind,
                  })
                : "";
              let nEvent = [1, 11, 111].includes(item.kind)
                ? nip19.neventEncode({
                    author: item.pubkey,
                    id: item.id,
                  })
                : "";
              if (
                !postKind &&
                [30004, 30023, 30005, 34235, 21, 22].includes(item.kind)
              )
                return (
                  <div
                    className="sc-s-18 fit-container fx-scattered box-pad-h-s box-pad-v-s"
                    style={{ position: "relative" }}
                    key={item.id}
                  >
                    {[30004].includes(item.kind) && (
                      <div
                        style={{
                          position: "absolute",
                          padding: "0 1rem",
                          left: "-2rem",
                          top: "50%",
                          transform: "translateY(-50%) rotate(-90deg)",
                          transformOrigin: "center",
                          backgroundColor: "var(--green-main)",
                          color: "white",
                          borderRadius: "var(--border-r-18)",
                        }}
                      >
                        <p className="p-small">{t("Ac6UnVb")}</p>
                      </div>
                    )}
                    {[30005].includes(item.kind) && (
                      <div
                        style={{
                          position: "absolute",
                          padding: "0 1rem",
                          left: "-2rem",
                          top: "50%",
                          transform: "translateY(-50%) rotate(-90deg)",
                          transformOrigin: "center",
                          backgroundColor: "var(--orange-main)",
                          color: "white",
                          borderRadius: "var(--border-r-18)",
                        }}
                      >
                        <p className="p-small">{t("Ac6UnVb")}</p>
                      </div>
                    )}
                    {[34235, 21, 22].includes(item.kind) && (
                      <div
                        style={{
                          position: "absolute",
                          padding: "0 1rem",
                          left: "-1.65rem",
                          top: "50%",
                          transform: "translateY(-50%) rotate(-90deg)",
                          transformOrigin: "center",
                          backgroundColor: "var(--blue-main)",
                          color: "white",
                          borderRadius: "var(--border-r-18)",
                        }}
                      >
                        <p className="p-small">{t("AVdmifm")}</p>
                      </div>
                    )}
                    <div
                      className={`fx-centered ${
                        [30004, 30005, 34235].includes(item.kind) &&
                        "box-pad-h-m"
                      }`}
                    >
                      <div
                        className="bg-img cover-bg sc-s-18"
                        style={{
                          aspectRatio: "1 / 1",
                          minWidth: "64px",
                          backgroundImage: `url(${content.image})`,
                          backgroundColor: "var(--dim-gray)",
                        }}
                      ></div>
                      <div>
                        <p className="p-one-line">{content.title}</p>
                        <p className="p-medium gray-c">
                          {t("A65LO6w", {
                            date: timeAgo(new Date(item.created_at * 1000)),
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="box-pad-h-s fx-centered">
                      <Link
                        target={"_blank"}
                        href={
                          (item.kind === 30023 && `/article/${naddr}`) ||
                          ([30005, 30004].includes(item.kind) &&
                            `/curation/${naddr}`) ||
                          ([34235, 21, 22].includes(item.kind) &&
                            `/video/${naddr}`)
                        }
                      >
                        <div className="share-icon-24"></div>
                      </Link>
                      <BookmarkEvent
                        pubkey={item.pubkey}
                        kind={item.kind}
                        d={content.d}
                        image={content.image}
                      />
                    </div>
                  </div>
                );
              if (
                (!postKind && item.kind === 1) ||
                (postKind && postKind === 1 && item.kind === 1)
              )
                return (
                  <div
                    className="sc-s-18 fit-container fx-scattered box-pad-h-s box-pad-v-s"
                    style={{ position: "relative" }}
                    key={item.id}
                  >
                    <div
                      style={{
                        position: "absolute",
                        padding: "0 1rem",
                        left: "-2.5rem",
                        top: "50%",
                        transform: "translateY(-50%) rotate(-90deg)",
                        transformOrigin: "center",
                        backgroundColor: "var(--black)",
                        color: "var(--white)",
                        borderRadius: "var(--border-r-18)",
                      }}
                    >
                      <p className="p-small">{t("AV5f3lP")}</p>
                    </div>
                    <div className="fx-centered box-pad-h-m">
                      <div
                        className="sc-s-18 fx-centered"
                        style={{
                          aspectRatio: "1 / 1",
                          minWidth: "64px",
                        }}
                      >
                        <div className="news-24"></div>
                      </div>
                      <div>
                        <p className="p-one-line">
                          {item.content.substring(0, 100)}
                        </p>
                        <p className="p-medium gray-c">
                          {t("A1jhS42", {
                            date: convertDate(new Date(item.created_at * 1000)),
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="box-pad-h-s fx-centered">
                      <Link target={"_blank"} href={`/flash-news/${nEvent}`}>
                        <div className="share-icon-24"></div>
                      </Link>
                      <BookmarkEvent
                        pubkey={item.id}
                        kind={item.kind}
                        itemType="e"
                      />
                    </div>
                  </div>
                );

              if (
                (!postKind && item.kind === 111) ||
                (postKind && postKind === 111 && item.kind === 111)
              )
                return (
                  <div
                    className="sc-s-18 fit-container fx-scattered box-pad-h-s box-pad-v-s"
                    style={{ position: "relative" }}
                    key={item.id}
                  >
                    <div
                      style={{
                        position: "absolute",
                        padding: "0 1rem",
                        left: "-1.4rem",
                        top: "50%",
                        transform: "translateY(-50%) rotate(-90deg)",
                        transformOrigin: "center",
                        backgroundColor: "var(--blue-main)",
                        color: "white",
                        borderRadius: "var(--border-r-18)",
                      }}
                    >
                      <p className="p-small">{t("Az5ftet")}</p>
                    </div>
                    <div className="fx-centered box-pad-h-m">
                      <div
                        className="bg-img cover-bg sc-s-18"
                        style={{
                          aspectRatio: "1 / 1",
                          minWidth: "64px",
                          backgroundImage: `url(${content.image})`,
                          backgroundColor: "var(--dim-gray)",
                        }}
                      ></div>
                      <div>
                        <p className="p-one-line">
                          {item.content.substring(0, 100)}
                        </p>
                        <p className="p-medium gray-c">
                          {t("A1jhS42", {
                            date: convertDate(new Date(item.created_at * 1000)),
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="box-pad-h-s fx-centered">
                      <Link target={"_blank"} href={`/note/${nEvent}`}>
                        <div className="share-icon-24"></div>
                      </Link>
                      <BookmarkEvent pubkey={item.id} kind={1} itemType="e" />
                    </div>
                  </div>
                );
              if (item.kind === postKind)
                return (
                  <div
                    className="sc-s-18 fit-container fx-scattered box-pad-h-s box-pad-v-s"
                    style={{ position: "relative" }}
                    key={item.id}
                  >
                    {[30004].includes(item.kind) && (
                      <div
                        style={{
                          position: "absolute",
                          padding: "0 1rem",
                          left: "-2rem",
                          top: "50%",
                          transform: "translateY(-50%) rotate(-90deg)",
                          transformOrigin: "center",
                          backgroundColor: "var(--c1)",
                          color: "var(--white)",
                          borderRadius: "var(--border-r-18)",
                        }}
                      >
                        <p className="p-small">{t("Ac6UnVb")}</p>
                      </div>
                    )}
                    <div
                      className={`fx-centered ${
                        [30004].includes(item.kind) && "box-pad-h-m"
                      }`}
                    >
                      <div
                        className="bg-img cover-bg sc-s-18"
                        style={{
                          aspectRatio: "1 / 1",
                          minWidth: "64px",
                          backgroundImage: `url(${content.image})`,
                          backgroundColor: "var(--dim-gray)",
                        }}
                      ></div>
                      <div>
                        <p className="p-one-line">{content.title}</p>
                        <p className="p-medium gray-c">
                          {t("A1jhS42", {
                            date: convertDate(new Date(item.created_at * 1000)),
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="box-pad-h-s fx-centered">
                      <Link
                        target={"_blank"}
                        href={
                          item.kind === 30023
                            ? `/article/${naddr}`
                            : `/curation/${naddr}`
                        }
                      >
                        <div className="share-icon-24"></div>
                      </Link>
                      <BookmarkEvent
                        pubkey={item.pubkey}
                        kind={item.kind}
                        d={content.d}
                        image={content.image}
                      />
                    </div>
                  </div>
                );
            })}
          </div>
        )}
        {content.length === 0 && !isLoading && (
          <div
            className="fx-centered fx-col fit-container"
            style={{ height: "30vh" }}
          >
            <h4>{t("AklxVKp")}</h4>
            <p className="gray-c p-centered" style={{ maxWidth: "350px" }}>
              {t("AwtoZdf")}
            </p>
          </div>
        )}
        {isLoading && (
          <div className="fx-centered fit-container" style={{ height: "30vh" }}>
            <LoadingLogo />
          </div>
        )}
      </div>
    </div>
  );
};

const ManageInterest = ({ exit }) => {
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const userInterestList = useSelector((state) => state.userInterestList);
  const { t } = useTranslation();
  const [interests, setInterest] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const oldState = useMemo(() => {
    return getInterestList(userInterestList);
  }, [userInterestList]);
  const isChanged = useMemo(() => {
    return JSON.stringify(interests) !== JSON.stringify(oldState);
  }, [interests, oldState]);

  useEffect(() => {
    let tempList = getInterestList(userInterestList);
    setInterest(tempList);
    setIsLoading(false);
  }, [userInterestList]);

  const handleItemInList = (action, index) => {
    let tempArray = structuredClone(interests);
    if (action) {
      tempArray[index].toDelete = false;
      setInterest(tempArray);
    } else {
      tempArray[index].toDelete = true;
      setInterest(tempArray);
    }
  };

  const saveInterestList = async () => {
    try {
      if (isLoading || !isChanged) return;
      setIsLoading(true);
      let tags = interests
        .filter((_) => !_.toDelete)
        .map((_) => ["t", _.item.toLowerCase()]);

      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 10015,
          content: "",
          tags: tags,
          allRelays: [],
        })
      );
      return true;
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      return false;
    }
  };

  const addItemToList = (item) => {
    let tempArray = getInterestList([
      item.toLowerCase(),
      ...new Set([...interests.map((_) => _.item)]),
    ]);
    setInterest(tempArray);
    if (newInterest) setNewInterest("");
  };

  const handleItemsFromSuggestion = (item, isAdded) => {
    if (isAdded) {
      let index = interests.findIndex((_) => _.item === item.toLowerCase());
      let tempArray = structuredClone(interests);
      tempArray.splice(index, 1);
      setInterest(tempArray);
    } else {
      addItemToList(item);
    }
  };

  return (
    <div className="fx-centered fit-container fx-col ">
      <div className="fit-container fx-scattered box-marg-s box-pad-h ">
        <div className="fx-centered fx-start-h pointer" onClick={exit}>
          <div className="round-icon">
            <div className="arrow" style={{ transform: "rotate(90deg)" }}></div>
          </div>
          <p>{t("ARsUd9r")}</p>
        </div>
        <button
          className={`btn ${isChanged ? "btn-normal" : "btn-disabled"}`}
          onClick={saveInterestList}
        >
          {isLoading ? <LoadingDots /> : t("A29aBCD")}
        </button>
      </div>
      <div className="fit-container fx-centered fx-col box-pad-h">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newInterest) addItemToList(newInterest);
          }}
          className="if fit-container fx-scattered"
        >
          <div className="search-24"></div>
          <input
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            type="text"
            placeholder={t("AFwnnZA")}
            className="if ifs-full if-no-border"
            style={{ padding: 0 }}
          />
          {newInterest && <p className="gray-c slide-down">&#8626;</p>}
        </form>
        <DraggableComp
          children={interests.map((_) => ({ ..._, id: _?.item }))}
          setNewOrderedList={setInterest}
          component={InterestItem}
          props={{
            handleItemInList,
          }}
          background={false}
        />
      </div>
      <InterestSuggestionsCards
        list={interests.map((_) => _.item)}
        addItemToList={handleItemsFromSuggestion}
      />
    </div>
  );
};

const InterestItem = ({ item, handleItemInList, index }) => {
  return (
    <div className="fx-scattered  sc-s-18 bg-sp box-pad-h-m box-pad-v-s fit-container">
      <div className="fx-centered">
        <div
          style={{
            minWidth: `38px`,
            aspectRatio: "1/1",
            position: "relative",
          }}
          className="sc-s-18 fx-centered"
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 2,
              backgroundImage: `url(${item.icon})`,
            }}
            className="bg-img cover-bg  fit-container fit-height"
          ></div>
          <p
            className={"p-bold p-caps p-big"}
            style={{ position: "relative", zIndex: 1 }}
          >
            {item.item.charAt(0)}
          </p>
        </div>
        <p className="p-caps">{item.item}</p>
      </div>
      <div className="fx-centered">
        {!item.toDelete && (
          <div
            onClick={() => handleItemInList(false, index)}
            className="round-icon-small"
          >
            <div className="trash"></div>
          </div>
        )}
        {item.toDelete && (
          <div
            onClick={() => handleItemInList(true, index)}
            className="round-icon-small"
          >
            <div className="undo"></div>
          </div>
        )}
        <div
          className="drag-el"
          style={{
            minWidth: "16px",
            aspectRatio: "1/1",
          }}
        ></div>
      </div>
    </div>
  );
};
