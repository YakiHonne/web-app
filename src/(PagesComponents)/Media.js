import ArrowUp from "@/Components/ArrowUp";
import ContentSourceAndFilter from "@/Components/ContentSourceAndFilter";
import LoadingLogo from "@/Components/LoadingLogo";
import MediaMasonryList from "@/Components/MediaMasonryList";
import { getDefaultFilter, getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { filterContent, getParsedMedia, getParsedRepEvent } from "@/Helpers/Encryptions";
import { straightUp } from "@/Helpers/Helpers";
import { getNDKInstance } from "@/Helpers/utils/ndkInstancesCache";
import React, { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const getContentFromValue = (contentSource) => {
  if (contentSource.group === "cf") return contentSource.value;
  if (contentSource.group === "mf") return "dvms";
  if (["af", "rsf"].includes(contentSource.group)) return "algo";
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
      let tempArr =  [...notes, ...action.note];
      let sortedNotes = tempArr
        .filter((note, index, tempArr) => {
          if (tempArr.findIndex((_) => _.id === note.id) === index) return note;
        })
        .sort((note_1, note_2) => note_2.created_at - note_1.created_at);
      return sortedNotes;
    }
  }
};

export default function Media() {
  const [selectedFilter, setSelectedFilter] = useState(getDefaultFilter(3));
  const [selectedCategory, setSelectedCategory] = useState(false);
  return (
    <div style={{ overflow: "auto" }}>
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
              type={3}
            />
            <div style={{ height: "75px" }} className="fit-container"></div>
            <div className="main-middle">
              <HomeFeed
                selectedCategory={selectedCategory}
                selectedFilter={selectedFilter}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const HomeFeed = ({ selectedCategory, selectedFilter }) => {
  const { t } = useTranslation();
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
    let since = selectedFilter.from || twoDaysPrior;

    let tempUserFollowings = Array.isArray(userFollowings)
      ? Array.from(userFollowings)
      : [];
    if (["recent"].includes(notesContentFrom)) {
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
      filter = [
        {
          authors,
          kinds: [34235, 34236, 20, 21, 22],
          until,
          since,
          limit: 100,
        },
      ];
      return {
        filter,
      };
    }

    return {
      filter: [
        {
          kinds: [34235, 34236, 20, 21, 22],
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
          : selectedCategory.group === "rsf"
          ? await getNDKInstance(
              selectedCategory.value,
              selectedCategory.relays,
              true
            )
          : undefined;
      if (ndk === false) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      let algoRelay = [];
      if (selectedCategory.group === "af")
        algoRelay.push(selectedCategory.value);
      if (selectedCategory.group === "rsf") algoRelay = selectedCategory.relays;
      const data = await getSubData(filter, 250, algoRelay, ndk);
      setSubfilter({ filter, relays: algoRelay, ndk });
      events = data.data
        .splice(0, 200)
        .map((event) => {
          eventsPubkeys.push(event.pubkey);
          let event_ = getParsedMedia(event, true);
          return event_
        })
        .filter((_) => _);

      let tempEvents =
        events.length > 0 ? Array.from(events) : Array.from(fallBackEvents);
      tempEvents = filterContent(selectedFilter, tempEvents);
      dispatchNotes({ type: notesContentFrom, note: tempEvents });
      saveUsers(eventsPubkeys);
      if (tempEvents.length === 0) setIsLoading(false);
    };

    if (
      notesContentFrom &&
      ["cf", "af", "rsf"].includes(selectedCategory?.group)
    ) {
      if (
        (["recent"].includes(notesContentFrom) &&
          isUserFollowingsLoaded) ||
        !["recent"].includes(notesContentFrom)
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

  return (
    <>
      {["recent"].includes(notesContentFrom) &&
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

      {notesContentFrom && notes.length > 0 && (
        <MediaMasonryList
          events={notes}
          setLastEventTime={setNotesLastEventTime}
        />
      )}
      {isLoading && (
        <div
          className="fit-container box-pad-v fx-centered fx-col"
          style={{ height: "60vh" }}
        >
          <LoadingLogo size={64} />
        </div>
      )}
    </>
  );
};
