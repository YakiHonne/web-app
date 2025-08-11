import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { nip19 } from "nostr-tools";
import LoadingDots from "@/Components/LoadingDots";
import Link from "next/link";
import { useSelector } from "react-redux";
import { isHex, sortByKeyword } from "@/Helpers/Helpers";
import SearchUserCard from "@/Components/SearchUserCard";
import { useTranslation } from "react-i18next";
import bannedList from "@/Content/BannedList";

export default function MentionSuggestions({
  mention,
  setSelectedMention,
  setSelectedMentionMetadata,
  displayAbove = false,
}) {
  const { t } = useTranslation();
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userFollowings = useSelector((state) => state.userFollowings);
  const userFollowingsMetadata = useMemo(() => {
    return userFollowings
      .map((_) => nostrAuthors.find((__) => __.pubkey === _))
      .filter((_) => _);
  }, []);
  const [users, setUsers] = useState(userFollowingsMetadata.slice(0, 100));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUsersFromCache = async () => {
      try {
        setIsLoading(true);
        const API_BASE_URL = process.env.REACT_APP_API_CACHE_BASE_URL;

        let data = await axios.get(
          `${API_BASE_URL}/api/v1/users/search/${mention}`
        );

        setUsers((prev) => {
          let tempData = [...prev, ...data.data];
          tempData = tempData.filter((user, index, tempData) => {
            if (
              !bannedList.includes(user.pubkey) &&
              tempData.findIndex(
                (event_) => event_.pubkey === user.pubkey && !user.kind
              ) === index &&
              isHex(user.pubkey)
            )
              return user;
          });
          return sortByKeyword(tempData, mention).slice(0, 30);
        });
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };
    const searchForUser = () => {
      let filteredUsers = [];
      if (!mention) {
        filteredUsers = Array.from(userFollowingsMetadata.slice(0, 30));
      }
      if (mention) {
        let checkFollowings = sortByKeyword(
          userFollowingsMetadata.filter((user) => {
            if (
              !bannedList.includes(user.pubkey) &&
              ((typeof user.display_name === "string" &&
                user.display_name
                  ?.toLowerCase()
                  .includes(mention?.toLowerCase())) ||
                (typeof user.name === "string" &&
                  user.name?.toLowerCase().includes(mention?.toLowerCase())) ||
                (typeof user.nip05 === "string" &&
                  user.nip05
                    ?.toLowerCase()
                    .includes(mention?.toLowerCase()))) &&
              isHex(user.pubkey) &&
              typeof user.about === "string"
            )
              return user;
          }),
          mention
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
                      .includes(mention?.toLowerCase())) ||
                    (typeof user.name === "string" &&
                      user.name
                        ?.toLowerCase()
                        .includes(mention?.toLowerCase())) ||
                    (typeof user.nip05 === "string" &&
                      user.nip05
                        ?.toLowerCase()
                        .includes(mention?.toLowerCase()))) &&
                  isHex(user.pubkey) &&
                  typeof user.about === "string"
                )
                  return user;
              }),
              mention
            ).slice(0, 30),
          ];
        }
      }

      setUsers(filteredUsers);
      if (filteredUsers.length < 5) getUsersFromCache();
    };

    var timer = setTimeout(null);
    if (mention) {
      timer = setTimeout(async () => {
        searchForUser();
      }, 100);
    } else {
      clearTimeout(timer);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [mention]);

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

  if (users === false) return;

  return (
    <>
      {isLoading && (
        <div
          className="fit-container sc-s-18"
          style={{
            width: "100%",
            position: "absolute",
            left: 0,
            [displayAbove ? "bottom" : "top"]: "110%",
            overflow: "hidden",
            zIndex: 211,
            height: "20px",
            border: "none",
            backgroundColor: "transparent",
          }}
        >
          <div
            style={{ height: "4px", backgroundColor: "var(--c1)" }}
            className="v-bounce"
          ></div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          [displayAbove ? "bottom" : "top"]: "110%",
          left: 0,
          width: "100%",
          maxHeight: "200px",
          overflow: "scroll",
          zIndex: 100,
          gap: 0,
        }}
        className="sc-s-18 fx-centered fx-start-v fx-start-h fx-col  box-pad-v-s"
      >
        {isLoading && users.length === 0 && (
          <>
            <div className="fx-centered fit-container box-pad-v-s">
              <p className="p-small gray-c">{t("AKvHyxG")}</p>
              <LoadingDots />
            </div>
            <hr />
          </>
        )}
        {users.map((user, index) => {
          let url = encodePubkey(user.pubkey);
          if (url)
            return (
              <div
                key={user.pubkey}
                className="fx-scattered box-pad-v-s box-pad-h-m fit-container pointer search-bar-post"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMention && setSelectedMention(url);
                  setSelectedMentionMetadata &&
                    setSelectedMentionMetadata({ ...user, npub: url });
                }}
                style={{
                  borderTop: index !== 0 ? "1px solid var(--pale-gray)" : "",
                }}
              >
                <SearchUserCard user={user} />
                <Link
                  href={`/${url}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  target="_blank"
                >
                  <div className="share-icon"></div>
                </Link>
              </div>
            );
        })}
        {users.length === 0 && !isLoading && (
          <div className="fit-container fx-centered">
            <p className="gray-c p-medium p-italic">{t("A6aLMx1")}</p>
          </div>
        )}
      </div>
    </>
  );
}
