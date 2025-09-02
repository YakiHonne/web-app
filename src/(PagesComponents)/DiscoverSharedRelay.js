import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import ArrowUp from "@/Components/ArrowUp";
import { SelectTabs } from "@/Components/SelectTabs";
import { useDispatch, useSelector } from "react-redux";
import {
  filterContent,
  getParsedRepEvent,
  removeEventsDuplicants,
  sortEvents,
} from "@/Helpers/Encryptions";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import { saveUsers } from "@/Helpers/DB";
import { getDefaultFilter, getSubData, InitEvent } from "@/Helpers/Controlers";
import LoadingLogo from "@/Components/LoadingLogo";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";
import { setToPublish } from "@/Store/Slides/Publishers";
import NDK, {
  NDKPrivateKeySigner,
  NDKRelayAuthPolicies,
} from "@nostr-dev-kit/ndk";
import { useRouter } from "next/router";

const MixEvents = (articles, curations, videos) => {
  const interleavedArray = [];

  const length = Math.max(articles.length, curations.length, videos.length);

  for (let i = 0; i < length; i++) {
    if (i < articles.length) {
      interleavedArray.push(articles[i]);
    }
    if (i < curations.length) {
      interleavedArray.push(curations[i]);
    }
    if (i < videos.length) {
      interleavedArray.push(videos[i]);
    }
  }
  return interleavedArray;
};

