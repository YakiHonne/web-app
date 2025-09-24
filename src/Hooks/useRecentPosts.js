import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { filterContent, getParsedRepEvent } from "@/Helpers/Encryptions";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useRecentPosts(filter, since, selectedFilter) {
  const userMutedList = useSelector((state) => state.userMutedList);
  const [recentNotes, setRecentNotes] = useState([]);

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
      if (data.data.length > 0) {
        let posts = data.data
          .map((_) => {
            if (_.content) {
              let parsedNote = getParsedRepEvent(_);
              return parsedNote;
            }
            return false;
          })
          .filter((_) => _ && !userMutedList.includes(_.pubkey));
        posts = filterContent(selectedFilter, posts);
        setRecentNotes((_) => [..._, ...posts]);
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

    setRecentNotes([]);
    if (filter.filter.length > 0 && typeof since !== "undefined") {
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
  //     setRecentNotes([]);
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
  //           if (parsedNote) setRecentNotes((prev) => [...prev, parsedNote]);
  //         }
  //       });
  //     }

  //     return () => {
  //       if (sub) sub.stop();
  //     };
  //   }, [since]);

  return { recentNotes };
}
