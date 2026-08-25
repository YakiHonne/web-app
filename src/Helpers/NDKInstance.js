import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { relaysOnPlatform } from "@/Content/Relays";
import bannedList from "@/Content/BannedList";
import { relayConnectionFilter } from "@/Helpers/utils/relayConnectionFilter";

const ndkInstance = new NDK({
  explicitRelayUrls: relaysOnPlatform,
  enableOutboxModel: true,
  relayConnectionFilter,
  muteFilter: (event) => {
    if (bannedList.includes(event.pubkey)) return true;
    return false;
  },
  // mutedIds: new Map([bannedList.map((p) => [p, "p"])]),
});

if (typeof window !== "undefined") {
  ndkInstance.cacheAdapter = new NDKCacheAdapterDexie({
    dbName: "ndk-store",
    expirationTime: 3600 * 24 * 7,
    profileCacheSize: 200,
  });
}
const HEX_64 = /^[0-9a-f]{64}$/;
const HEX_FILTER_FIELDS = ["authors", "ids", "#p", "#e", "#P", "#E"];

const isValidHexKey = (value) =>
  typeof value === "string" && HEX_64.test(value.toLowerCase());

const sanitizeNdkFilters = (filters) => {
  const asArray = Array.isArray(filters) ? filters : [filters];
  const cleaned = asArray
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const next = { ...entry };
      for (const field of HEX_FILTER_FIELDS) {
        if (!Array.isArray(next[field])) continue;
        const values = next[field]
          .filter(isValidHexKey)
          .map((value) => value.toLowerCase());
        if (values.length === 0) return null;
        next[field] = values;
      }
      return next;
    })
    .filter(Boolean);
  return Array.isArray(filters) ? cleaned : cleaned[0];
};

const originalSubscribe = ndkInstance.subscribe.bind(ndkInstance);
ndkInstance.subscribe = (filters, ...rest) => {
  const safeFilters = sanitizeNdkFilters(filters);
  const isEmpty = Array.isArray(safeFilters)
    ? safeFilters.length === 0
    : !safeFilters;
  if (isEmpty) {
    return originalSubscribe(
      [{ ids: ["0".repeat(64)], limit: 0 }],
      ...rest,
    );
  }
  return originalSubscribe(safeFilters, ...rest);
};

ndkInstance.connect(1000).catch(() => {});

export { ndkInstance };

export const addExplicitRelays = (relayList) => {
  try {
    if (!Array.isArray(relayList)) return;
    let tempRelayList = relayList.filter(
      (relay) => !ndkInstance.explicitRelayUrls.includes(`${relay}`),
    );
    if (tempRelayList.length === 0) return;
    for (let relay of tempRelayList) {
      ndkInstance.addExplicitRelay(relay, undefined, true);
    }
  } catch (err) {
    console.log(err);
  }
};
