import bannedList from "@/Content/BannedList";
import { isHex, sortByKeyword } from "@/Helpers/Helpers";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function useSearchUsers(keyword) {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userFollowings = useSelector((state) => state.userFollowings);
  const [users, setUsers] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const userFollowingsMetadata = useMemo(() => {
    return userFollowings
      .map((_) => nostrAuthors.find((__) => __.pubkey === _))
      .filter((_) => _);
  }, []);
  useEffect(() => {
    const getUsersFromCache = async () => {
      try {
        setIsSearchLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_CACHE_BASE_URL;

        let data = await axios.get(
          `${API_BASE_URL}/api/v1/users/search/${keyword}`
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
          return sortByKeyword(tempData, keyword).slice(0, 30);
        });
        setIsSearchLoading(false);
      } catch (err) {
        console.log(err);
        setIsSearchLoading(false);
      }
    };
    const searchForUser = () => {
      let filteredUsers = [];
      if (!keyword) {
        filteredUsers = Array.from(userFollowingsMetadata.slice(0, 30));
      }
      if (keyword) {
        let checkFollowings = sortByKeyword(
          userFollowingsMetadata.filter((user) => {
            if (
              !bannedList.includes(user.pubkey) &&
              ((typeof user.display_name === "string" &&
                user.display_name
                  ?.toLowerCase()
                  .includes(keyword?.toLowerCase())) ||
                (typeof user.name === "string" &&
                  user.name?.toLowerCase().includes(keyword?.toLowerCase())) ||
                (typeof user.nip05 === "string" &&
                  user.nip05
                    ?.toLowerCase()
                    .includes(keyword?.toLowerCase()))) &&
              isHex(user.pubkey) &&
              typeof user.about === "string"
            )
              return user;
          }),
          keyword
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
                      .includes(keyword?.toLowerCase())) ||
                    (typeof user.name === "string" &&
                      user.name
                        ?.toLowerCase()
                        .includes(keyword?.toLowerCase())) ||
                    (typeof user.nip05 === "string" &&
                      user.nip05
                        ?.toLowerCase()
                        .includes(keyword?.toLowerCase()))) &&
                  isHex(user.pubkey) &&
                  typeof user.about === "string"
                )
                  return user;
              }),
              keyword
            ).slice(0, 30),
          ];
        }
      }

      setUsers(filteredUsers);
      if (filteredUsers.length < 5) getUsersFromCache();
    };

    var timer = setTimeout(null);
    if (keyword) {
      timer = setTimeout(async () => {
        searchForUser();
      }, 100);
    } else {
      clearTimeout(timer);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [keyword]);

  return { users, isSearchLoading };
}
