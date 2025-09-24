import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import ArrowUp from "@/Components/ArrowUp";
import { SelectTabs } from "@/Components/SelectTabs";
import { useSelector } from "react-redux";
import {
  filterContent,
  getBackupWOTList,
  getParsedRepEvent,
  getWOTList,
  removeEventsDuplicants,
  sortEvents,
} from "@/Helpers/Encryptions";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import { saveUsers } from "@/Helpers/DB";
import {
  getDefaultFilter,
  getDVMJobRequest,
  getDVMJobResponse,
  getSubData,
} from "@/Helpers/Controlers";
import LoadingLogo from "@/Components/LoadingLogo";
import UserToFollowSuggestionsCards from "@/Components/SuggestionsCards/UserToFollowSuggestionsCards";
import ContentSuggestionsCards from "@/Components/SuggestionsCards/ContentSuggestionCards";
import InterestSuggestionsCards from "@/Components/SuggestionsCards/InterestSuggestionsCards";
import DonationBoxSuggestionCards from "@/Components/SuggestionsCards/DonationBoxSuggestionCards";
import ProfileShareSuggestionCards from "@/Components/SuggestionsCards/ProfileShareSuggestionCards";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";
import InfiniteScroll from "@/Components/InfiniteScroll";
import ContentSourceAndFilter from "@/Components/ContentSourceAndFilter";
import RecentPosts from "@/Components/RecentPosts";
import { straightUp } from "@/Helpers/Helpers";
import { getNDKInstance } from "@/Helpers/utils";

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

export default function Discover() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(getDefaultFilter());
  const [selectedCategory, setSelectedCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const extrasRef = useRef(null);
  const tabs = [t("AR9ctVs"), t("AesMg52"), t("AVysZ1s"), t("AStkKfQ")];

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
              <ContentSourceAndFilter
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
              />
              <div
                className=" main-middle"
                style={{
                  marginBottom: "4rem",
                }}
              >
                <div style={{ height: "90px" }}></div>
                <ExploreFeed
                  selectedTab={selectedTab}
                  selectedCategory={selectedCategory}
                  selectedFilter={selectedFilter}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedCategory.group !== "mf" && (
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
      )}
    </>
  );
}

