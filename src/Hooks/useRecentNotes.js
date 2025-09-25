import { getParsedNote } from "@/Helpers/ClientHelpers";
import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { filterContent } from "@/Helpers/Encryptions";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useRecentNotes(
  filter,
  contentFrom,
  since,
  selectedFilter
) {
  const userMutedList = useSelector((state) => state.userMutedList);
  const [recentNotes, setRecentNotes] = useState([]);

  const getPubkey = (event) => {
    if(event.kind === 6) {
      try {
        let parsedNote = JSON.parse(event.content);
        return [...new Set([parsedNote.pubkey, event.pubkey])];
      } catch(err) {
        return false;
      }
    }
    return event.pubkey;
  }

  useEffect(() => {
    let interval;
    let newSince = since;
    let pubkeys = [];
    let isUsersSaved = false;
    let fetchData = async () => {
      let data = await getSubData(
        [{ ...filter.filter[0], since: newSince }],
        1000,
        filter.relays,
        filter.ndk
      );
      if (data.data.length > 0) {
        let posts = data.data
          .map((_) => {
            if (_.content) {
              let parsedNote = getParsedNote(_);
              if (contentFrom !== "recent_with_replies") {
                if (!parsedNote.isComment) {
                  return parsedNote;
                }
                return false;
              } else {
                return parsedNote;
              }
            }
            return false;
          })
          .filter((_) => _ && !userMutedList.includes(_.pubkey));
        posts = filterContent(selectedFilter, posts);
        setRecentNotes((_) => [..._, ...posts]);
        if (posts.length > 0) {
          newSince = posts[0].created_at + 1;
          pubkeys = [...new Set([...pubkeys, ...data.data.map(_ => getPubkey(_)).flat()])];
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
  }, [since, contentFrom]);

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
