import NDK, { NDKRelay, normalizeRelayUrl } from "@nostr-dev-kit/ndk";
import { SSGRelays, searchRelays } from "@/Content/Relays";
let ssgInstance;
let searchInstance;

const HINT_RELAY_TTL = 60000;
const HINT_RELAY_CONNECT_TIMEOUT = 1500;
const MAX_HINT_RELAYS = 64;

const MAX_FLAPPING_BACKOFF = 300000;

const hintRelayCaches = new WeakMap();

const boundedPools = new WeakSet();

const boundFlappingBackoff = (instance) => {
  let pool = instance.pool;
  if (!pool || boundedPools.has(pool)) return;
  if (typeof pool.handleFlapping !== "function") {
    console.warn("[NDK] handleFlapping is missing, flapping backoff is unbounded");
    return;
  }
  if (typeof pool.removeRelay !== "function") {
    console.warn("[NDK] removeRelay is missing, flapping timers are not cleared");
    return;
  }
  boundedPools.add(pool);
  let flappingTimers = new Map();
  pool.handleFlapping = function (relay) {
    let backoff = this.backoffTimes.get(relay.url) || 5000;
    backoff = Math.min(backoff * 2, MAX_FLAPPING_BACKOFF);
    this.backoffTimes.set(relay.url, backoff);
    let existing = flappingTimers.get(relay.url);
    if (existing) clearTimeout(existing);
    flappingTimers.set(
      relay.url,
      setTimeout(() => {
        flappingTimers.delete(relay.url);
        this.emit("relay:connecting", relay);
        relay.connect();
        this.checkOnFlappingRelays();
      }, backoff),
    );
    relay.disconnect();
    this.emit("flapping", relay);
  };
  let originalRemoveRelay = pool.removeRelay.bind(pool);
  pool.removeRelay = function (relayUrl) {
    let flappingTimer = flappingTimers.get(relayUrl);
    if (flappingTimer) {
      clearTimeout(flappingTimer);
      flappingTimers.delete(relayUrl);
    }
    let temporaryTimer = this.temporaryRelayTimers?.get(relayUrl);
    if (temporaryTimer) {
      clearTimeout(temporaryTimer);
      this.temporaryRelayTimers.delete(relayUrl);
    }
    return originalRemoveRelay(relayUrl);
  };
};

const getHintCache = (instance) => {
  let cache = hintRelayCaches.get(instance);
  if (!cache) {
    cache = { relays: new Map(), timers: new Map(), inFlight: new Map() };
    hintRelayCaches.set(instance, cache);
  }
  return cache;
};

const parkHintRelay = (instance, cache, url) => {
  if ((cache.inFlight.get(url) || 0) > 0) return;
  let timer = cache.timers.get(url);
  if (timer) clearTimeout(timer);
  cache.timers.delete(url);
  let relay = cache.relays.get(url);
  if (!relay) return;
  try {
    instance.pool.removeRelay(url);
  } catch (err) {}
  try {
    relay.disconnect();
  } catch (err) {}
  try {
    relay.connectivity?.resetReconnectionState?.();
  } catch (err) {}
  try {
    relay.connectivity?.keepalive?.stop?.();
  } catch (err) {}
};

const dropHintRelay = (instance, cache, url) => {
  if ((cache.inFlight.get(url) || 0) > 0) return;
  let timer = cache.timers.get(url);
  if (timer) clearTimeout(timer);
  cache.timers.delete(url);
  let relay = cache.relays.get(url);
  cache.relays.delete(url);
  if (!relay) return;
  try {
    instance.pool.removeRelay(url);
  } catch (err) {}
  try {
    relay.disconnect();
  } catch (err) {}
  try {
    relay.connectivity?.resetReconnectionState?.();
  } catch (err) {}
  try {
    relay.connectivity?.keepalive?.stop?.();
  } catch (err) {}
  try {
    relay.updateValidationRatio = () => {};
  } catch (err) {}
  try {
    relay.removeAllListeners();
  } catch (err) {}
};

const touchHintRelay = (instance, cache, url) => {
  let timer = cache.timers.get(url);
  if (timer) clearTimeout(timer);
  cache.timers.set(
    url,
    setTimeout(() => parkHintRelay(instance, cache, url), HINT_RELAY_TTL),
  );
  let relay = cache.relays.get(url);
  if (relay) {
    cache.relays.delete(url);
    cache.relays.set(url, relay);
  }
};

const evictOverflow = (instance, cache) => {
  while (cache.relays.size > MAX_HINT_RELAYS) {
    let oldest;
    for (let [url] of cache.relays) {
      if ((cache.inFlight.get(url) || 0) > 0) continue;
      oldest = url;
      break;
    }
    if (!oldest) return;
    dropHintRelay(instance, cache, oldest);
  }
};

const useHintRelays = async (instance, extRelays) => {
  if (!Array.isArray(extRelays) || extRelays.length === 0) return [];
  let cache = getHintCache(instance);
  let urls = [];
  let pending = [];
  for (let relay of extRelays) {
    try {
      let url = normalizeRelayUrl(`${relay}`);
      if (instance.explicitRelayUrls?.includes(url)) continue;
      if (urls.includes(url)) continue;
      let hintRelay = cache.relays.get(url);
      if (!hintRelay) {
        hintRelay = new NDKRelay(url, instance.relayAuthDefaultPolicy, instance);
        cache.relays.set(url, hintRelay);
      }
      if (!instance.pool.relays.has(url)) instance.pool.addRelay(hintRelay, true);
      touchHintRelay(instance, cache, url);
      urls.push(url);
      if (!hintRelay.connected) pending.push(hintRelay);
    } catch (err) {
      continue;
    }
  }
  evictOverflow(instance, cache);
  if (pending.length === 0) return urls;
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
  return urls;
};

export const holdHintRelays = (instance, urls) => {
  if (!instance || !Array.isArray(urls) || urls.length === 0) return;
  let cache = getHintCache(instance);
  for (let url of urls)
    cache.inFlight.set(url, (cache.inFlight.get(url) || 0) + 1);
};

export const releaseHintRelays = (instance, urls) => {
  if (!instance || !Array.isArray(urls) || urls.length === 0) return;
  let cache = getHintCache(instance);
  for (let url of urls) {
    let count = (cache.inFlight.get(url) || 0) - 1;
    if (count > 0) cache.inFlight.set(url, count);
    else cache.inFlight.delete(url);
    if (cache.relays.has(url) && (cache.inFlight.get(url) || 0) === 0)
      touchHintRelay(instance, cache, url);
  }
  evictOverflow(instance, cache);
};

export async function getSSGNdkInstance(extRelays = []) {
  if (!ssgInstance) {
    ssgInstance = new NDK({
      explicitRelayUrls: [...new Set(SSGRelays)],
    });
    boundFlappingBackoff(ssgInstance);
    ssgInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG ssgInstance)");
    });
  }
  let hintUrls = await useHintRelays(ssgInstance, extRelays);
  if (ssgInstance.pool.status === "idle") {
    ssgInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG ssgInstance)");
    });
  }
  return { instance: ssgInstance, hintUrls };
}

export async function getSearchNdkInstance(extRelays = []) {
  if (!searchInstance) {
    searchInstance = new NDK({
      explicitRelayUrls: [...new Set(searchRelays)],
    });
    boundFlappingBackoff(searchInstance);
    searchInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG searchInstance)");
    });
  }
  let hintUrls = await useHintRelays(searchInstance, extRelays);
  if (searchInstance.pool.status === "idle") {
    searchInstance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG searchInstance)");
    });
  }
  return { instance: searchInstance, hintUrls };
}
