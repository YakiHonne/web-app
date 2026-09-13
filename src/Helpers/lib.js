import {
  getHintRelayObjects,
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

/**
 * NDK 2.18.1 retains an NDKRelaySubscription forever when the relay never
 * EOSEs. `removeItem()` empties `items`, then bails on `if (!this.eosed)
 * return;` without calling `cleanup()` -- and `cleanup()` is the only caller of
 * `onClose`, which is the only thing that removes the entry from the per-relay
 * `subs.subscriptions` Map. Dead and slow relays (what crawler traffic hits
 * constantly) therefore accumulate one retained relay-sub per abandoned query.
 *
 * The Map lives on the relay object, not on the pool, so the sweep must also
 * cover hint relays that the TTL has parked out of `pool.relays` -- otherwise
 * whatever they are still holding becomes permanently unreachable.
 */
const closeAbandonedRelaySubs = (ndkInstance) => {
  let relays = [
    ...ndkInstance.pool.relays.values(),
    ...getHintRelayObjects(ndkInstance),
  ];
  let seen = new Set();
  for (let relay of relays) {
    if (!relay || seen.has(relay)) continue;
    seen.add(relay);
    let groups = relay.subs?.subscriptions;
    if (!groups) continue;
    for (let [fingerprint, list] of [...groups.entries()]) {
      let live = [];
      for (let relaySub of [...list]) {
        if (relaySub.items.size > 0) {
          live.push(relaySub);
          continue;
        }
        try {
          relaySub.close();
        } catch (err) {}
        try {
          relaySub.cleanup();
        } catch (err) {}
      }
      // `cleanup()` only unlinks the entry when NDK's own onClose hook is
      // still attached; drop anything it left behind so the Map cannot grow.
      let remaining = groups.get(fingerprint);
      if (!remaining) continue;
      if (live.length === 0) groups.delete(fingerprint);
      else if (remaining.length !== live.length) groups.set(fingerprint, live);
    }
  }
};

/**
 * `ndk.subscribe()` defers `subscription.start()` into a `setTimeout(..., 0)`,
 * and `start()` has no stopped-guard. A subscription we stop synchronously --
 * or before that timer fires -- still goes on to build a fresh
 * NDKRelaySubscription that nothing will ever close. Stopping the subscription
 * *and* neutering its `start` closes that window.
 */
const stopSubscription = (sub) => {
  if (!sub) return;
  try {
    sub.start = () => null;
  } catch (err) {}
  try {
    sub.stop();
  } catch (err) {}
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
      stopSubscription(sub);
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
