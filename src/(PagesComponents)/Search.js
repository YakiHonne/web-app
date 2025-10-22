import React, { useEffect, useMemo, useState } from "react";
import ArrowUp from "@/Components/ArrowUp";
import { useDispatch, useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import { getLinkFromAddr, isHex, sortByKeyword } from "@/Helpers/Helpers";
import { getParsedRepEvent } from "@/Helpers/Encryptions";
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
import { setToPublish } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";
import { useRouter } from "next/router";
import InfiniteScroll from "@/Components/InfiniteScroll";

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
  const userKeys = useSelector((state) => state.userKeys);
  const userMutedList = useSelector((state) => state.userMutedList);
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
  const [lastTimestamp, setLastTimestamp] = useState(undefined);
  const [selectedTab, setSelectedTab] = useState(query ? query?.tab : "people");
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
    videos: t("AStkKfQ"),
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
    setIsLoading(true);
    let tempKeyword = value.replace("nostr:");
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
    setResults([]);
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
      timer = setTimeout(
        async () => {
          if (selectedTab === "people") searchForUser();
          if (selectedTab !== "people") {
            searchForContent();
          }
        },
        selectedTab === "people" ? 100 : 400
      );
    } else {
      clearTimeout(timer);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [searchKeyword, selectedTab, lastTimestamp]);

  const getUsersFromCache = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_CACHE_BASE_URL;

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
      limit: 5,
      "#t": tags,
      until: lastTimestamp ? lastTimestamp - 1 : lastTimestamp,
    };
    if (selectedTab === "notes") filter.kinds = [1];
    if (selectedTab === "articles") filter.kinds = [30023];
    if (selectedTab === "videos") filter.kinds = [34235, 21, 22];
    if (selectedTab === "all-media") filter.kinds = [1, 30023, 34235, 21, 22];
    let content = await getSubData([filter], 50);

    let content_ = content.data.map((event) => {
      if (event.kind === 1) {
        let parsedNote = getParsedNote(event, true);
        return parsedNote;
      } else {
        return getParsedRepEvent(event);
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
            <div
              className="fit-container sticky fx-centered fx-start-h fx-start-v fx-col box-pad-h "
              style={{
                padding: ".5rem",
                borderBottom: "1px solid var(--very-dim-gray)",
                top: 0
              }}
            >
              <div
                className="fx-centered fit-container"
                style={{
                  position: "relative",
                  borderBottom: "1px solid var(--very-dim-gray)",
                  height: "50px"
                }}
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
                {searchKeyword && (
                  <div
                    className="close"
                    onClick={() => {
                     setSearchKeyword("");
                    }}
                  >
                    <div></div>
                  </div>
                )}
              </div>
              <Slider
                items={[
                  ...["people", "all-media", "notes", "articles",  "videos"].map(
                    (tag, index) => {
                      return (
                        <div
                          className={
                            "btn sticker-gray-black p-caps fx-centered"
                          }
                          style={{
                            backgroundColor:
                              selectedTab === tag ? "" : "transparent",
                            color: selectedTab === tag ? "" : "var(--gray)",
                            // pointerEvents: isLoading ? "none" : "auto",
                          }}
                          key={index}
                          onClick={() => handleSelectedTab(tag)}
                        >
                          {tabsContent[tag]}
                        </div>
                      );
                    }
                  ),
                ]}
              />
              <hr />

              {searchKeyword && selectedTab !== "people" && (
                <div className="fx-scattered fit-container box-pad-v-s box-pad-h-m">
                  <h3>#{searchKeyword.replaceAll("#", "")}</h3>
                  {userKeys && (
                    <button
                      className={`btn ${
                        followed ? "btn-normal" : "btn-gray"
                      } fx-centered`}
                      onClick={saveInterestList}
                    >
                      {!followed && (
                        <>
                          {t("APkD8MP")} <div className="plus-sign"></div>
                        </>
                      )}
                      {followed && (
                        <>
                          {t("AiKpDYn")}
                          <div
                            className="check-24"
                            style={{ filter: "brightness(0) invert()" }}
                          ></div>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
            {userInterestList.length > 0 && (
              <div className="fit-container fx-centered fx-col fx-start-h fx-start-v box-pad-v-m">
                <p className="gray-c">{t("AvcFYqP")}</p>
                <div className="fx-centered fx-wrap">
                  {userInterestList?.map((interest, index) => {
                    return (
                      <div
                        onClick={() => {
                          setSearchKeyword(interest.toLowerCase());
                          setResults([]);
                          setIsLoading(true);
                        }}
                        className={`sc-s  box-pad-h-m box-pad-v-s pointer ${
                          searchKeyword === interest.toLowerCase()
                            ? ""
                            : "bg-sp"
                        }`}
                        key={index}
                      >
                        #{interest}
                      </div>
                    );
                  })}
                </div>
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
            <InfiniteScroll onRefresh={setLastTimestamp} events={results}>
              {selectedTab !== "people" &&
                results.map((item, index) => {
                  if (
                    [1].includes(item.kind) &&
                    !userMutedList.includes(item.pubkey)
                  )
                    return <KindOne key={item.id} event={item} border={true} />;
                  if (
                    [30023, 34235, 21, 22].includes(item.kind) &&
                    !userMutedList.includes(item.pubkey)
                  )
                    return <RepEventPreviewCard key={item.id} item={item} />;
                })}
            </InfiniteScroll>
            {isLoading && (
              <div
                className="fit-container fx-centered"
                style={{ height: "500px" }}
              >
                <LoadingLogo />
              </div>
            )}
            {results.length === 0 && !isLoading && (
              <div
                className="fit-container fx-col fx-centered"
                style={{ height: "500px" }}
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
