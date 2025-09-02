import React, {
  useEffect,
  useRef,
  useState,
  useReducer,
  Fragment,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterContent, removeEventsDuplicants } from "@/Helpers/Encryptions";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import ArrowUp from "@/Components/ArrowUp";
import YakiIntro from "@/Components/YakiIntro";
import KindSix from "@/Components/KindSix";
import { saveUsers } from "@/Helpers/DB";
import { getDefaultFilter, InitEvent } from "@/Helpers/Controlers";
import { straightUp } from "@/Helpers/Helpers";
import LoadingLogo from "@/Components/LoadingLogo";
import KindOne from "@/Components/KindOne";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";
import NDK, {
  NDKPrivateKeySigner,
  NDKRelayAuthPolicies,
} from "@nostr-dev-kit/ndk";
import { setToPublish } from "@/Store/Slides/Publishers";
import { useRouter } from "next/router";
import InfiniteScroll from "@/Components/InfiniteScroll";
const SUGGESTED_TAGS_VALUE = "_sggtedtags_";

const notesReducer = (notes, action) => {
  switch (action.type) {
    case "widgets": {
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
    case "paid": {
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
    case "global": {
      let nextState = { ...notes };
      let tempArr = [...nextState[action.type], ...action.note];
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
      nextState[action.type] = sortedNotes;
      return nextState;
    }
    case "recent": {
      let nextState = { ...notes };
      let tempArr = [...nextState[action.type], ...action.note];
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
      nextState[action.type] = sortedNotes;
      return nextState;
    }
    case "recent_with_replies": {
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
    case "dvms": {
      let nextState = { ...notes };
      let tempArr = [...nextState["dvms"], ...action.note];
      let sortedNotes = tempArr
        .filter((note, index, tempArr) => {
          if (tempArr.findIndex((_) => _.id === note.id) === index) return note;
        })
        .sort((note_1, note_2) => note_2.created_at - note_1.created_at);
      nextState["dvms"] = sortedNotes;
      return nextState;
    }
    case "algo": {
      let nextState = { ...notes };
      let tempArr = [...nextState["algo"], ...action.note];
      let sortedNotes = tempArr
        .filter((note, index, tempArr) => {
          if (tempArr.findIndex((_) => _.id === note.id) === index) return note;
        })
        .sort((note_1, note_2) => note_2.created_at - note_1.created_at);
      nextState["algo"] = sortedNotes;
      return nextState;
    }

    case "empty-recent": {
      let nextState = { ...notes };
      nextState["recent"] = [];
      return nextState;
    }
    case "remove-events": {
      return notesInitialState;
    }
    default: {
      console.log("wrong action type");
    }
  }
};

const notesInitialState = {
  global: [],
};

export default function NoteSharedRelay() {
  const dispatch = useDispatch();
  const router = useRouter();
  const userKeys = useSelector((state) => state.userKeys);
  const userAppSettings = useSelector((state) => state.userAppSettings);
  const [selectedFilter, setSelectedFilter] = useState(getDefaultFilter(2));
  const [selectedCategory, setSelectedCategory] = useState(false);
  const extrasRef = useRef(null);
  const relay = router.query.r;
  const relaysList = useMemo(() => {
    if (userAppSettings) {
      return (
        userAppSettings?.settings?.content_sources?.notes?.relays?.list?.map(
          (_) => _[0]
        ) || []
      );
    }
    return [];
  }, [userAppSettings]);

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

  const handleUpdateSettings = async () => {
    try {
      let optionsToSave = {
        ...userAppSettings?.settings,
        content_sources: {
          ...userAppSettings?.settings?.content_sources,
          notes: {
            ...userAppSettings?.settings?.content_sources?.notes,
            relays: {
              index:
                userAppSettings?.settings?.content_sources?.notes?.relays
                  ?.index || 0,
              list: [
                ...(userAppSettings?.settings?.content_sources?.notes?.relays
                  ?.list || []),
                [relay, true],
              ],
            },
          },
        },
      };
      const event = {
        kind: 30078,
        content: JSON.stringify(optionsToSave),
        tags: [
          [
            "client",
            "Yakihonne",
            "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
          ],
          ["d", "YakihonneAppSettings"],
        ],
      };

      let eventInitEx = await InitEvent(
        event.kind,
        event.content,
        event.tags,
        undefined
      );
      if (!eventInitEx) {
        return;
      }
      dispatch(
        setToPublish({
          eventInitEx,
          allRelays: [],
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

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
                    className="fit-container sticky fx-centered box-pad-h "
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--very-dim-gray)",
                    }}
                  >
                    <div className="main-middle fx-scattered">
                      <h4>{relay}</h4>
                      {userKeys && !relaysList.includes(relay) && (
                        <button
                          className="fx-centered btn btn-normal btn-small"
                          onClick={handleUpdateSettings}
                        >
                          <div className="plus-sign"></div>Add to my list
                        </button>
                      )}
                      {userKeys && relaysList.includes(relay) && (
                        <div
                          className="fx-centered btn btn-gst btn-small"
                          style={{ pointerEvents: "none" }}
                        >
                          On my list
                          <div className="check-24" style={{ margin: 0 }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="main-middle">
                    {selectedCategory !== SUGGESTED_TAGS_VALUE && (
                      <HomeFeed
                        selectedCategory={selectedCategory}
                        selectedFilter={selectedFilter}
                        relay={relay}
                      />
                    )}
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
                  <h4>Invalid URL</h4>
                  <p
                    className="p-centered gray-c"
                    style={{ maxWidth: "330px" }}
                  >
                    It looks like the shared relay URL is broken or does not
                    exist
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

const HomeFeed = ({ relay, selectedCategory, selectedFilter }) => {
  const userMutedList = useSelector((state) => state.userMutedList);
  const [notes, dispatchNotes] = useReducer(notesReducer, notesInitialState);
  const [isLoading, setIsLoading] = useState(true);
  const [notesLastEventTime, setNotesLastEventTime] = useState(undefined);
  const [rerenderTimestamp, setRerenderTimestamp] = useState(undefined);
  const [ndkInstance, setNDKInstance] = useState(false);

  useEffect(() => {
    straightUp();
    dispatchNotes({ type: "remove-events" });
    setNotesLastEventTime(undefined);
    if (notesLastEventTime === undefined) setRerenderTimestamp(Date.now());
  }, []);

  useEffect(() => {
    const contentFromRelays = async () => {
      setIsLoading(true);
      let eventsPubkeys = [];
      let events = [];
      let fallBackEvents = [];

      let subscription = ndkInstance.subscribe(
        [{ kinds: [1], limit: 100, until: notesLastEventTime }],
        {
          groupable: false,
          skipValidation: true,
          skipVerification: true,
          cacheUsage: "CACHE_FIRST",
          subId: "home-feed",
          relayUrls: [relay],
        }
      );

      subscription.on("event", (event) => {
        eventsPubkeys.push(event.pubkey);
        let event_ = getParsedNote(event, true);
        if (event_) fallBackEvents.push(event_);
        if (event_) {
          if (event.kind === 6) {
            eventsPubkeys.push(event_.relatedEvent.pubkey);
          }
          events.push(event_);
        }
      });

      subscription.on("close", () => {
        let tempEvents =
          events.length > 0 ? Array.from(events) : Array.from(fallBackEvents);
        tempEvents = filterContent(
          selectedFilter,
          removeEventsDuplicants(tempEvents)
        );

        dispatchNotes({ type: "global", note: tempEvents });
        saveUsers(eventsPubkeys);
        if (tempEvents.length === 0) setIsLoading(false);
      });

      let timer = setTimeout(() => {
        subscription.stop();
        clearTimeout(timer);
      }, 1000);
    };

    if (ndkInstance) contentFromRelays();
  }, [notesLastEventTime, rerenderTimestamp, ndkInstance]);

  useEffect(() => {
    const initNDK = async () => {
      const ndkInstance_ = new NDK({
        explicitRelayUrls: [relay],
        enableOutboxModel: true,
      });

      const signer = new NDKPrivateKeySigner(
        process.env.NEXT_PUBLIC_DVM_COMMUNICATOR_SEC
      );
      ndkInstance_.signer = signer;

      await ndkInstance_.connect();
      ndkInstance_.relayAuthDefaultPolicy = NDKRelayAuthPolicies.signIn({
        ndk: ndkInstance_,
      });
      setNDKInstance(ndkInstance_);
    };
    if (relay) initNDK();
  }, [relay]);

  console.log(notesLastEventTime);

  return (
    <div className="fx-centered  fx-wrap fit-container" style={{ gap: 0 }}>
      {["recent", "recent_with_replies"].includes("global") &&
        notes["global"]?.length > 0 && (
          <div className="fit-container box-pad-h">
            <hr />
            <div className="fit-container fx-centered fx-start-h fx-start-v box-pad-h box-pad-v-m">
              <div>
                <div className="eye-opened-24"></div>
              </div>
              <div>
                <p>View as</p>
                <p className="gray-c">
                  Your current feed is based on someone else's following list,
                  start following people to tailor your feed on your preference
                </p>
              </div>
            </div>
            <hr />
            <hr />
          </div>
        )}
      {!selectedFilter.default &&
        notes["global"]?.length === 0 &&
        !isLoading && (
          <div
            className="fit-container fx-centered fx-col"
            style={{ height: "40vh" }}
          >
            <div
              className="yaki-logomark"
              style={{ minWidth: "48px", minHeight: "48px", opacity: 0.5 }}
            ></div>
            <h4>No results</h4>
            <p className="p-centered gray-c" style={{ maxWidth: "330px" }}>
              It looks like you're applying a custom filter, please adjust the
              parameters and dates to acquire more data
            </p>
          </div>
        )}
      {selectedFilter.default &&
        notes["global"]?.length === 0 &&
        !isLoading && (
          <div
            className="fit-container fx-centered fx-col"
            style={{ height: "40vh" }}
          >
            <div
              className="yaki-logomark"
              style={{ minWidth: "48px", minHeight: "48px", opacity: 0.5 }}
            ></div>
            <h4>No results</h4>
            <p className="p-centered gray-c" style={{ maxWidth: "330px" }}>
              Nothing was found in this relay
            </p>
          </div>
        )}
      <InfiniteScroll
        events={notes["global"]}
        onRefresh={setNotesLastEventTime}
      >
        {"global" &&
          notes["global"].map((note, index) => {
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
