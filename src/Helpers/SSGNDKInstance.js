import NDK, { NDKRelay, normalizeRelayUrl } from "@nostr-dev-kit/ndk";
import { SSGRelays, searchRelays } from "@/Content/Relays";
let ssgInstance;
let searchInstance;

const HINT_RELAY_TTL = 30000;

const useHintRelays = (instance, extRelays) => {
  if (!Array.isArray(extRelays) || extRelays.length === 0) return;
  for (let relay of extRelays) {
    try {
      let url = normalizeRelayUrl(`${relay}`);
      if (instance.explicitRelayUrls?.includes(url)) continue;
      let hintRelay = new NDKRelay(
        url,
        instance.relayAuthDefaultPolicy,
        instance,
      );
      instance.pool.useTemporaryRelay(hintRelay, HINT_RELAY_TTL);
    } catch (err) {
      continue;
    }
  }
};

export function getSSGNdkInstance(extRelays = []) {
  if (!ssgInstance) {
    ssgInstance = new NDK({
      explicitRelayUrls: [...new Set(SSGRelays)],
    });
    ssgInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG ssgInstance)");
    });
  }
  useHintRelays(ssgInstance, extRelays);
  if (ssgInstance.pool.status === "idle") {
    ssgInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG ssgInstance)");
    });
  }
  return ssgInstance;
}

export function getSearchNdkInstance(extRelays = []) {
  if (!searchInstance) {
    searchInstance = new NDK({
      explicitRelayUrls: [...new Set(searchRelays)],
    });
    searchInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG searchInstance)");
    });
  }
  useHintRelays(searchInstance, extRelays);
  if (searchInstance.pool.status === "idle") {
    searchInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG searchInstance)");
    });
  }
  return searchInstance;
}
