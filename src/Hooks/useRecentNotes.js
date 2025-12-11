import { getParsedNote } from "@/Helpers/ClientHelpers";
import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { filterContent } from "@/Helpers/Encryptions";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useRecentNotes(
  filter,
  contentFrom,
  since,
  selectedFilter,
  kind = "notes"
) {
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const [recentNotes, setRecentNotes] = useState([]);

  const getPubkey = (event) => {
    if (event.kind === 6) {
      try {
        let parsedNote = JSON.parse(event.content);
        return [...new Set([parsedNote.pubkey, event.pubkey])];
      } catch (err) {
        return false;
      }
    }
    return event.pubkey;
  };

  useEffect(() => {
    let notes = [];
    let pubkeys = [];
    let subscription;
    let isEose = false;
    let fetchData = () => {
      let ndk = filter.ndk || ndkInstance;
      subscription = ndk.subscribe(
        [{ ...filter.filter[0], since }],
        {
          groupable: false,
          skipValidation: true,
          skipVerification: true,
          relayUrls: filter.relays,
        },
        {
          onEvent(event) {
            if (
              [1, 6].includes(event.kind) &&
              event.content &&
              !userMutedList.includes(event.pubkey)
            ) {
              pubkeys.push(getPubkey(event));
              let parsedNote = getParsedNote(event);
              if (contentFrom !== "recent_with_replies") {
                if (!parsedNote.isComment) {
                  if (isEose) {
                    setRecentNotes((prev) => [
                      ...prev,
                      ...filterContent(selectedFilter, [parsedNote]),
                    ]);
                    if (pubkeys.length <= 3) {
                      saveUsers(pubkeys.slice(0, 3));
                    }
                  } else notes.push(parsedNote);
                }
              } else {
                if (isEose) {
                  setRecentNotes((prev) => [
                    ...prev,
                    ...filterContent(selectedFilter, [parsedNote]),
                  ]);
                } else notes.push(parsedNote);
              }
            }
          },
          onEose() {
            isEose = true;
            saveUsers(pubkeys.slice(0, 3));
            setRecentNotes((prev) => [
              ...prev,
              ...filterContent(selectedFilter, notes),
            ]);
          },
        }
      );
    };

    setRecentNotes([]);
    if (
      filter.filter.length > 0 &&
      typeof since !== "undefined" &&
      ["all", "notes"].includes(kind)
    ) {
      fetchData();
    }
    return () => {
      subscription && subscription.stop();
    };
  }, [since, contentFrom]);

  return { recentNotes };
}
// import { getParsedNote } from "@/Helpers/ClientHelpers";
// import { getSubData } from "@/Helpers/Controlers";
// import { saveUsers } from "@/Helpers/DB";
// import { filterContent } from "@/Helpers/Encryptions";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// export default function useRecentNotes(
//   filter,
//   contentFrom,
//   since,
//   selectedFilter,
//   kind = "notes"
// ) {
//   const { userMutedList } = useSelector((state) => state.userMutedList);
//   const [recentNotes, setRecentNotes] = useState([]);

//   const getPubkey = (event) => {
//     if (event.kind === 6) {
//       try {
//         let parsedNote = JSON.parse(event.content);
//         return [...new Set([parsedNote.pubkey, event.pubkey])];
//       } catch (err) {
//         return false;
//       }
//     }
//     return event.pubkey;
//   };

//   useEffect(() => {
//     let interval;
//     let newSince = since;
//     let pubkeys = [];
//     let isUsersSaved = false;
//     let fetchData = async () => {
//       let data = await getSubData(
//         [{ ...filter.filter[0], since: newSince }],
//         1000,
//         filter.relays,
//         filter.ndk
//       );
//       let filteredData = data.data.filter((_) => [1, 6].includes(_.kind));
//       if (filteredData.length > 0) {
//         let posts = filteredData
//           .map((_) => {
//             if (_.content) {
//               let parsedNote = getParsedNote(_);
//               if (contentFrom !== "recent_with_replies") {
//                 if (!parsedNote.isComment) {
//                   return parsedNote;
//                 }
//                 return false;
//               } else {
//                 return parsedNote;
//               }
//             }
//             return false;
//           })
//           .filter((_) => _ && !userMutedList.includes(_.pubkey));
//         posts = selectedFilter ? filterContent(selectedFilter, posts) : posts;
//         setRecentNotes((_) => [..._, ...posts]);
//         if (posts.length > 0) {
//           newSince = posts[0].created_at + 1;
//           pubkeys = [
//             ...new Set([
//               ...pubkeys,
//               ...filteredData.map((_) => getPubkey(_)).flat(),
//             ]),
//           ];
//           if (!isUsersSaved) {
//             saveUsers(pubkeys.slice(0, 3));
//             if (pubkeys.length > 3) {
//               isUsersSaved = true;
//               pubkeys = [];
//             }
//           }
//         }
//       }
//     };

//     setRecentNotes([]);
//     if (filter.filter.length > 0 && typeof since !== "undefined" && ["all", "notes"].includes(kind)) {
//       fetchData();
//       interval = setInterval(() => {
//         fetchData();
//       }, 5000);
//     }

//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [since, contentFrom]);

//   return { recentNotes };
// }
