import NDK, { NDKRelay, normalizeRelayUrl } from "@nostr-dev-kit/ndk";
import { SSGRelays, searchRelays } from "@/Content/Relays";
let ssgInstance;
let searchInstance;

const HINT_RELAY_TTL = 120000;
const HINT_RELAY_CONNECT_TIMEOUT = 1500;

const useHintRelays = async (instance, extRelays) => {
  if (!Array.isArray(extRelays) || extRelays.length === 0) return;
  let pending = [];
  for (let relay of extRelays) {
    try {
      let url = normalizeRelayUrl(`${relay}`);
      if (instance.explicitRelayUrls?.includes(url)) continue;
      let existing = instance.pool.relays.get(url);
      if (existing) {
        instance.pool.useTemporaryRelay(existing, HINT_RELAY_TTL);
        if (!existing.connected) pending.push(existing);
        continue;
      }
      let hintRelay = new NDKRelay(
        url,
        instance.relayAuthDefaultPolicy,
        instance,
      );
      instance.pool.useTemporaryRelay(hintRelay, HINT_RELAY_TTL);
      pending.push(hintRelay);
    } catch (err) {
      continue;
    }
  }
  if (pending.length === 0) return;
  await Promise.race([
    Promise.all(
      pending.map(
        (relay) =>
          new Promise((resolve) => {
            if (relay.connected) return resolve();
            relay.once("connect", resolve);
          }),
      ),
    ),
    new Promise((resolve) =>
      setTimeout(resolve, HINT_RELAY_CONNECT_TIMEOUT),
    ),
  ]);
};

export async function getSSGNdkInstance(extRelays = []) {
  if (!ssgInstance) {
    ssgInstance = new NDK({
      explicitRelayUrls: [...new Set(SSGRelays)],
    });
    ssgInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG ssgInstance)");
    });
  }
  await useHintRelays(ssgInstance, extRelays);
  if (ssgInstance.pool.status === "idle") {
    ssgInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG ssgInstance)");
    });
  }
  return ssgInstance;
}

export async function getSearchNdkInstance(extRelays = []) {
  if (!searchInstance) {
    searchInstance = new NDK({
      explicitRelayUrls: [...new Set(searchRelays)],
    });
    searchInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG searchInstance)");
    });
  }
  await useHintRelays(searchInstance, extRelays);
  if (searchInstance.pool.status === "idle") {
    searchInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG searchInstance)");
    });
  }
  return searchInstance;
}
