import NDK, {
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner,
  NDKRelayAuthPolicies,
} from "@nostr-dev-kit/ndk";
import { getKeys } from "@/Helpers/ClientHelpers";

const ndkInstancesCache = new Map();

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
