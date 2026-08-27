import NDK, {
  NDKNip07Signer,
  NDKNip46Signer,
  NDKPrivateKeySigner,
  NDKRelayAuthPolicies,
} from "@nostr-dev-kit/ndk";
import { getKeys } from "@/Helpers/ClientHelpers";
import { relayConnectionFilter } from "@/Helpers/utils/relayConnectionFilter";

const ndkInstancesCache = new Map();

const TEMP_SLOT_KEY = "__temp_slot__";
let tempSlot = null;

export async function getNDKInstance(key, list, isRelayList = false) {
  let instance = ndkInstancesCache.get(key);
  if (instance) return instance;
  let newInstance = await initiateNDKInstance(key, list, isRelayList);
  return newInstance;
}

export async function getTemporaryNDKInstance(list) {
  const relays = [...new Set((list || []).filter(Boolean))];
  if (relays.length === 0) return false;
  const signature = relays.slice().sort().join(",");
  if (tempSlot && tempSlot.signature === signature) return tempSlot.instance;
  releaseTemporaryNDKInstance();
  const instance = await initiateNDKInstance(
    TEMP_SLOT_KEY,
    relays,
    true,
    false,
  );
  if (!instance) return false;
  tempSlot = { signature, instance };
  return instance;
}

export function releaseTemporaryNDKInstance() {
  if (!tempSlot) return;
  try {
    tempSlot.instance.pool?.relays?.forEach((relay) => relay.disconnect());
  } catch (err) {
    console.log(err);
  }
  tempSlot = null;
}

export function setNDKInstance(key, instance) {
  ndkInstancesCache.set(key, instance);
}

const initiateNDKInstance = async (relay, list, isRelayList, cache = true) => {
  let userKeys = getKeys();
  const ndkInstance = new NDK({
    explicitRelayUrls: isRelayList ? list : [relay],
    relayConnectionFilter,
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
  ndkInstance.relayAuthDefaultPolicy = NDKRelayAuthPolicies.signIn({
    ndk: ndkInstance,
  });
  await ndkInstance.connect(4000);
  if (
    !isRelayList &&
    !ndkInstance.pool.relays.get(relay.endsWith("/") ? relay : `${relay}/`)
      ?.connected
  ) {
    return false;
  }
  if (cache) setNDKInstance(relay, ndkInstance);
  return ndkInstance;
};
