import NDK, {
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner,
  NDKRelayAuthPolicies,
} from "@nostr-dev-kit/ndk";
import { getKeys } from "@/Helpers/ClientHelpers";

const ndkInstancesForDMsCache = new Map();

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
