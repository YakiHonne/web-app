import NDK, { NDKNip07Signer, NDKNip46Signer, NDKPrivateKeySigner, NDKRelayAuthPolicies } from "@nostr-dev-kit/ndk";
import { getKeys } from "./ClientHelpers";

const relayMetadataCache = new Map();
const ndkInstancesCache = new Map();


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
  return relayMetadataCache.get(key);
}

export function clearRelayMetadata(key) {
  relayMetadataCache.delete(key);
}

export async function getNDKInstance(key) {
  let instance = ndkInstancesCache.get(key);
  if (instance) return instance;
  let newInstance = await initiateNDKInstance(key);
  return newInstance;
}
export function setNDKInstance(key, instance) {
  ndkInstancesCache.set(key, instance);
}

const initiateNDKInstance = async (relay) => {
  let userKeys = getKeys();
  const ndkInstance = new NDK({
    explicitRelayUrls: [relay],
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
  await ndkInstance.connect(500);
  ndkInstance.relayAuthDefaultPolicy = NDKRelayAuthPolicies.signIn({
    ndk: ndkInstance,
  });
  setNDKInstance(relay, ndkInstance);
  return ndkInstance;
};

