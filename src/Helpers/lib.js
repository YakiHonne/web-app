import {
  getSearchNdkInstance,
  getSSGNdkInstance,
  holdHintRelays,
  releaseHintRelays,
} from "@/Helpers/SSGNDKInstance";
import { nip19, sortEvents } from "nostr-tools";
import { getAuthPubkeyFromNip05, sleepTimer } from "./Helpers";
import { bannedListSet } from "@/Content/BannedList";
import axios from "axios";

export async function getDataForSSG(
  filter,
  timeout = 1000,
  maxEvents = 1,
  relays = [],
) {
  const { instance: ndkInstance, hintUrls } = await getSSGNdkInstance(relays);
  if (!filter || filter.length === 0) return { data: [], pubkeys: [] };
  holdHintRelays(ndkInstance, hintUrls);
  let data;
  try {
    data = await Promise.race([
      launchDataFetching(filter, timeout, maxEvents, ndkInstance, undefined, hintUrls),
      sleepTimer(Math.max(timeout, 1000) + 4000),
    ]);
  } finally {
    releaseHintRelays(ndkInstance, hintUrls);
  }
  return data || { data: [], pubkeys: [] };
}

export async function getDataForSearch(
  filter,
  timeout = 1000,
  maxEvents = 1,
  relays = [],
  onEvent,
) {
  const { instance: ndkInstance, hintUrls } = await getSearchNdkInstance(relays);
  if (!filter || filter.length === 0) return { data: [], pubkeys: [] };
  holdHintRelays(ndkInstance, hintUrls);
  let results;
  try {
    results = await Promise.all(
      filter.map((f) =>
        launchDataFetching([f], timeout, maxEvents, ndkInstance, onEvent, hintUrls),
      ),
    );
  } finally {
    releaseHintRelays(ndkInstance, hintUrls);
  }
  let seen = new Set();
  let data = [];
  let pubkeys = new Set();
  for (let result of results) {
    if (!result) continue;
    for (let event of result.data)
      if (!seen.has(event.id)) {
        seen.add(event.id);
        data.push(event);
      }
    for (let pubkey of result.pubkeys) pubkeys.add(pubkey);
  }
  return { data: sortEvents(data), pubkeys: [...pubkeys] };
}

const closeAbandonedRelaySubs = (ndkInstance) => {
  for (let relay of ndkInstance.pool.relays.values()) {
    let groups = relay.subs?.subscriptions;
    if (!groups) continue;
    for (let list of groups.values()) {
      for (let relaySub of [...list]) {
        if (relaySub.items.size > 0) continue;
        try {
          relaySub.close();
        } catch (err) {}
        try {
          relaySub.cleanup();
        } catch (err) {}
      }
    }
  }
};

const launchDataFetching = async (
  filter,
  timeout = 1000,
  maxEvents = 1,
  ndkInstance,
  onEvent,
  hintUrls = [],
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
    let relayUrls = [
      ...new Set([
        ...ndkInstance.pool.connectedRelays().map((relay) => relay.url),
        ...hintUrls,
      ]),
    ];
    if (relayUrls.length === 0) {
      resolve({ data: [], pubkeys: [] });
      return;
    }
    let sub = ndkInstance.subscribe(filter_, {
      groupable: false,
      relayUrls,
      // cacheUsage: "ONLY_RELAY",
    });
    const stopSub = () => {
      sub.stop();
      closeAbandonedRelaySubs(ndkInstance);
    };
    let timer;
    const startTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        stopSub();
        resolve({
          data: sortEvents(events),
          pubkeys: [...new Set(pubkeys)],
        });
      }, timeout);
    };

    startTimer();

    sub.on("event", (event) => {
      if (bannedListSet.has(event.pubkey)) return;
      if (events.length <= maxEvents) {
        pubkeys.push(event.pubkey);
        if (event.id) {
          let rawEvent = event.rawEvent();
          events.push(rawEvent);
          if (onEvent) {
            try {
              onEvent(rawEvent);
            } catch (err) {
              console.log(err);
            }
          }
        }
        if (maxEvents === 1) {
          if (timer) clearTimeout(timer);
          stopSub();
          resolve({
            data: events,
            pubkeys: [...new Set(pubkeys)],
          });
          return;
        }
        if (events.length > maxEvents) {
          if (timer) clearTimeout(timer);
          stopSub();
          resolve({
            data: sortEvents(events),
            pubkeys: [...new Set(pubkeys)],
          });
          return;
        }
        startTimer();
      }
    });
    sub.on("eose", () => {
      if (events.length === 0) startTimer();
    });
  });
};

const resolveSelfHostedNip05 = async (name) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/.well-known/nostr.json?name=${encodeURIComponent(name)}`,
      { timeout: 5000 },
    );
    const pubkey = data?.names?.[name];
    if (!pubkey) return null;
    return pubkey.startsWith("npub") ? nip19.decode(pubkey).data : pubkey;
  } catch (err) {
    return null;
  }
};

export const parseNip05 = async (userId) => {
  const appHost = process.env.NEXT_PUBLIC_APP_HOST;
  const [name, domain] = userId.split("@");

  if (appHost && domain && domain.toLowerCase() === appHost.toLowerCase()) {
    return await resolveSelfHostedNip05(name);
  }

  let pubkey = await getAuthPubkeyFromNip05(userId);
  return pubkey;
};
