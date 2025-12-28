import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import ArrowUp from "@/Components/ArrowUp";
import { useSelector } from "react-redux";
import {
  filterContent,
  getBackupWOTList,
  getParsedRepEvent,
  getWOTList,
  removeEventsDuplicants,
} from "@/Helpers/Encryptions";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import { saveUsers } from "@/Helpers/DB";
import { getDefaultFilter, getSubData } from "@/Helpers/Controlers";
import LoadingLogo from "@/Components/LoadingLogo";
import UserToFollowSuggestionsCards from "@/Components/SuggestionsCards/UserToFollowSuggestionsCards";
import ContentSuggestionsCards from "@/Components/SuggestionsCards/ContentSuggestionCards";
import InterestSuggestionsCards from "@/Components/SuggestionsCards/InterestSuggestionsCards";
import DonationBoxSuggestionCards from "@/Components/SuggestionsCards/DonationBoxSuggestionCards";
import ProfileShareSuggestionCards from "@/Components/SuggestionsCards/ProfileShareSuggestionCards";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";
import ContentSourceAndFilter from "@/Components/ContentSourceAndFilter";
import RecentPosts from "@/Components/RecentPosts";
import { straightUp } from "@/Helpers/Helpers";
import { getNDKInstance } from "@/Helpers/utils/ndkInstancesCache";
import { Virtuoso } from "react-virtuoso";

export default function Articles() {
  const [selectedFilter, setSelectedFilter] = useState(getDefaultFilter());
  const [selectedCategory, setSelectedCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const extrasRef = useRef(null);

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
                  minHeight: "90dvh",
                }}
              >
                <div style={{ height: "90px" }}></div>
                <ExploreFeed
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
  const userKeys = useSelector((state) => state.userKeys);
  const userInterestList = useSelector((state) => state.userInterestList);
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const userFollowings = useSelector((state) => state.userFollowings);
  const { t } = useTranslation();
  const [content, setContent] = useState([]);
  const [timestamp, setTimestamp] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastEventsTimestamps, setLastEventsTimestamps] = useState(undefined);
  const [notesSuggestions, setNotesSuggestions] = useState([]);
  const [subFilter, setSubfilter] = useState({ filter: [], relays: [] });
  const since = useMemo(
    () => (content.length > 0 ? content[0].created_at + 1 : undefined),
    [content]
  );
  const virtuosoRef = useRef(null);
  useEffect(() => {
    const contentFromRelays = async () => {
      setIsLoading(true);
      setIsConnected(true);
      let extraPubkeys = [];
      const filter = getFilter();

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
      let algoRelay = [];
      if (selectedCategory.group === "af")
        algoRelay.push(selectedCategory.value);
      if (selectedCategory.group === "rsf") algoRelay = selectedCategory.relays;
      if (ndk === false) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      setSubfilter({
        filter,
        relays: algoRelay,
        ndk,
      });

      let articles_ = await getSubData(filter, 150, algoRelay, ndk);
      let articles = articles_.data.splice(0, 100);
      if (articles.length > 0)
        setLastEventsTimestamps(articles[articles.length - 1].created_at - 1);

      let sortedData = articles
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
          if (event && event.title) return event;
        });
      setContent((prev) => {
        let data = filterContent(
          selectedFilter,
          removeEventsDuplicants([...prev, ...sortedData])
        );
        return data;
      });
      extraPubkeys = [...new Set(sortedData.map((event) => event.pubkey))];

      saveUsers([...new Set([...articles_.pubkeys, ...extraPubkeys])]);
      setIsLoading(false);
      return;
    };
    if (timestamp && ["cf", "af", "rsf"].includes(selectedCategory?.group))
      contentFromRelays();
  }, [timestamp]);

  useEffect(() => {
    setContent([]);
    setLastEventsTimestamps(undefined);
    setTimestamp(Date.now());
  }, [selectedCategory, selectedTab, selectedFilter]);

  const getFilter = () => {
    let until =
      selectedFilter.to && lastEventsTimestamps
        ? Math.min(selectedFilter.to, lastEventsTimestamps)
        : selectedFilter.to
        ? selectedFilter.to
        : lastEventsTimestamps;

    let since = selectedFilter.from || undefined;
    let authors =
      selectedFilter.posted_by?.length > 0
        ? selectedFilter.posted_by
        : undefined;
    if (selectedCategory.value === "top")
      return [
        {
          kinds: [16],
          "#k": ["30023"],
          limit: 100,
          until,
          since,
        },
      ];

    if (selectedCategory.value === "network") {
      let authors_ = authors || getWOTList();
      authors_ = authors_.length > 0 ? authors_ : getBackupWOTList();

      return [
        {
          kinds: [30023],
          limit: 100,
          authors: authors_,
          until,
          since,
        },
      ];
    }

    return [
      {
        kinds: [30023],
        limit: 100,
        authors,
        until,
        since,
      },
    ];
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
    <>
      {userKeys &&
        selectedCategory.value === "network" &&
        userFollowings &&
        userFollowings?.length < 5 && (
          <div className="fit-container ">
            <div className="fit-container fx-centered fx-start-h fx-start-v box-pad-h box-marg-s">
              <div>
                <div className="eye-opened-24"></div>
              </div>
              <div>
                <p>{t("AZKoEWL")}</p>
                <p className="gray-c">{t("AstvJYT")}</p>
              </div>
            </div>
          </div>
        )}
      {!["mf"].includes(selectedCategory?.group) && (
        <RecentPosts
          filter={subFilter}
          since={since}
          onClick={handleRecentPostsClick}
          selectedFilter={selectedFilter}
          kind="posts"
        />
      )}
      {content.length > 0 && (
        <Virtuoso
          ref={virtuosoRef}
          style={{ width: "100%", height: "100vh" }}
          skipAnimationFrameInResizeObserver={true}
          overscan={1000}
          useWindowScroll={true}
          totalCount={content.length}
          increaseViewportBy={1000}
          endReached={(index) => {
            setTimestamp(content[index].created_at - 1);
          }}
          itemContent={(index) => {
            let item = content[index];
            if (![...bannedList, ...userMutedList].includes(item.pubkey))
              return (
                <Fragment key={item.id}>
                  <div className="fit-container fx-centered">
                    <RepEventPreviewCard item={item} />
                  </div>
                  {getContentCard(index)}
                </Fragment>
              );
          }}
        />
      )}
      {content.length === 0 && !isLoading && isConnected && (
        <div
          className="fit-container fx-centered fx-col"
          style={{ height: "30vh" }}
        >
          <div className="search"></div>
          <h4>{t("AUrhqmn")}</h4>
          <p className="gray-c">{t("AtL4qoU")}</p>
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
    </>
  );
};