const ExploreFeed = ({
  selectedCategory,
  selectedFilter,
  selectedTab,
  isLoading,
  setIsLoading,
}) => {
  const userInterestList = useSelector((state) => state.userInterestList);
  const { t } = useTranslation();
  const [content, setContent] = useState([]);
  const [timestamp, setTimestamp] = useState(false);
  const [lastEventsTimestamps, setLastEventsTimestamps] = useState({
    articles: undefined,
    curations: undefined,
    videos: undefined,
  });
  const [notesSuggestions, setNotesSuggestions] = useState([]);
  const [subFilter, setSubfilter] = useState({ filter: [], relays: [] });
  const since = useMemo(
    () => (content.length > 0 ? content[0].created_at + 1 : undefined),
    [content]
  );
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
      let extraPubkeys = [];
      const { artsFilter, curationsFilter, videosFilter } = getFilter();
      const algoRelay =
        selectedCategory.group === "af" ? [selectedCategory.value] : [];
      let ndk =
        selectedCategory.group === "af"
          ? await getNDKInstance(selectedCategory.value)
          : undefined;
      setSubfilter({
        filter: [...artsFilter, ...curationsFilter, ...videosFilter],
        relays: algoRelay,
        ndk,
      });

      let [articles, curations, videos] = await Promise.all([
        getSubData(artsFilter, 200, algoRelay, ndk, 20),
        getSubData(curationsFilter, 200, algoRelay, ndk, 20),
        getSubData(videosFilter, 200, algoRelay, ndk, 20),
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

      let sortedData = MixEvents(articles_, curations_, videos_)
        .map((event) =>
          selectedCategory.value === "top"
            ? event.content
              ? {
                  ...getParsedRepEvent(JSON.parse(event.content)),
                  created_at: event.created_at,
                }
              : false
            : getParsedRepEvent(event)
        )
        .filter((event) => {
          if (
            event &&
            event.title &&
            !([30004, 30005].includes(event.kind) && event.items.length === 0)
          )
            return event;
        });
      setContent((prev) => {
        let data = filterContent(
          selectedFilter,
          removeEventsDuplicants([...prev, ...sortedData])
        );
        return data;
      });
      extraPubkeys = [...new Set(sortedData.map((event) => event.pubkey))];

      saveUsers([
        ...new Set([
          ...articles.pubkeys,
          ...curations.pubkeys,
          ...videos.pubkeys,
          ...extraPubkeys,
        ]),
      ]);
      setIsLoading(false);
      return;
    };
    const contentFromDVM = async () => {
      try {
        setIsLoading(true);
        let eventId = await getDVMJobRequest(selectedCategory.value);
        if (!eventId) {
          setIsLoading(false);
          return;
        }
        let data = await getDVMJobResponse(eventId, selectedCategory.value);
        if (data.length > 0) {
          let events = await getSubData([{ ids: data }]);
          let filteredEvents = filterContent(
            selectedFilter,
            events.data.map((_) => getParsedRepEvent(_))
          );
          setContent(filteredEvents);
          saveUsers(events.pubkeys);
        }
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };
    if (timestamp && ["cf", "af"].includes(selectedCategory?.group))
      contentFromRelays();
    if (["mf"].includes(selectedCategory?.group)) contentFromDVM();
  }, [timestamp]);

  useEffect(() => {
    setContent([]);
    setLastEventsTimestamps({
      articles: undefined,
      curations: undefined,
      videos: undefined,
    });
    setTimestamp(Date.now());
  }, [selectedCategory, selectedTab, selectedFilter]);

  const getFilter = () => {
    let a_until =
      selectedFilter.to && lastEventsTimestamps.articles
        ? Math.min(selectedFilter.to, lastEventsTimestamps.articles)
        : selectedFilter.to
        ? selectedFilter.to
        : lastEventsTimestamps.articles;
    let c_until =
      selectedFilter.to && lastEventsTimestamps.curations
        ? Math.min(selectedFilter.to, lastEventsTimestamps.curations)
        : selectedFilter.to
        ? selectedFilter.to
        : lastEventsTimestamps.curations;
    let v_until =
      selectedFilter.to && lastEventsTimestamps.videos
        ? Math.min(selectedFilter.to, lastEventsTimestamps.videos)
        : selectedFilter.to
        ? selectedFilter.to
        : lastEventsTimestamps.videos;
    let since = selectedFilter.from || undefined;
    let authors =
      selectedFilter.posted_by?.length > 0
        ? selectedFilter.posted_by
        : undefined;
    if (selectedCategory.value === "top")
      return {
        artsFilter: [0, 1].includes(selectedTab)
          ? [
              {
                kinds: [16],
                "#k": ["30023"],
                limit: 50,
                until: a_until,
                since,
              },
            ]
          : [],
        curationsFilter: [0, 2].includes(selectedTab)
          ? [
              {
                kinds: [16],
                "#k": ["30004", "30005"],
                limit: 50,
                until: c_until,
                since,
              },
            ]
          : [],
        videosFilter: [0, 3].includes(selectedTab)
          ? [
              {
                kinds: [16],
                "#k": ["34235", "21", "22"],
                limit: 50,
                until: v_until,
                since,
              },
            ]
          : [],
      };
    if (selectedCategory.value === "newest") {
      let authors_ = authors || getWOTList();
      authors_ = authors_.length > 0 ? authors_ : getBackupWOTList();
      return {
        artsFilter: [0, 1].includes(selectedTab)
          ? [
              {
                kinds: [30023],
                limit: 100,
                authors: authors_,
                until: a_until,
                since,
              },
            ]
          : [],
        curationsFilter: [0, 2].includes(selectedTab)
          ? [
              {
                kinds: [30004, 30005],
                limit: 100,
                authors: authors_,
                until: c_until,
                since,
              },
            ]
          : [],
        videosFilter: [0, 3].includes(selectedTab)
          ? [
              {
                kinds: [34235, 21, 22],
                limit: 100,
                authors: authors_,
                until: v_until,
                since,
              },
            ]
          : [],
      };
    }

    return {
      artsFilter: [0, 1].includes(selectedTab)
        ? [
            {
              kinds: [30023],
              limit: 50,
              authors,
              until: a_until,
              since,
            },
          ]
        : [],
      curationsFilter: [0, 2].includes(selectedTab)
        ? [
            {
              kinds: [30004, 30005],
              limit: 50,
              authors,
              until: c_until,
              since,
            },
          ]
        : [],
      videosFilter: [0, 3].includes(selectedTab)
        ? [
            {
              kinds: [34235, 21, 22],
              limit: 50,
              authors,
              until: v_until,
              since,
            },
          ]
        : [],
    };
  };

  const getContentCard = (index) => {
    if (index === 15)
      return (
        <ContentSuggestionsCards
          tag={
            !["explore", "following"].includes(selectedCategory)
              ? selectedCategory
              : false
          }
          content={notesSuggestions}
          kind="notes"
        />
      );
    if (index === 30) return <UserToFollowSuggestionsCards />;
    if (index === 45)
      return (
        <InterestSuggestionsCards
          limit={5}
          list={userInterestList}
          update={true}
          expand={true}
        />
      );
    if (index === 60) return <DonationBoxSuggestionCards />;
    if (index === 75) return <ProfileShareSuggestionCards />;
  };

  const handleRecentPostsClick = (posts) => {
    setContent(posts);
    straightUp(undefined, "smooth");
  };

  return (
    <InfiniteScroll onRefresh={setTimestamp} events={content}>
      {!["mf"].includes(selectedCategory?.group) && (
        <RecentPosts
          filter={subFilter}
          since={since}
          onClick={handleRecentPostsClick}
          selectedFilter={selectedFilter}
          kind="posts"
        />
      )}
      {/* <div className="fit-container fx-centered fx-col " style={{ gap: 0 }}> */}
      {content.map((item, index) => {
        if (!bannedList.includes(item.pubkey))
          return (
            <Fragment key={item.id}>
              <div className="fit-container fx-centered">
                <RepEventPreviewCard item={item} />
              </div>
              {getContentCard(index)}
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
      {/* </div> */}
    </InfiniteScroll>
  );
};
