import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import ArrowUp from "@/Components/ArrowUp";
import { SelectTabs } from "@/Components/SelectTabs";
import {
  getParsedRepEvent,
  removeEventsDuplicants,
  sortEvents,
} from "@/Helpers/Encryptions";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import { saveUsers } from "@/Helpers/DB";
import {  getSubData } from "@/Helpers/Controlers";
import LoadingLogo from "@/Components/LoadingLogo";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";
import InfiniteScroll from "@/Components/InfiniteScroll";
import { getNDKInstance } from "@/Helpers/utils";
import Backbar from "@/Components/Backbar";
import RelayPreview from "./Relays/RelayPreview/RelayPreview";
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
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const extrasRef = useRef(null);
  const tabs = [t("AR9ctVs"), t("AesMg52"), t("AVysZ1s"), t("AStkKfQ")];
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
              </div>
              <div
                className=" main-middle"
                style={{
                  marginBottom: "4rem",
                }}
              >
                <ExploreFeed
                  relay={relay}
                  selectedTab={selectedTab}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          pointerEvents: isLoading ? "none" : "auto",
          zIndex: 101,
        }}
        className="fit-container fx-centered box-pad-v "
      >
        <div className="main-container">
          <main
            style={{ height: "80px" }}
            className="fx-centered fx-end-h box-pad-h-s"
          >
            <div className="main-page-nostr-container fx-centered">
              <div className="main-middle fx-centered box-pad-h">
                <div className="fx-centered" style={{ width: "max-content" }}>
                  <SelectTabs
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    tabs={tabs}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

const ExploreFeed = ({
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
  const [isEndOfQuerying, setIsEndOfQuerying] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const contentFromRelays = async () => {
      setIsLoading(true);
      let dateCheckerArts = lastEventsTimestamps.articles;
      let dateCheckerCurations = lastEventsTimestamps.curations;
      let dateCheckerVideos = lastEventsTimestamps.videos;

      const { artsFilter, curationsFilter, videosFilter } = getFilter();
      let ndk = await getNDKInstance(relay);
      if(!ndk){
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      let relayUrls = [relay];
      let [articles, curations, videos] = await Promise.all([
        getSubData(artsFilter, undefined, relayUrls, ndk),
        getSubData(curationsFilter, undefined, relayUrls, ndk),
        getSubData(videosFilter, undefined, relayUrls, ndk),
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

      setContent((prev) =>
        removeEventsDuplicants([
          ...prev,
          ...MixEvents(articles_, curations_, videos_).map((event) =>
            getParsedRepEvent(event)
          ),
        ]).filter((event) => {
          if (
            event &&
            event.title &&
            !([30004, 30005].includes(event.kind) && event.items.length === 0)
          )
            return event;
        })
      );
      saveUsers([
        ...new Set([
          ...articles.pubkeys,
          ...curations.pubkeys,
          ...videos.pubkeys,
        ]),
      ]);
      if (
        articles_.length === 0 &&
        curations_.length === 0 &&
        videos_.length === 0
      ) {
        setIsEndOfQuerying(true);
        setIsLoading(false);
      }
      return;
    };

    contentFromRelays();
  }, [timestamp]);

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

  return (
    <InfiniteScroll onRefresh={setTimestamp} events={content}>
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
    {content?.length === 0 && !isLoading && isConnected && (
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
      {content?.length === 0 && !isLoading && !isConnected && (
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
          style={{ height: "30vh" }}
        >
          <LoadingLogo />
        </div>
      )}
    </InfiniteScroll>
  );
};
