import { useState, useEffect } from "react";
import { getSubData } from "@/Helpers/Controlers";
import {
  getEmptyEventStats,
  getWOTScoreForPubkeyLegacy,
  getZapper,
  removeObjDuplicants,
} from "@/Helpers/Encryptions";
import { getEventStats, saveEventStats } from "@/Helpers/DB";
import { useLiveQuery } from "dexie-react-hooks";
import { getWotConfig } from "@/Helpers/ClientHelpers";

const filterStatsByWot = (stats) => {
  const { score, reactions } = getWotConfig();
  return {
    likes: {
      likes: stats.likes.likes.filter((like) => {
        let scoreStatus = getWOTScoreForPubkeyLegacy(
          like.pubkey,
          reactions,
          score
        );
        if (scoreStatus.status) return true;
      }),
      since: stats.likes.since,
    },
    reposts: {
      reposts: stats.reposts.reposts.filter((repost) => {
        if (getWOTScoreForPubkeyLegacy(repost.pubkey, reactions, score).status)
          return true;
      }),
      since: stats.reposts.since,
    },
    replies: {
      replies: stats.replies.replies.filter((reply) => {
        if (getWOTScoreForPubkeyLegacy(reply.pubkey, reactions, score).status)
          return true;
      }),
      since: stats.replies.since,
    },
    quotes: {
      quotes: stats.quotes.quotes.filter((quote) => {
        if (getWOTScoreForPubkeyLegacy(quote.pubkey, reactions, score).status)
          return true;
      }),
      since: stats.quotes.since,
    },
    zaps: {
      ...stats.zaps,
    },
  };
};

const useNoteStats = (noteID, notePubkey) => {
  const [isLoading, setIsLoading] = useState(true);
  const postActions =
    useLiveQuery(async () => {
      let stats = noteID ? await getEventStats(noteID) : getEmptyEventStats("");
      let filteredStats = filterStatsByWot(stats);

      return filteredStats;
    }, [noteID]) || getEmptyEventStats("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let actions = await getEventStats(noteID);

        let kind1 = [];
        let kind1_ = [];
        let kind7 = [];
        let kind6 = [];
        let kind9735 = [];
        let kind1Since = actions.replies.since;
        let kind1_Since = actions.quotes.since;
        let kind7Since = actions.likes.since;
        let kind6Since = actions.reposts.since;
        let kind9735Since = actions.zaps.since;
        let kind9735_ = 0;

        const response = await getSubData([
          {
            kinds: [7],
            "#e": [noteID],
            since: actions.likes.since,
          },
          {
            kinds: [6],
            "#e": [noteID],
            since: actions.reposts.since,
          },
          {
            kinds: [1],
            "#q": [noteID],
            since: actions.quotes.since,
          },
          {
            kinds: [1],
            "#e": [noteID],
            since: actions.replies.since,
          },
          {
            kinds: [9735],
            "#p": [notePubkey],
            "#e": [noteID],
            since: actions.zaps.since,
          },
        ]);
        for (let event of response.data) {
          if (event.kind === 9735) {
            let zapper = getZapper(event);
            if (zapper) {
              let sats = zapper.amount;
              if (!kind9735Since || kind9735Since < event.created_at) {
                kind9735Since = event.created_at;
              }
              kind9735.push({
                id: zapper.id,
                pubkey: zapper.pubkey,
                content: zapper.message,
                amount: sats,
              });
              kind9735_ = kind9735_ + sats;
            }
          }
          if (event.kind === 7) {
            if (!kind7Since || kind7Since < event.created_at)
              kind7Since = event.created_at;
            let content = !event.content.includes(":")
              ? event.content
              : (event.tags.find((tag) => `:${tag[1]}:` === event.content) ||
                  [])[2] || "+";
            let checkValid7 = event.tags.find(
              (tag) => tag[0] === "e" && tag[1] === noteID
            );
            checkValid7 =
              checkValid7.length > 3
                ? checkValid7[3].length >= 32
                  ? true
                  : false
                : true;
            let checkRedundant7 = kind7.find((_) => _.pubkey === event.pubkey);
            if (checkValid7 && !checkRedundant7)
              kind7.push({ id: event.id, pubkey: event.pubkey, content });
          }
          if (event.kind === 6) {
            if (!kind6Since || kind6Since < event.created_at)
              kind6Since = event.created_at;
            kind6.push({ id: event.id, pubkey: event.pubkey });
          }
          if (event.kind === 1) {
            let check_kind1 = {
              isQuote: event.tags.find((tag) => tag[0] === "q"),
              isComment: event.tags.find(
                (tag) =>
                  tag.length > 3 &&
                  tag[1] === noteID &&
                  ["root", "reply"].includes(tag[3])
              ),
            };
            if (
              check_kind1.isQuote &&
              check_kind1.isQuote[1] === noteID &&
              !check_kind1.isComment
            ) {
              if (!kind1_Since || kind1_Since < event.created_at)
                kind1_Since = event.created_at;
              kind1_.push({ id: event.id, pubkey: event.pubkey });
            }
            if (check_kind1.isComment) {
              if (!kind1Since || kind1Since < event.created_at)
                kind1Since = event.created_at;
              kind1.push({ id: event.id, pubkey: event.pubkey });
            }
          }
        }
        let stats = {
          event_id: noteID,
          likes: {
            likes: removeObjDuplicants(actions.likes.likes, kind7),
            since: kind7Since ? kind7Since + 1 : undefined,
          },
          reposts: {
            reposts: removeObjDuplicants([
              ...actions.reposts.reposts,
              ...kind6,
            ]),
            since: kind6Since ? kind6Since + 1 : undefined,
          },
          replies: {
            replies: removeObjDuplicants([
              ...actions.replies.replies,
              ...kind1,
            ]),
            since: kind1Since ? kind1Since + 1 : undefined,
          },
          quotes: {
            quotes: removeObjDuplicants([...actions.quotes.quotes, ...kind1_]),
            since: kind1_Since ? kind1_Since + 1 : undefined,
          },
          zaps: {
            total: actions.zaps.total + kind9735_,
            zaps: removeObjDuplicants([...actions.zaps.zaps, ...kind9735]),
            since: kind9735Since ? kind9735Since + 1 : undefined,
          },
        };

        saveEventStats(noteID, stats);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (noteID) fetchData();
  }, [noteID]);

  return { postActions, isLoading };
};

export default useNoteStats;
