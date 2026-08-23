import {
  getSearchNdkInstance,
  getSSGNdkInstance,
} from "@/Helpers/SSGNDKInstance";
import { nip19, sortEvents } from "nostr-tools";
import { getAuthPubkeyFromNip05, sleepTimer } from "./Helpers";
import axios from "axios";

export async function getDataForSSG(
  filter,
  timeout = 1000,
  maxEvents = 1,
  relays = [],
) {
  const ndkInstance = await getSSGNdkInstance(relays);
  if (!filter || filter.length === 0) return { data: [], pubkeys: [] };
  let data = await Promise.race([
    launchDataFetching(filter, timeout, maxEvents, ndkInstance),
    sleepTimer(Math.max(timeout, 1000) + 4000),
  ]);
  return data || { data: [], pubkeys: [] };
}

export async function getDataForSearch(
  filter,
  timeout = 1000,
  maxEvents = 1,
  relays = [],
) {
  const ndkInstance = await getSearchNdkInstance(relays);
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

    startTimer();

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
