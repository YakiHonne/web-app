import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { filterContent, getParsedRepEvent } from "@/Helpers/Encryptions";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useRecentPosts(filter, since, selectedFilter, kind = "posts") {
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    let interval;
    let newSince = since;
    let pubkeys = [];
    let isUsersSaved = false;
    let fetchData = async () => {
      let data = await getSubData(
        filter.filter.map((_) => {
          return {
            ..._,
            since: newSince,
          };
        }),
        1000,
        filter.relays,
        filter.ndk
      );
      let filteredData = data.data.filter((_) => ![1, 6].includes(_.kind));
      if (filteredData.length > 0) {
        let posts = filteredData
          .map((_) => {
            if (_.content) {
              let parsedNote = getParsedRepEvent(_);
              return parsedNote;
            }
            return false;
          })
          .filter((_) => _ && !userMutedList.includes(_.pubkey));
        posts = selectedFilter ? filterContent(selectedFilter, posts) : posts;
        setRecentPosts((_) => [..._, ...posts]);
        if (posts.length > 0) {
          newSince = posts[0].created_at + 1;
          pubkeys = [...new Set([...pubkeys, ...data.pubkeys])];
          if (!isUsersSaved) {
            saveUsers(pubkeys.slice(0, 3));
            if (pubkeys.length > 3) {
              isUsersSaved = true;
              pubkeys = [];
            }
          }
        }
      }
    };

    setRecentPosts([]);
    if (filter.filter.length > 0 && typeof since !== "undefined" && kind !== "notes") {
      fetchData();
      interval = setInterval(() => {
        fetchData();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [since]);

  //   useEffect(() => {
  //     let sub;
  //     setRecentPosts([]);
  //     if (filter.filter.length > 0 && typeof since !== "undefined") {
  //       sub = ndkInstance.subscribe([{ ...filter.filter[0], since }], {
  //         relayUrls:
  //           filter.relays.length > 0
  //             ? filter.relays
  //             : [...new Set([...userRelays, ...relaysOnPlatform])],
  //       });
  //       sub.on("event", (event) => {
  //         if (!userMutedList.includes(event.pubkey)) {
  //           let parsedNote = getParsedNote(event.rawEvent());
  //           if (parsedNote) setRecentPosts((prev) => [...prev, parsedNote]);
  //         }
  //       });
  //     }

  //     return () => {
  //       if (sub) sub.stop();
  //     };
  //   }, [since]);

  return { recentPosts };
}
