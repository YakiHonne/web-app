import Dexie from "dexie";
import {
  aggregateUsers,
  getFavRelayList,
  getNostrClients,
  getRelayList,
  getSubData,
} from "./Controlers";
import {
  getEmptyEventStats,
  getEmptyuserMetadata,
  getParsedAuthor,
  sortEvents,
} from "./Encryptions";
import { store } from "@/Store/Store";
import { getRelayListForUser } from "@nostr-dev-kit/ndk";
import { ndkInstance } from "./NDKInstance";

let db = null;
let ndkdb = null;
if (typeof window !== "undefined") {
  db = new Dexie("yaki-nostr-2");
  ndkdb = new Dexie("ndk-store");

  ndkdb.version(1).stores({
    events: "",
  });

  db.version(2).stores({
    chatrooms: "",
    muted: "",
    interests: "",
    followings: "",
    followingsRelays: "",
    followingsInboxRelays: "",
    appSettings: "",
    relays: "",
    inboxRelays: "",
    favrelays: "",
    bookmarks: "",
    users: "",
    clients: "",
    eventStats: "",
    wot: "",
    blossomServers: "",
    notificationLastEventTS: "",
  });
}
export { db, ndkdb };

export const getChatrooms = async (pubkey) => {
  if (db) {
    try {
      let chatroomsKeys = await db
        .table("chatrooms")
        .filter((item) => item)
        .primaryKeys();
      chatroomsKeys = chatroomsKeys.filter((item) =>
        item.includes(`,${pubkey}`)
      );
      let chatrooms = await db.table("chatrooms").bulkGet(chatroomsKeys);

      return chatrooms
        ? chatrooms.sort(
            (convo_1, convo_2) => convo_2.last_message - convo_1.last_message
          )
        : [];
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getFollowings = async (pubkey) => {
  if (db) {
    try {
      let followings = await db.table("followings").get(pubkey);
      return followings || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};
export const getInterestsList = async (pubkey) => {
  if (db) {
    try {
      let interests = await db.table("interests").get(pubkey);
      return interests || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getMutedlist = async (pubkey) => {
  if (db) {
    try {
      let mutedlist = await db.table("muted").get(pubkey);
      return mutedlist || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};
export const getWotlist = async (pubkey) => {
  if (db) {
    try {
      let wotList = await db.table("wot").get(pubkey);
      return wotList || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getNotificationLastEventTS = async (pubkey) => {
  if (db) {
    try {
      let mutedlist = await db.table("notificationLastEventTS").get(pubkey);
      return mutedlist || undefined;
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getRelays = async (pubkey) => {
  if (db) {
    try {
      let relays = await db.table("relays").get(pubkey);
      return relays || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};
export const getInboxRelays = async (pubkey) => {
  if (db) {
    try {
      let inboxRelays = await db.table("inboxRelays").get(pubkey);
      return inboxRelays || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};
export const getBlossomServers = async (pubkey) => {
  if (db) {
    try {
      let blossomServers = await db.table("blossomServers").get(pubkey);
      return blossomServers || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};
export const getFavRelays = async (pubkey) => {
  if (db) {
    try {
      let relays = await db.table("favrelays").get(pubkey);
      return relays || { relays: [] };
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getAppSettings = async (pubkey) => {
  if (db) {
    try {
      let settings = await db.table("appSettings").get(pubkey);
      return settings || undefined;
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getBookmarks = async (pubkey) => {
  if (db) {
    try {
      let bookmarks = await db.table("bookmarks").get(pubkey);

      return bookmarks || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getUserDDB = async (pubkey) => {
  if (db) {
    try {
      let user = await db.table("users").get(pubkey);

      return user || getEmptyuserMetadata(pubkey);
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getUsers = async () => {
  if (db) {
    try {
      let users = await db.table("users").toArray();

      return users;
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};
export const getClients = async () => {
  if (db) {
    try {
      let clients = await db.table("clients").toArray();
      return clients;
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getFollowingsRelays = async () => {
  if (db) {
    try {
      let followingsRelays = await db.table("followingsRelays").toArray();
      return followingsRelays;
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const getFollowingsInboxRelays = async () => {
  if (db) {
    try {
      let followingsInboxRelays = await db
        .table("followingsInboxRelays")
        .toArray();
      return followingsInboxRelays;
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};
export const getEventStats = async (event_id) => {
  if (db) {
    try {
      let user = await db.table("eventStats").get(event_id);

      return user || getEmptyEventStats(event_id);
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};
export const saveChatrooms = async (inbox, authors, pubkey) => {
  if (db) {
    let usersPubkeys = inbox.map((inbox) => inbox.pubkey);
    saveUsers(usersPubkeys);
    let oldAggregatedchatrooms = await getChatrooms(pubkey);
    let sortedInbox = aggregateUsers(inbox, oldAggregatedchatrooms, pubkey);
    const chatroomData = sortedInbox.map((ibx) => ({
      ...ibx,
    }));
    const chatroomKeys = sortedInbox.map((ibx) => `${ibx.pubkey},${pubkey}`);
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.chatrooms, async () => {
          await db.chatrooms.bulkPut(chatroomData, chatroomKeys);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
export const checkCurrentConvo = async (convo, pubkey) => {
  if (db) {
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.chatrooms, async () => {
          await db.chatrooms.put(convo, `${convo.pubkey},${pubkey}`);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
export const checkAllConvo = async (convos, pubkey) => {
  if (db) {
    try {
      const chatroomKeys = convos.map((ibx) => `${ibx.pubkey},${pubkey}`);
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.chatrooms, async () => {
          await db.chatrooms.bulkPut(convos, chatroomKeys);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveFollowings = async (event, pubkey, lastTimestamp) => {
  if (db) {
    if (!event && lastTimestamp) return;
    let eventToStore = { last_timestamp: undefined, followings: [] };

    if (event) {
      let followings = event.tags
        .filter((tag) => tag[0] === "p")
        .map((tag) => tag[1]);
      eventToStore = { last_timestamp: event.created_at, followings };
    }

    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.followings, async () => {
          await db.followings.put(eventToStore, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveInterests = async (event, pubkey, lastTimestamp) => {
  if (db) {
    if (!event && lastTimestamp) return;
    let eventToStore = { last_timestamp: undefined, interestsList: [] };

    if (event) {
      let interestsList = event.tags
        .filter((tag) => tag[0] === "t")
        .map((tag) => tag[1]);
      eventToStore = { last_timestamp: event.created_at, interestsList };
    }

    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.interests, async () => {
          await db.interests.put(eventToStore, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
export const saveBlossomServers = async (event, pubkey, lastTimestamp) => {
  if (db) {
    if (!event && lastTimestamp) return;
    let eventToStore = { last_timestamp: undefined, servers: [] };

    if (event) {
      let servers = event.tags
        .filter(
          (tag) =>
            tag[0] === "server" &&
            (tag[1].startsWith("http://") || tag[1].startsWith("https://"))
        )
        .map((tag) => tag[1]);
      eventToStore = { last_timestamp: event.created_at, servers };
    }

    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.blossomServers, async () => {
          await db.blossomServers.put(eventToStore, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const savefollowingsRelays = async (followingsRelays) => {
  if (db) {
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.followingsRelays, async () => {
          for (let relaysSet of followingsRelays)
            await db.followingsRelays.put(relaysSet, relaysSet.pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
export const savefollowingsInboxRelays = async (followingsRelays) => {
  if (db) {
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.followingsInboxRelays, async () => {
          for (let relaysSet of followingsRelays)
            await db.followingsInboxRelays.put(relaysSet, relaysSet.pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveMutedlist = async (event, pubkey, lastTimestamp) => {
  if (db) {
    if (!event && lastTimestamp) return;
    let eventToStore = { last_timestamp: undefined, mutedlist: [] };
    if (event) {
      let mutedlist = event.tags
        .filter((tag) => tag[0] === "p")
        .map((tag) => tag[1]);
      eventToStore = { last_timestamp: event.created_at, mutedlist };
    }

    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.muted, async () => {
          await db.muted.put(eventToStore, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
export const saveWotlist = async (list, pubkey) => {
  if (db) {
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.wot, async () => {
          await db.wot.put(list, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveRelays = async (event, pubkey, lastTimestamp) => {
  if (db) {
    if (!event && lastTimestamp) return;
    let eventToStore = { last_timestamp: undefined, relays: [] };
    if (event) {
      let relays = getRelayList(event.tags);
      eventToStore = { last_timestamp: event.created_at, relays };
    }

    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.relays, async () => {
          await db.relays.put(eventToStore, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
export const saveInboxRelays = async (event, pubkey, lastTimestamp) => {
  if (db) {
    if (!event && lastTimestamp) return;
    let eventToStore = { last_timestamp: undefined, relays: [] };
    if (event) {
      let relays = event.tags
        .filter((tag) => tag[0] === "relay")
        .map((tag) => tag[1]);
      eventToStore = { last_timestamp: event.created_at, relays };
    }

    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.inboxRelays, async () => {
          await db.inboxRelays.put(eventToStore, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
export const saveFavRelays = async (event, pubkey, lastTimestamp) => {
  if (db) {
    if (!event && lastTimestamp) return;
    let eventToStore = { last_timestamp: undefined, relays: [] };
    if (event) {
      let relays = getFavRelayList(event.tags);
      eventToStore = { last_timestamp: event.created_at, ...event, relays };
    }
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.favrelays, async () => {
          await db.favrelays.put(eventToStore, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveBookmarks = async (bookmarks, pubkey) => {
  if (db) {
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.bookmarks, async () => {
          await db.bookmarks.put(bookmarks, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
export const saveAppSettings = async (event, pubkey, lastTimestamp) => {
  if (db) {
    try {
      if (!event) return;
      let eventToStore = {
        last_timestamp: undefined,
        settings: JSON.parse(event.content),
      };
      if (event) {
        eventToStore = {
          last_timestamp: event.created_at,
          settings: JSON.parse(event.content),
        };
      }
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.appSettings, async () => {
          await db.appSettings.put(eventToStore, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveUsers = async (pubkeys) => {
  if (db) {
    try {
      let BASE_URL = process.env.NEXT_PUBLIC_API_CACHE_BASE_URL;
      const users_pubkeys = [...new Set(pubkeys)];
      const data = await getSubData(
        [{ kinds: [0], authors: users_pubkeys }],
        400
      );
      let users = data.data;
      if (users.length === 0) return;

      let res = sortEvents(users);
      res = res
        .filter((item, index, res) => {
          if (res.findIndex((_) => _.pubkey === item.pubkey) === index)
            return item;
        })
        .map((user) => {
          try {
            let _ = getParsedAuthor(user);
            if (_) return _;
            else return false;
          } catch (err) {
            return false;
          }
        })
        .filter((_) => _);

      // let data = await axios.post(BASE_URL + "/api/v1/users", {
      //   users_pubkeys,
      // });
      // let res = data.data;
      Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.users, async () => {
          for (let metadata of res)
            await db.users.put(metadata, metadata.pubkey);
        });
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  }
};

export const clearDB = () => {
  if (db) {
    try {
      if (db) {
        db.tables.forEach((table) => {
          if (
            ![
              "users",
              "eventStats",
              "notificationLastEventTS",
              "clients",
            ].includes(table.name)
          )
            table.clear();
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
};
export const clearDBCache = async () => {
  if (db) {
    try {
      if (db) {
        db.tables.forEach(async (table) => {
          if (["users", "eventStats"].includes(table.name)) await table.clear();
        });
      }
      if (ndkdb) {
        await Dexie.delete(ndkdb.name);
        // ndkdb.tables.forEach(async (table) => {
        //   await table.clear();
        // });
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
};

export const removeRecordFromNDKStore = async (id) => {
  if (ndkdb) {
    try {
      if (ndkdb) {
        await ndkdb.open();
        await ndkdb.events.delete(id);
      }
    } catch (err) {
      console.log(err);
    }
  }
};
export const removeEventStats = async (main_event_id, event_id, kind) => {
  if (db) {
    try {
      let event = await getEventStats(main_event_id);
      let tempEventStats = { ...event };
      tempEventStats[kind][kind] = tempEventStats[kind][kind].filter(
        (_) => _.id !== event_id
      );
      saveEventStats(main_event_id, tempEventStats);
    } catch (err) {
      console.log(err);
    }
  }
};

export const getOutboxRelays = async (pubkey) => {
  if (db) {
    try {
      const store_ = store.getState();
      const userFollowingsRelays = store_.userFollowingsRelays;
      let relays = userFollowingsRelays.find((item) => item.pubkey === pubkey);
      if (relays) {
        return relays.relays
          .filter((relay) => relay.read)
          .map((relay) => relay.url)
          .splice(0, 2);
      }

      let userRelaysFromNOSTR = await getRelayListForUser(pubkey, ndkInstance);

      if (userRelaysFromNOSTR) {
        let relaysList = getRelayList(userRelaysFromNOSTR.tags);
        savefollowingsRelays([{ pubkey, relays: relaysList }]);
        return relaysList
          .filter((relay) => relay.read)
          .map((relay) => relay.url)
          .splice(0, 2);
      }
      return [];
    } catch (err) {
      console.log(err);
    }
  }
};

export const getInboxRelaysForUser = async (pubkey) => {
  if (db) {
    try {
      const store_ = store.getState();
      const userFollowingsInboxRelays = store_.userFollowingsInboxRelays;
      let relays = userFollowingsInboxRelays.find(
        (item) => item.pubkey === pubkey
      );
      if (relays) {
        return relays.relays;
      }

      let userRelaysFromNOSTR = await getSubData([
        { kinds: [10050], authors: [pubkey] },
      ]);

      if (userRelaysFromNOSTR.data.length > 0) {
        let relaysList = userRelaysFromNOSTR.data[0].tags
          .filter((_) => _[0] === "relay")
          .map((_) => _[1]);
        savefollowingsInboxRelays([{ pubkey, relays: relaysList }]);
        return relaysList;
      }
      return [];
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveFetchedUsers = async (profiles) => {
  if (db) {
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.users, async () => {
          for (let metadata of profiles)
            await db.users.put(metadata, metadata.pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveNostrClients = async () => {
  if (db) {
    try {
      let cachedClients = await getClients();
      let sortedClients = cachedClients.sort(
        (client_1, client_2) => client_1.created_at - client_2.created_at
      );
      let until = undefined;
      if (sortedClients.length > 0) until = sortedClients[0];

      let clients = await getNostrClients(until);

      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.clients, async () => {
          for (let client of clients)
            await db.clients.put(client, client.pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveEventStats = async (event_id, stats) => {
  if (db) {
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.eventStats, async () => {
          await db.eventStats.put(stats, event_id);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const saveNotificationLastEventTS = async (pubkey, timstamp) => {
  if (db) {
    try {
      await Dexie.ignoreTransaction(async () => {
        await db.transaction("rw", db.notificationLastEventTS, async () => {
          await db.notificationLastEventTS.put(timstamp, pubkey);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
};