export default function DiscoverSharedRelay() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(getDefaultFilter());
  const [selectedCategory, setSelectedCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userKeys = useSelector((state) => state.userKeys);
  const userAppSettings = useSelector((state) => state.userAppSettings);
  const extrasRef = useRef(null);
  const tabs = [t("AR9ctVs"), t("AesMg52"), t("AVysZ1s"), t("AStkKfQ")];
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
          mixed_content: {
            ...userAppSettings?.settings?.content_sources?.mixed_content,
            relays: {
              index:
                userAppSettings?.settings?.content_sources?.mixed_content
                  ?.relays?.index || 0,
              list: [
                ...(userAppSettings?.settings?.content_sources?.mixed_content
                  ?.relays?.list || []),
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
    <div>
      <ArrowUp />
      <div
        className="fit-container fx-centered fx-start-h fx-start-v"
        style={{ gap: 0 }}
      >
        {relay && (
          <div
            className={`fit-container fx-centered fx-start-v fx-wrap  fit-container mobile-container`}
            style={{
              position: "relative",
            }}
          >
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

            <div
              className=" main-middle feed-container"
              style={{
                overflow: "scroll",
                marginBottom: "4rem",
                height: "calc(100dvh - 4.375rem)",
              }}
            >
              <ExploreFeed
                selectedTab={selectedTab}
                selectedCategory={selectedCategory}
                selectedFilter={selectedFilter}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                relay={relay}
              />
            </div>
            {selectedCategory.group !== "mf" && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  pointerEvents: isLoading ? "none" : "auto",
                  zIndex: 101,
                }}
                className="fit-container fx-centered box-pad-v"
              >
                <SelectTabs
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  tabs={tabs}
                />
              </div>
            )}
          </div>
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
            <p className="p-centered gray-c" style={{ maxWidth: "330px" }}>
              It looks like the shared relay URL is broken or does not exist
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const ExploreFeed = ({
  selectedCategory,
  selectedFilter,
  selectedTab,
  isLoading,
  setIsLoading,
  relay,
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState([]);
  const [timestamp, setTimestamp] = useState(false);
  const [lastEventsTimestamps, setLastEventsTimestamps] = useState({
    articles: undefined,
    curations: undefined,
    videos: undefined,
  });
  const [notesSuggestions, setNotesSuggestions] = useState([]);
  const [isEndOfQuerying, setIsEndOfQuerying] = useState(false);
  const [ndkInstance, setNDKInstance] = useState(false);

  useEffect(() => {
    const contentFromRelays = async () => {
      setIsLoading(true);
      let dateCheckerArts = lastEventsTimestamps.articles;
      // ? lastEventsTimestamps.articles - 86400
      // : Math.floor(Date.now() / 1000) - 86400;
      let dateCheckerCurations = lastEventsTimestamps.curations;
      // ? lastEventsTimestamps.curations - 86400
      // : Math.floor(Date.now() / 1000) - 86400;
      let dateCheckerVideos = lastEventsTimestamps.videos;
      // ? lastEventsTimestamps.videos - 86400
      // : Math.floor(Date.now() / 1000) - 86400;

      const { artsFilter, curationsFilter, videosFilter } = getFilter();
      let relayUrls = [relay];
      let [articles, curations, videos] = await Promise.all([
        getSubData(artsFilter, undefined, relayUrls, ndkInstance),
        getSubData(curationsFilter, undefined, relayUrls, ndkInstance),
        getSubData(videosFilter, undefined, relayUrls, ndkInstance),
      ]);

      let articles_ = sortEvents(articles.data).filter(
        (_) => _.created_at > dateCheckerArts
      );
      let curations_ = sortEvents(curations.data).filter(
        (_) => _.created_at > dateCheckerCurations
      );
      let videos_ = sortEvents(videos.data).filter(
        (_) => _.created_at > dateCheckerVideos
      );

      articles_ = articles_.length === 0 ? articles.data : articles_;
      curations_ = curations_.length === 0 ? curations.data : curations_;
      videos_ = videos_.length === 0 ? videos.data : videos_;

      setLastEventsTimestamps({
        articles:
          articles_.length > 0
            ? articles_[articles_.length - 1].created_at - 1
            : undefined,
        curations:
          curations_.length > 0
            ? curations_[curations_.length - 1].created_at - 1
            : undefined,
        videos:
          videos_.length > 0
            ? videos_[videos_.length - 1].created_at - 1
            : undefined,
      });

      if (
        articles_.length === 0 &&
        curations_.length === 0 &&
        videos_.length === 0
      )
        setIsEndOfQuerying(true);
      setContent((prev) =>
        filterContent(
          selectedFilter,
          removeEventsDuplicants([
            ...prev,
            ...MixEvents(articles_, curations_, videos_).map((event) =>
              selectedCategory.value === "top"
                ? event.content
                  ? {
                      ...getParsedRepEvent(JSON.parse(event.content)),
                      created_at: event.created_at,
                    }
                  : false
                : getParsedRepEvent(event)
            ),
          ]).filter((event) => {
            if (
              event &&
              event.title &&
              !([30004, 30005].includes(event.kind) && event.items.length === 0)
            )
              return event;
          })
        )
      );
      saveUsers([
        ...new Set([
          ...articles.pubkeys,
          ...curations.pubkeys,
          ...videos.pubkeys,
        ]),
      ]);
      setIsLoading(false);
      return;
    };

    if (ndkInstance) contentFromRelays();
  }, [timestamp, ndkInstance]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || isEndOfQuerying) return;
      let container = document.querySelector(".feed-container");
      if (!container) return;
      if (
        container.scrollHeight - container.scrollTop - 60 >
        document.documentElement.offsetHeight
      ) {
        return;
      }
      setTimestamp(Date.now());
    };

    document
      .querySelector(".feed-container")
      ?.addEventListener("scroll", handleScroll);

    return () =>
      document
        .querySelector(".feed-container")
        ?.removeEventListener("scroll", handleScroll);
  }, [isLoading]);

  useEffect(() => {
    setContent([]);
    setLastEventsTimestamps({
      articles: undefined,
      curations: undefined,
      videos: undefined,
    });
    setTimestamp(Date.now());
    setIsEndOfQuerying(false);
  }, [selectedTab]);

  const getFilter = () => {
    return {
      artsFilter: [0, 1].includes(selectedTab)
        ? [
            {
              kinds: [30023],
              limit: 50,
              until: lastEventsTimestamps.articles,
            },
          ]
        : [],
      curationsFilter: [0, 2].includes(selectedTab)
        ? [
            {
              kinds: [30004, 30005],
              limit: 50,
              until: lastEventsTimestamps.curations,
            },
          ]
        : [],
      videosFilter: [0, 3].includes(selectedTab)
        ? [
            {
              kinds: [34235],
              limit: 50,
              until: lastEventsTimestamps.videos,
            },
          ]
        : [],
    };
  };

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

  return (
    <div className="fit-container fx-centered fx-col " style={{ gap: 0 }}>
      {content.map((item, index) => {
        if (!bannedList.includes(item.pubkey))
          return (
            <Fragment key={item.id}>
              <div className="fit-container fx-centered">
                <RepEventPreviewCard item={item} />
              </div>
            </Fragment>
          );
      })}
      {content.length === 0 && !isLoading && (
        <div
          className="fit-container fx-centered fx-col"
          style={{ height: "30vh" }}
        >
          <div className="search"></div>
          <h4>{t("AUrhqmn")}</h4>
          <p className="gray-c">{t("AtL4qoU")}</p>
        </div>
      )}
      <div className="box-pad-v"></div>
      {isLoading && (
        <div
          className="fit-container box-pad-v fx-centered fx-col"
          style={{ height: "30vh" }}
        >
          <LoadingLogo />
        </div>
      )}
    </div>
  );
};
