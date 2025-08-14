import React, { useEffect, useMemo, useState } from "react";
import {
  getLinkFromAddr,
  isHex,
  sortByKeyword,
} from "@/Helpers/Helpers";
import { compactContent } from "@/Helpers/ClientHelpers";
import { customHistory } from "@/Helpers/History";
import { useSelector } from "react-redux";
import axios from "axios";
import { saveFetchedUsers, saveUsers } from "@/Helpers/DB";
import { nip19 } from "nostr-tools";
import LoadingDots from "@/Components/LoadingDots";
import { SelectTabs } from "@/Components/SelectTabs";
import { getSubData } from "@/Helpers/Controlers";
import { getParsedRepEvent } from "@/Helpers/Encryptions";
import SearchUserCard from "@/Components/SearchUserCard";
import SearchContentCard from "@/Components/SearchContentCard";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";
import Slider from "@/Components/Slider";

export default function SearchNetwork({ exit }) {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userMutedList = useSelector((state) => state.userMutedList);
  const userInterestList = useSelector((state) => state.userInterestList);
  const userFollowings = useSelector((state) => state.userFollowings);
  const userFollowingsMetadata = useMemo(() => {
    return userFollowings
      .map((_) => nostrAuthors.find((__) => __.pubkey === _))
      .filter((_) => _);
  }, []);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const { t } = useTranslation();

  const handleOnChange = (e) => {
    let value = e.target.value;
    if (!value) {
      setSearchKeyword("");
      setResults([]);
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
      exit();
      return;
    }
    setSearchKeyword(value);
  };

  useEffect(() => {
    if (!searchKeyword) {
      setResults([]);
      return;
    }

    var timer = setTimeout(null);
    if (searchKeyword) {
      timer = setTimeout(async () => {
        if (selectedTab === 0) searchForUser();
        if (selectedTab === 1) searchForContent();
      }, 100);
    } else {
      clearTimeout(timer);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [searchKeyword, selectedTab]);

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

  // const searchForUser = () => {
  //   const filteredUsers = searchKeyword
  //     ? sortByKeyword(
  //         nostrAuthors.filter((user) => {
  //           if (
  //             !bannedList.includes(user.pubkey) &&
  //             ((typeof user.display_name === "string" &&
  //               user.display_name
  //                 ?.toLowerCase()
  //                 .includes(searchKeyword?.toLowerCase())) ||
  //               (typeof user.name === "string" &&
  //                 user.name
  //                   ?.toLowerCase()
  //                   .includes(searchKeyword?.toLowerCase())) ||
  //               (typeof user.nip05 === "string" &&
  //                 user.nip05
  //                   ?.toLowerCase()
  //                   .includes(searchKeyword?.toLowerCase()))) &&
  //             isHex(user.pubkey)
  //           )
  //             return user;
  //         }),
  //         searchKeyword
  //       ).slice(0, 25)
  //     : Array.from(
  //         nostrAuthors
  //           .filter((_) => !bannedList.includes(_.pubkey))
  //           .slice(0, 30)
  //       );

  //   setResults(filteredUsers);
  //   getUsersFromCache();
  // };

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

    let content = await getSubData(
      [
        { kinds: [1], limit: 10, "#t": tags },
        { kinds: [30023, 34235], limit: 30, "#t": tags },
      ],
      500
    );
    let content_ = content.data.map((event) => {
      if (event.kind === 1) {
        return {
          ...event,
          content: compactContent(event.content, event.pubkey),
        };
      } else {
        return getParsedRepEvent(event);
      }
    });
    setIsLoading(false);
    setResults(content_);
    saveUsers(content.pubkeys);
  };

  const handleSelectedTab = (data) => {
    if (data === selectedTab) return;
    setSelectedTab(data);
    setIsLoading(true);
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

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="sc-s-18 slide-up bg-sp"
        style={{
          width: "min(100%,600px)",
          height: "60vh",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{ overflow: "scroll", height: "100%", paddingBottom: "4rem",  }}
       className="fit-container"
       >
          <div
            className="sticky fit-container fx-centered fx-start-h box-pad-h"
            style={{
              borderBottom: "1px solid var(--very-dim-gray)",
              padding: "0 1rem",
            }}
          >
            <div className="search-24"></div>
            <input
              type="text"
              placeholder={t("APAkDF0")}
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
          {searchKeyword && (
            <div
              className="fit-container box-pad-h-s box-pad-v-s fx-centered"
              onClick={() => {
                customHistory(
                  `/search?keyword=${searchKeyword?.replace("#", "%23")}`
                );
                exit();
              }}
            >
              <div className="fit-container slide-down box-pad-h-m box-pad-v-m sc-s-18 fx-centered fx-start-h pointer">
                <div className="search"></div>{" "}
                <p className="p-one-line">
                  {t("AvpIWa1")}{" "}
                  <span className="p-bold ">
                    #{searchKeyword.replaceAll("#", "")}
                  </span>
                </p>
              </div>
            </div>
          )}
          {userInterestList.length > 0 && (
            <div className="fit-container fx-centered fx-col fx-start-h fx-start-v box-pad-h-m box-pad-v-s">
              <p className="gray-c">{t("AvcFYqP")}</p>
              {/* <div className="fx-centered fx-wrap"> */}
              <div className="fit-container">
                <Slider
                  slideBy={200}
                  items={userInterestList?.map((interest, index) => {
                    return (
                      <div
                        onClick={() => {
                          customHistory(
                            `/search?keyword=${interest?.replace("#", "%23")}`
                          );
                          exit();
                        }}
                        className="sc-s bg-sp box-pad-h-m box-pad-v-s pointer"
                        key={index}
                      >
                        #{interest}
                      </div>
                    );
                  })}
                />
              </div>
              {/* </div> */}
            </div>
          )}
          {results.map((item, index) => {
            if (!item.kind) {
              let url = encodePubkey(item.pubkey);
              if (url)
                return (
                  <SearchUserCard
                    user={item}
                    key={item.id}
                    url={url}
                    exit={exit}
                  />
                );
            }
            if (!userMutedList.includes(item.pubkey))
              return (
                <SearchContentCard key={item.id} event={item} exit={exit} />
              );
          })}
          {results.length === 0 && !isLoading && (
            <div
              className="fit-container fx-col fx-centered"
              style={{ height: "500px" }}
            >
              <div className="search-24"></div>
              <h4>{t("AjlW15t")}</h4>
              <p className="gray-c">{t("A0RqaoC")}</p>
            </div>
          )}
          {isLoading && results.length === 0 && (
            <div
              className="fit-container fx-centered"
              style={{ height: "500px" }}
            >
              <p className="gray-c p-medium">{t("APAkDF0")}</p> <LoadingDots />
            </div>
          )}
        </div>
        {searchKeyword && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              pointerEvents: isLoading ? "none" : "auto",
            }}
            className="fit-container fx-centered box-pad-v-s slide-up"
          >
            <SelectTabs
              selectedTab={selectedTab}
              setSelectedTab={(data) => handleSelectedTab(data)}
              tabs={[t("ABn8zyu"), t("AepwLlB")]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
