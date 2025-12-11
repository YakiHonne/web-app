import NDK, {
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner,
  NDKRelayAuthPolicies,
} from "@nostr-dev-kit/ndk";
import { getKeys } from "./ClientHelpers";
import { getEmptyRelaysData } from "./Encryptions";

const relayMetadataCache = new Map();
const eventsCache = new Map();
const urlsMetadataCache = new Map();
const ndkInstancesCache = new Map();
const ndkInstancesForDMsCache = new Map();

export const localStorage_ = {
  getItem(key) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  setItem(key, value) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  removeItem(key) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

const initRelaysMetadata = () => {
  try {
    let relays = localStorage_.getItem("relaysMetadata");
    if (relays) {
      relays = JSON.parse(relays);
      relays.forEach((relay) => {
        setRelayMetadata(relay.url, relay);
      });
    }
  } catch (err) {
    console.log(err);
  }
};

initRelaysMetadata();

export const saveLocalRelaysMetadata = () => {
  try {
    let relays = Array.from(relayMetadataCache.values());
    localStorage_.setItem("relaysMetadata", JSON.stringify(relays));
  } catch (err) {
    console.log(err);
  }
};

export function setRelayMetadata(key, data) {
  relayMetadataCache.set(key, data);
}

export function getRelayMetadata(key) {
  let cleanURL = !key.endsWith("/") ? key : key.slice(0, -1);
  return (
    relayMetadataCache.get(cleanURL) ||
    relayMetadataCache.get(key) ||
    getEmptyRelaysData(cleanURL)
  );
}

export function clearRelayMetadata(key) {
  relayMetadataCache.delete(key);
}

export async function getNDKInstance(key, list, isRelayList = false) {
  let instance = ndkInstancesCache.get(key);
  if (instance) return instance;
  let newInstance = await initiateNDKInstance(key, list, isRelayList);
  return newInstance;
}

export function setNDKInstance(key, instance) {
  ndkInstancesCache.set(key, instance);
}

const initiateNDKInstance = async (relay, list, isRelayList) => {
  let userKeys = getKeys();
  const ndkInstance = new NDK({
    explicitRelayUrls: isRelayList ? list : [relay],
  });

  if (userKeys?.ext) {
    const signer = new NDKNip07Signer(10000, ndkInstance);
    await signer.blockUntilReady();
    ndkInstance.signer = signer;
  }
  if (userKeys?.sec) {
    const signer = new NDKPrivateKeySigner(userKeys.sec);
    await signer.blockUntilReady();
    ndkInstance.signer = signer;
  }
  if (userKeys?.bunker) {
    let userNip05OrConnection = userKeys?.bunker.replace(
      /([&?])?secret=[^&]+/,
      ""
    ); // The NDK does not accept a url with a secret assigned
    const signer = NDKNip46Signer.bunker(ndkInstance, userNip05OrConnection);
    signer.on("authUrl", (url) => {
      window.open(url, "auth", "width=600,height=600");
    });
    await signer.blockUntilReady();
    ndkInstance.signer = signer;
  }
  await ndkInstance.connect(4000);
  if (
    !isRelayList &&
    !ndkInstance.pool.relays.get(relay.endsWith("/") ? relay : `${relay}/`)
      ?.connected
  ) {
    return false;
  }
  ndkInstance.relayAuthDefaultPolicy = NDKRelayAuthPolicies.signIn({
    ndk: ndkInstance,
  });
  setNDKInstance(relay, ndkInstance);
  return ndkInstance;
};

export async function getNDKInstanceForDMs(key, relays) {
  let instance = ndkInstancesForDMsCache.get(key);
  if (instance) return instance;
  let newInstance = await initiateNDKInstanceForDMs(key, relays);
  return newInstance;
}

export function setNDKInstanceForDMs(key, instance) {
  ndkInstancesForDMsCache.set(key, instance);
}

const initiateNDKInstanceForDMs = async (key, relays) => {
  let userKeys = getKeys();
  const ndkInstance = new NDK({
    explicitRelayUrls: relays,
  });

  if (userKeys?.ext) {
    const signer = new NDKNip07Signer(undefined, ndkInstance);
    ndkInstance.signer = signer;
  }
  if (userKeys?.sec) {
    const signer = new NDKPrivateKeySigner(userKeys.sec);
    ndkInstance.signer = signer;
  }
  if (userKeys?.bunker) {
    const localKeys = new NDKPrivateKeySigner(userKeys.localKeys.sec);
    const signer = new NDKNip46Signer(ndkInstance, userKeys.bunker, localKeys);
    ndkInstance.signer = signer;
  }
  await ndkInstance.connect(2000);
  ndkInstance.relayAuthDefaultPolicy = NDKRelayAuthPolicies.signIn({
    ndk: ndkInstance,
  });
  setNDKInstanceForDMs(key, ndkInstance);
  return ndkInstance;
};

export function getEventFromCache(id) {
  let event = eventsCache.get(id);
  if (event) {
    setEventFromCache(id, event.event);
    return event.event;
  }
  return null;
}

export function setEventFromCache(id, event) {
  eventsCache.set(id, { event, seen: Date.now() });

  if (eventsCache.size > 300) {
    const sorted = [...eventsCache.entries()].sort(
      (a, b) => b[1].seen - a[1].seen
    );
    const top300 = sorted.slice(0, 300);
    eventsCache.clear();
    for (const [k, v] of top300) {
      eventsCache.set(k, v);
    }
  }
}

export function getURLFromCache(id) {
  let metadata = urlsMetadataCache.get(id);
  if (metadata) {
    setURLFromCache(id, metadata.metadata);
    return metadata.metadata;
  }
  return null;
}

export function setURLFromCache(id, metadata) {
  urlsMetadataCache.set(id, { metadata, seen: Date.now() });

  if (urlsMetadataCache.size > 300) {
    const sorted = [...urlsMetadataCache.entries()].sort(
      (a, b) => b[1].seen - a[1].seen
    );
    const top300 = sorted.slice(0, 300);
    urlsMetadataCache.clear();
    for (const [k, v] of top300) {
      urlsMetadataCache.set(k, v);
    }
  }
}
