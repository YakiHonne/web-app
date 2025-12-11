import bannedList from "@/Content/BannedList";
import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { getParsedAuthor } from "@/Helpers/Encryptions";
import { isHex, sortByKeyword } from "@/Helpers/Helpers";
import axios from "axios";
import { nip19 } from "nostr-tools";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function useSearchUsers(keyword) {
  const userKeys = useSelector((state) => state.userKeys);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userFollowings = useSelector((state) => state.userFollowings);
  const [users, setUsers] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const userFollowingsMetadata = useMemo(() => {
    return [...userFollowings, ...(userKeys ? [userKeys.pub] : [])]
      .map((_) => nostrAuthors.find((__) => __.pubkey === _))
      .filter((_) => _);
  }, [userKeys]);
  useEffect(() => {
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

  const getUsersFromCache = async () => {
    try {
      setIsSearchLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_CACHE_BASE_URL;
      let data = await axios.get(
        `${API_BASE_URL}/api/v1/users/search/${keyword}`
      );
      data = data.data;

      setUsers((prev) => {
        let tempData = [...prev, ...data];
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
  const searchForUser = async () => {
    let filteredUsers = [];
    let bareKeyword = keyword.replace("nostr:", "");
    let isEncoded =
      (bareKeyword.startsWith("npub") || bareKeyword.startsWith("nprofile")) &&
      bareKeyword.length > 30;
    if (isEncoded) {
      getUserByPubkey(bareKeyword);
      return;
    }
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
                user.nip05?.toLowerCase().includes(keyword?.toLowerCase()))) &&
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
      if (checkFollowings.length < 10) {
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
    if (filteredUsers.length < 10) getUsersFromCache();
  };
  const getUserByPubkey = async (keyword) => {
    let hexPubkey =
      nip19.decode(keyword).data?.pubkey || nip19.decode(keyword).data;
    let user = await saveUsers([hexPubkey]);
    if (user && user.length > 0) {
      setUsers([getParsedAuthor(user[0])]);
    } else {
      setUsers([]);
    }
  };

  return { users, isSearchLoading };
}
