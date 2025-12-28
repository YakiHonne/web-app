import React, { useEffect, useMemo, useState } from "react";
import ArrowUp from "@/Components/ArrowUp";
import { useDispatch, useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import { getLinkFromAddr, isHex, sortByKeyword } from "@/Helpers/Helpers";
import { getParsedMedia, getParsedRepEvent } from "@/Helpers/Encryptions";
import { getParsedNote } from "@/Helpers/ClientHelpers";
import { getSubData } from "@/Helpers/Controlers";
import { customHistory } from "@/Helpers/History";
import { saveFetchedUsers, saveUsers } from "@/Helpers/DB";
import axios from "axios";
import SearchUserCard from "@/Components/SearchUserCard";
import LoadingLogo from "@/Components/LoadingLogo";
import Slider from "@/Components/Slider";
import RepEventPreviewCard from "@/Components/RepEventPreviewCard";
import KindOne from "@/Components/KindOne";
import { setToast, setToPublish } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";
import { useRouter } from "next/router";
import InfiniteScroll from "@/Components/InfiniteScroll";
import { getDataForSearch } from "@/Helpers/lib";
import Link from "next/link";
import { Virtuoso } from "react-virtuoso";
import MediaMasonryList from "@/Components/MediaMasonryList";

const getKeyword = () => {
  let keyword = new URLSearchParams(window.location.search).get("keyword");
  return keyword || "";
};

export default function Search() {
  const { query } = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const urlKeyword = getKeyword();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userSearchRelays = useSelector((state) => state.userSearchRelays);
  const userKeys = useSelector((state) => state.userKeys);
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const userInterestList = useSelector((state) => state.userInterestList);
  const userFollowings = useSelector((state) => state.userFollowings);
  const userFollowingsMetadata = useMemo(() => {
    return userFollowings
      .map((_) => nostrAuthors.find((__) => __.pubkey === _))
      .filter((_) => _);
  }, []);
  const [searchKeyword, setSearchKeyword] = useState(urlKeyword);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [launchSearching, setLaunchSearching] = useState(
    searchKeyword || false
  );
  const [lastTimestamp, setLastTimestamp] = useState(undefined);
  const [selectedTab, setSelectedTab] = useState(
    query?.tab ? query?.tab : "notes"
  );
  const followed = useMemo(() => {
    return userInterestList.find(
      (interest) => interest === searchKeyword.toLowerCase()
    );
  }, [searchKeyword, userInterestList]);
  const tabsContent = {
    people: t("AJ1Zfct"),
    "all-media": t("A7DfXrs"),
    articles: t("AesMg52"),
    notes: t("AYIXG83"),
    media: t("Media"),
  };
  const handleOnChange = (e) => {
    let value = e.target.value;
    if (!value) {
      setSearchKeyword("");
      setResults([]);
      setIsLoading(false);
      setLastTimestamp(undefined);
      return;
    }
    let tempKeyword = value.replaceAll("nostr:", "");
    if (
      (tempKeyword.startsWith("naddr") ||
        tempKeyword.startsWith("nprofile") ||
        tempKeyword.startsWith("npub") ||
        tempKeyword.startsWith("nevent") ||
        tempKeyword.startsWith("note")) &&
      tempKeyword.length > 10
    ) {
      let link = getLinkFromAddr(tempKeyword);
      customHistory(link);
      return;
    }
    setSearchKeyword(value);
    // setResults([]);
  };

  useEffect(() => {
    if (!searchKeyword) {
      setResults([]);
      setIsLoading(false);
      setLastTimestamp(undefined);
      return;
    }

    var timer = setTimeout(null);
    if (searchKeyword) {
      timer = setTimeout(async () => {
        if (selectedTab === "people") searchForUser();
        if (selectedTab !== "people") {
          searchForContent();
        }
      }, 1000);
    } else {
      clearTimeout(timer);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [launchSearching, selectedTab, lastTimestamp, userSearchRelays]);

  const getUsersFromCache = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_CACHE_BASE_URL;

      let data = await axios.get(
        `${API_BASE_URL}/api/v1/users/search/${searchKeyword}`
      );
      saveFetchedUsers(data.data);
      setResults((prev) => {
        let tempData = [...prev, ...data.data];
        tempData = tempData.filter((event, index, tempData) => {
          if (
            !bannedList.includes(event.pubkey) &&
            tempData.findIndex(
              (event_) => event_.pubkey === event.pubkey && !event.kind
            ) === index &&
            isHex(event.pubkey)
          )
            return event;
        });

        return sortByKeyword(tempData, searchKeyword).slice(0, 30);
      });
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const searchForUser = () => {
    let filteredUsers = [];
    if (!searchKeyword) {
      filteredUsers = Array.from(userFollowingsMetadata.slice(0, 30));
    }
    if (searchKeyword) {
      let checkFollowings = sortByKeyword(
        userFollowingsMetadata.filter((user) => {
          if (
            !bannedList.includes(user.pubkey) &&
            ((typeof user.display_name === "string" &&
              user.display_name
                ?.toLowerCase()
                .includes(searchKeyword?.toLowerCase())) ||
              (typeof user.name === "string" &&
                user.name
                  ?.toLowerCase()
                  .includes(searchKeyword?.toLowerCase())) ||
              (typeof user.nip05 === "string" &&
                user.nip05
                  ?.toLowerCase()
                  .includes(searchKeyword?.toLowerCase()))) &&
            isHex(user.pubkey) &&
            typeof user.about === "string"
          )
            return user;
        }),
        searchKeyword
      ).slice(0, 30);
      if (checkFollowings.length > 0) {
        filteredUsers = structuredClone(checkFollowings);
      }
      if (checkFollowings.length < 5) {
        let filterPubkeys = filteredUsers.map((_) => _.pubkey);
        filteredUsers = [
          ...filteredUsers,
          ...sortByKeyword(
            nostrAuthors.filter((user) => {
              if (
                !filterPubkeys.includes(user.pubkey) &&
                !bannedList.includes(user.pubkey) &&
                ((typeof user.display_name === "string" &&
                  user.display_name
                    ?.toLowerCase()
                    .includes(searchKeyword?.toLowerCase())) ||
                  (typeof user.name === "string" &&
                    user.name
                      ?.toLowerCase()
                      .includes(searchKeyword?.toLowerCase())) ||
                  (typeof user.nip05 === "string" &&
                    user.nip05
                      ?.toLowerCase()
                      .includes(searchKeyword?.toLowerCase()))) &&
                isHex(user.pubkey) &&
                typeof user.about === "string"
              )
                return user;
            }),
            searchKeyword
          ).slice(0, 30),
        ];
      }
    }

    setResults(filteredUsers);
    if (filteredUsers.length < 5) getUsersFromCache();
    setIsLoading(false);
  };

  const searchForContent = async () => {
    let tag = searchKeyword.replaceAll("#", "");
    let tags = [
      tag,
      `${String(tag).charAt(0).toUpperCase() + String(tag).slice(1)}`,
      tag.toUpperCase(),
      tag.toLowerCase(),
      `#${tag}`,
      `#${tag.toUpperCase()}`,
      `#${tag.toLowerCase()}`,
      `#${String(tag).charAt(0).toUpperCase() + String(tag).slice(1)}`,
    ];
    let filter = {
      limit: 300,
      "#t": tags,
      until: lastTimestamp ? lastTimestamp - 1 : lastTimestamp,
    };
    if (selectedTab === "notes") filter.kinds = [1];
    if (selectedTab === "articles") filter.kinds = [30023];
    if (selectedTab === "media") filter.kinds = [34235, 34236, 21, 22, 20];
    // if (selectedTab === "all-media") filter.kinds = [1, 30023, 34235, 21, 22];
    let content = await getDataForSearch(
      [filter, { ...filter, search: searchKeyword, "#t": undefined }],
      100,
      1000,
      userSearchRelays
    );
    let content_ = content.data.map((event) => {
      if (event.kind === 1) {
        let parsedNote = getParsedNote(event, true);
        return parsedNote;
      } else if (event.kind === 30023) {
        return getParsedRepEvent(event);
      } else if ([34235, 34236, 21, 22, 20].includes(event.kind)) {
        return getParsedMedia(event);
      }
    });
    if (content_.length === 0) setIsLoading(false);
    setResults((prev) => [...prev, ...content_]);
    saveUsers(content.pubkeys);
  };

  const handleSelectedTab = (data) => {
    if (data === selectedTab) return;
    setSelectedTab(data);
    setIsLoading(true);
    setLastTimestamp(undefined);
    setResults([]);
  };

  const encodePubkey = (pubkey) => {
    try {
      if (!isHex(pubkey)) return false;
      let url = nip19.nprofileEncode({ pubkey });
      return url;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const saveInterestList = async () => {
    try {
      let tags = userInterestList.map((_) => ["t", _]);
      if (!followed) {
        tags = [["t", searchKeyword.toLowerCase()], ...tags];
      } else {
        tags = tags.filter((_) => _[1] !== searchKeyword.toLowerCase());
      }
      dispatch(
        setToPublish({
          userKeys: userKeys,
          kind: 10015,
          content: "",
          tags,
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

  const handleSelectInterest = (interest) => {
    if (isLoading && results.length === 0) {
      return;
    }
    setSearchKeyword(interest.toLowerCase());
    setResults([]);
    setLastTimestamp(undefined);
    setIsLoading(true);
    setLaunchSearching(Date.now());
  };
  const handleClearSearch = () => {
    if (isLoading && results.length === 0) {
      return;
    }
    setSearchKeyword("");
    setLastTimestamp(undefined);
    setResults([]);
    setLaunchSearching(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchKeyword || (isLoading && results.length === 0)) {
      return;
    }
    setIsLoading(true);
    setLaunchSearching(Date.now());
  };
  return (
    <div style={{ overflow: "auto" }}>
      <ArrowUp />
      <div className="fit-container fx-centered fx-start-h fx-start-v">
        <div
          className="fit-container fx-centered fx-start-v "
          style={{ gap: 0 }}
        >
          <div
            style={{ gap: 0 }}
            className={`fx-centered fx-wrap fit-container main-middle`}
          >
            <div className="fit-container fx-centered fx-col box-pad-v-s">
              {!launchSearching && (
                <form
                  className="slide-up fx-centered fit-container  box-pad-h-s "
                  style={{
                    position: "relative",
                    height: "50px",
                    borderRadius: "var(--border-r-18)",
                    borderBottom: "1px solid var(--dim-gray)",
                  }}
                  onSubmit={handleSearch}
                >
                  <div className="search-24"></div>
                  <input
                    type="text"
                    placeholder="Search people, notes and content"
                    className="if ifs-full if-no-border"
                    onChange={handleOnChange}
                    value={searchKeyword}
                    style={{ paddingLeft: ".5rem" }}
                    autoFocus
                  />
                  <button className="btn btn-normal btn-small">
                    {t("A0omdiR")}
                  </button>
                  <Link
                    href={"/settings?tab=relays&relaysType=2"}
                    state={{ relaysTab: 1, tab: "relays" }}
                  >
                    <div className="setting-24"></div>
                  </Link>
                </form>
              )}
              {launchSearching && (
                <div
                  className="fx-scattered fit-container box-pad-v-s slide-down"
                  style={{ zIndex: 1, position: "relative" }}
                >
                  <h3 onDoubleClick={handleClearSearch}>
                    #{searchKeyword.replaceAll("#", "")}
                  </h3>
                  <div className="fx-centered">
                    <div
                      onClick={handleClearSearch}
                      className="round-icon-small round-icon-tooltip"
                      data-tooltip={t("AboMK2E")}
                    >
                      <div className="close" style={{ position: "static" }}>
                        <div></div>
                      </div>
                    </div>

                    {userKeys && (
                      <div
                        className="round-icon-tooltip"
                        data-tooltip={followed ? t("AydCXSh") : t("AdT5mza")}
                      >
                        <button
                          className={`btn btn-small ${
                            followed ? "btn-red" : "btn-normal"
                          } fx-centered`}
                          onClick={saveInterestList}
                        >
                          {!followed && (
                            <>
                              {t("ARWeWgJ")} <div className="plus-sign"></div>
                            </>
                          )}
                          {followed && (
                            <>
                              {t("AzkTxuy")}
                              <span className="p-big">-</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <InterestList
                userInterestList={userInterestList}
                handleSelectInterest={handleSelectInterest}
                searchKeyword={searchKeyword}
              />
            </div>
            {launchSearching && (
              <div
                className="fit-container fx-even slide-down"
                style={{ gap: 0 }}
              >
                {["people", "notes", "articles", "media"].map((tag, index) => {
                  return (
                    <div
                      className={`list-item-b fx-centered fx ${
                        selectedTab === tag ? "selected-list-item-b" : ""
                      }`}
                      key={index}
                      onClick={() => handleSelectedTab(tag)}
                    >
                      {tabsContent[tag]}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedTab === "people" &&
              results.map((item, index) => {
                if (!item.kind) {
                  let url = encodePubkey(item.pubkey);
                  if (url)
                    return (
                      <SearchUserCard
                        user={item}
                        key={item.id}
                        url={url}
                        exit={() => null}
                      />
                    );
                }
              })}
            {results.length > 0 && selectedTab !== "media" && (
              <Virtuoso
                style={{ width: "100%", height: "100vh" }}
                skipAnimationFrameInResizeObserver={true}
                overscan={1000}
                useWindowScroll={true}
                totalCount={results.length}
                increaseViewportBy={1000}
                endReached={(index) => {
                  setLastTimestamp(results[index].created_at - 1);
                }}
                itemContent={(index) => {
                  let item = results[index];
                  if (
                    [1].includes(item.kind) &&
                    !userMutedList.includes(item.pubkey)
                  )
                    return <KindOne key={item.id} event={item} border={true} />;
                  if (
                    [30023, 34235].includes(item.kind) &&
                    !userMutedList.includes(item.pubkey)
                  )
                    return <RepEventPreviewCard key={item.id} item={item} />;
                }}
              />
            )}
            {results.length > 0 && selectedTab === "media" && (
              <MediaMasonryList events={results} setLastEventTime={setLastTimestamp}/>
            )}
            {isLoading && (
              <div
                className="fit-container fx-centered"
                style={{ height: "80vh" }}
              >
                <LoadingLogo />
              </div>
            )}
            {results.length === 0 && !isLoading && (
              <div
                className="fit-container fx-col fx-centered"
                style={{ height: "80vh" }}
              >
                <div
                  className="search"
                  style={{ minWidth: "48px", minHeight: "48px" }}
                ></div>
                <h4 className="box-pad-v-s">{t("AjlW15t")}</h4>
                <p className="gray-c">{t("A0RqaoC")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const InterestList = ({
  userInterestList,
  handleSelectInterest,
  searchKeyword,
}) => {
  const { t } = useTranslation();
  const [showInterest, setShowInterest] = useState(false);

  if (userInterestList.length === 0) return null;
  return (
    <div
      className="slide-down fit-container fx-centered fx-col fx-start-h fx-start-v sc-s-18 bg-sp box-pad-h-s box-pad-v-s"
      style={{
        borderLeft: "none",
        borderRight: "none",
        gap: "10px",
        zIndex: 0,
        position: "relative",
      }}
    >
      <div
        className="fit-container fx-scattered pointer box-pad-h-s"
        onClick={() => setShowInterest(!showInterest)}
      >
        <p className="c1-c">{t("AvcFYqP")}</p>
        <div className="arrow"></div>
      </div>
      {showInterest && (
        <Slider
          items={userInterestList?.map((interest, index) => {
            return (
              <div
                onClick={() => handleSelectInterest(interest)}
                className={`sc-s  box-pad-h-s pointer ${
                  searchKeyword === interest.toLowerCase() ? "" : "bg-sp"
                }`}
                key={index}
              >
                <p>#{interest}</p>
              </div>
            );
          })}
          slideBy={200}
        />
      )}
    </div>
  );
};
