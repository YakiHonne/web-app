import {
  getSearchNdkInstance,
  getSSGNdkInstance,
} from "@/Helpers/SSGNDKInstance";
import { sortEvents } from "nostr-tools";
import { getAuthPubkeyFromNip05, sleepTimer } from "./Helpers";
import json from "@/nip05Names/nostr.json" assert { type: "json" };

export async function getDataForSSG(
  filter,
  timeout = 1000,
  maxEvents = 1,
  relays = [],
) {
  const ndkInstance = getSSGNdkInstance(relays);
  if (!filter || filter.length === 0) return { data: [], pubkeys: [] };
  let data = await launchDataFetching(filter, timeout, maxEvents, ndkInstance);
  return data;
}

export async function getDataForSearch(
  filter,
  timeout = 1000,
  maxEvents = 1,
  relays = [],
) {
  const ndkInstance = getSearchNdkInstance(relays);
  if (!filter || filter.length === 0) return { data: [], pubkeys: [] };
  let data = await Promise.race([
    launchDataFetching(filter, timeout, maxEvents, ndkInstance),
    sleepTimer(3000),
  ]);
  return data || { data: [], pubkeys: [] };
}

const launchDataFetching = async (
  filter,
  timeout = 1000,
  maxEvents = 1,
  ndkInstance,
) => {
  return new Promise((resolve) => {
    let events = [];
    let pubkeys = [];

    let filter_ = filter.map((_) => {
      let temp = { ..._ };
      if (!_["#t"]) {
        delete temp["#t"];
        return temp;
      }
      return temp;
    });

    if (!filter_ || filter_.length === 0) {
      resolve({ data: [], pubkeys: [] });
      return;
    }
    let sub = ndkInstance.subscribe(filter_, {
      groupable: false,
      // cacheUsage: "ONLY_RELAY",
    });
    let timer;
    const startTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        sub.stop();
        resolve({
          data: sortEvents(events),
          pubkeys: [...new Set(pubkeys)],
        });
      }, timeout);
    };

    sub.on("event", (event) => {
      if (events.length <= maxEvents) {
        pubkeys.push(event.pubkey);
        if (event.id) events.push(event.rawEvent());
        if (maxEvents === 1) {
          sub.stop();
          resolve({
            data: events,
            pubkeys: [...new Set(pubkeys)],
          });
        }
        startTimer();
      }
    });
    sub.on("eose", () => {
      if (events.length === 0) startTimer();
    });
  });
};

export const parseNip05 = async (userId) => {
  if (userId.includes("yakihonne.com")) {
    const name = userId.split("@")[0];
    if (json.names[name]) {
      return json.names[name];
    }
    return null;
  }
  let pubkey = await getAuthPubkeyFromNip05(userId);
  return pubkey;
};
