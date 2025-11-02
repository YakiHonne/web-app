import React, {
  useEffect,
  useState,
  useReducer,
  Fragment,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import { filterContent, getBackupWOTList } from "@/Helpers/Encryptions";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import ArrowUp from "@/Components/ArrowUp";
import YakiIntro from "@/Components/YakiIntro";
import KindSix from "@/Components/KindSix";
import { saveUsers } from "@/Helpers/DB";
import { getDefaultFilter, getSubData } from "@/Helpers/Controlers";
import HomeCarouselContentSuggestions from "@/Components/HomeCarouselContentSuggestions";
import InterestSuggestionsCards from "@/Components/SuggestionsCards/InterestSuggestionsCards";
import { straightUp } from "@/Helpers/Helpers";
import LoadingLogo from "@/Components/LoadingLogo";
import KindOne from "@/Components/KindOne";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";
import { getKeys } from "@/Helpers/ClientHelpers";
import InfiniteScroll from "@/Components/InfiniteScroll";
import SuggestionsCards from "@/Components/SuggestionsCards/SuggestionsCards";
import ContentSourceAndFilter from "@/Components/ContentSourceAndFilter";
import RecentPosts from "@/Components/RecentPosts";
import { getNDKInstance } from "@/Helpers/utils";
import PostNotePortal from "@/Components/PostNotePortal";

const SUGGESTED_TAGS_VALUE = "_sggtedtags_";

const getContentFromValue = (contentSource) => {
  if (contentSource.group === "cf") return contentSource.value;
  if (contentSource.group === "mf") return "dvms";
  if (contentSource.group === "af") return "algo";
};

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
        .sort((note_1, note_2) => note_2.created_at - note_1.created_at)
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
        });

      return sortedNotes;
    }
  }
};

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState(getDefaultFilter(2));
  const [selectedCategory, setSelectedCategory] = useState(false);

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
              <ContentSourceAndFilter
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                type={2}
              />
              <div style={{ height: "75px" }} className="fit-container"></div>
              <HomeCarouselContentSuggestions />
              <div className="main-middle">
                <PostNotePortal
                  protectedRelay={
                    selectedCategory.group === "af"
                      ? selectedCategory.value
                      : false
                  }
                />
                {selectedCategory !== SUGGESTED_TAGS_VALUE && (
                  <HomeFeed
                    selectedCategory={selectedCategory}
                    selectedFilter={selectedFilter}
                  />
                )}
                {selectedCategory === SUGGESTED_TAGS_VALUE && (
                  <InterestSuggestionsCards
                    list={[]}
                    update={true}
                    addItemToList={() => null}
                    expand={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
const HomeFeed = ({ selectedCategory, selectedFilter }) => {
  const { t } = useTranslation();
  const userMutedList = useSelector((state) => state.userMutedList);
  const isUserFollowingsLoaded = useSelector(
    (state) => state.isUserFollowingsLoaded
  );
  const userFollowings = useSelector((state) => state.userFollowings);
  const userKeys = useSelector((state) => state.userKeys);
  const [notes, dispatchNotes] = useReducer(notesReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [notesContentFrom, setNotesContentFrom] = useState(
    getContentFromValue(selectedCategory)
  );
  const [selectedCategoryValue, setSelectedCategoryValue] = useState(
    selectedCategory.value
  );
  const [notesLastEventTime, setNotesLastEventTime] = useState(undefined);
  const [rerenderTimestamp, setRerenderTimestamp] = useState(undefined);
  const [subFilter, setSubfilter] = useState({ filter: [], relays: [] });
  const since = useMemo(
    () => (notes.length > 0 ? notes[0].created_at + 1 : undefined),
    [notes]
  );
  useEffect(() => {
    let contentFromValue = getContentFromValue(selectedCategory);
    if (selectedCategoryValue !== selectedCategory.value) {
      straightUp();
      dispatchNotes({ type: "remove-events" });
      setNotesContentFrom(contentFromValue);
      setSelectedCategoryValue(selectedCategory.value);
      setNotesLastEventTime(undefined);
    }
  }, [selectedCategory]);
  
  useEffect(() => {
    straightUp();
    dispatchNotes({ type: "remove-events" });
    setNotesLastEventTime(undefined);
  }, [selectedFilter]);

  useEffect(() => {
    straightUp();
    dispatchNotes({ type: "remove-events" });
    setNotesLastEventTime(undefined);
    if (notesLastEventTime === undefined) setRerenderTimestamp(Date.now());
  }, [userKeys]);

  const getNotesFilter = async () => {
    let filter;
    let until =
      selectedFilter.to && notesLastEventTime
        ? Math.min(selectedFilter.to, notesLastEventTime)
        : selectedFilter.to
        ? selectedFilter.to
        : notesLastEventTime;
    let towDaysPeriod = (2 * 24 * 60 * 60 * 1000) / 1000;
    let twoDaysPrior = Math.floor(
      (Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000
    );
    twoDaysPrior = notesLastEventTime
      ? notesLastEventTime - towDaysPeriod
      : notesLastEventTime;
    let since =
      selectedFilter.from ||
      (["paid", "widgets"].includes(notesContentFrom)
        ? undefined
        : twoDaysPrior);

    let tempUserFollowings = Array.isArray(userFollowings)
      ? Array.from(userFollowings)
      : [];
    if (["recent", "recent_with_replies"].includes(notesContentFrom)) {
      if (tempUserFollowings.length === 0) {
        let userKeys = getKeys();
        if (userKeys) {
          tempUserFollowings =
            userFollowings?.length > 0
              ? [userKeys.pub, ...Array.from(userFollowings)]
              : [userKeys.pub, process.env.NEXT_PUBLIC_YAKI_PUBKEY];
        } else {
          tempUserFollowings = [process.env.NEXT_PUBLIC_YAKI_PUBKEY];
        }
      }

      let authors =
        selectedFilter.posted_by?.length > 0
          ? selectedFilter.posted_by
          : tempUserFollowings.length < 5
          ? [...tempUserFollowings, ...getBackupWOTList()]
          : tempUserFollowings;
      filter = [{ authors, kinds: [1, 6], until, since, limit: 100 }];
      return {
        filter,
      };
    }
    if (notesContentFrom === "widgets") {
      filter = [
        {
          kinds: [1],
          "#l": ["smart-widget"],
          limit: 100,
          authors:
            selectedFilter.posted_by?.length > 0
              ? selectedFilter.posted_by
              : undefined,
          until,
          since,
        },
      ];
      return {
        filter,
      };
    }
    if (notesContentFrom === "paid") {
      filter = [
        {
          kinds: [1],
          "#l": ["FLASH NEWS"],
          limit: 100,
          authors:
            selectedFilter.posted_by?.length > 0
              ? selectedFilter.posted_by
              : undefined,
          until,
          since,
        },
      ];
      return {
        filter,
      };
    }

    return {
      filter: [
        {
          kinds: [1, 6],
          limit: 100,
          authors:
            selectedFilter.posted_by?.length > 0
              ? selectedFilter.posted_by
              : undefined,
          until,
          since,
        },
      ],
    };
  };

  useEffect(() => {
    const contentFromRelays = async () => {
      setIsLoading(true);
      setIsConnected(true);
      let eventsPubkeys = [];
      let events = [];
      let fallBackEvents = [];
      let { filter } = await getNotesFilter();
      let ndk =
        selectedCategory.group === "af"
          ? await getNDKInstance(selectedCategory.value)
          : undefined;
      if (ndk === false) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      const algoRelay =
        selectedCategory.group === "af" ? [selectedCategory.value] : [];
      const data = await getSubData(filter, 50, algoRelay, ndk);
      setSubfilter({ filter, relays: algoRelay, ndk });
      events = data.data
        .splice(0, 200)
        .map((event) => {
          eventsPubkeys.push(event.pubkey);
          let event_ = getParsedNote(event, true);
          if (event_) fallBackEvents.push(event_);
          if (event_) {
            if (
              notesContentFrom !== "recent_with_replies" &&
              algoRelay.length === 0
            ) {
              if (!event_.isComment) {
                if (event.kind === 6) {
                  eventsPubkeys.push(event_.relatedEvent.pubkey);
                }
                return event_;
              }
            } else {
              if (event.kind === 6) {
                eventsPubkeys.push(event_.relatedEvent.pubkey);
              }
              return event_;
            }
          }
        })
        .filter((_) => _);

      let tempEvents =
        events.length > 0 ? Array.from(events) : Array.from(fallBackEvents);
      tempEvents = filterContent(selectedFilter, tempEvents);
      dispatchNotes({ type: notesContentFrom, note: tempEvents });
      saveUsers(eventsPubkeys);
      if (tempEvents.length === 0) setIsLoading(false);
    };

    if (notesContentFrom && ["cf", "af"].includes(selectedCategory?.group)) {
      if (
        (["recent", "recent_with_replies"].includes(notesContentFrom) &&
          isUserFollowingsLoaded) ||
        !["recent", "recent_with_replies"].includes(notesContentFrom)
      )
        contentFromRelays();
    }
  }, [
    notesLastEventTime,
    selectedCategoryValue,
    rerenderTimestamp,
    selectedFilter,
    isUserFollowingsLoaded,
  ]);

  const handleRecentPostsClick = (notes) => {
    dispatchNotes({ type: notesContentFrom, note: notes });
    straightUp(undefined, "smooth");
  };
  return (
    <InfiniteScroll onRefresh={setNotesLastEventTime} events={notes}>
      {!["mf"].includes(selectedCategory?.group) && (
        <RecentPosts
          filter={subFilter}
          contentFrom={notesContentFrom}
          selectedFilter={selectedFilter}
          since={since}
          onClick={handleRecentPostsClick}
        />
      )}
      {["recent", "recent_with_replies"].includes(notesContentFrom) &&
        userFollowings &&
        userFollowings?.length < 5 &&
        isUserFollowingsLoaded &&
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
      {!selectedFilter.default &&
        notes?.length === 0 &&
        !isLoading &&
        isConnected && (
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
              {t("AgEkYer")}
            </p>
          </div>
        )}
      {selectedFilter.default &&
        notes?.length === 0 &&
        !isLoading &&
        isConnected && (
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
              {t("ASpI7pT")}
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
      {notesContentFrom &&
        notes.map((note, index) => {
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
                  <SuggestionsCards index={index} />
                </Fragment>
              );
            if (note.kind !== 6)
              return (
                <Fragment key={note.id}>
                  <KindOne event={note} border={true} />
                  <SuggestionsCards index={index} />
                </Fragment>
              );
          }
        })}

      <div className="box-marg-full"></div>
      {isLoading && (
        <div
          className="fit-container box-pad-v fx-centered fx-col"
          style={{ height: "60vh" }}
        >
          <LoadingLogo size={64} />
        </div>
      )}
    </InfiniteScroll>
  );
};
