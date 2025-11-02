import NDK from "@nostr-dev-kit/ndk";
import relays from "@/Content/SSGRelays";

let instance;

export function getSSGNdkInstance(extRelays = []) {
  if (!instance) {
    instance = new NDK({
      explicitRelayUrls: [...new Set([...relays, ...extRelays])],
    });
    instance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG instance)");
    });
  }
  if (extRelays.length > 0 && Array.isArray(extRelays)) {
    let tempRelayList = extRelays.filter(
      (relay) => !instance.explicitRelayUrls.includes(`${relay}`)
    );
    if (tempRelayList.length > 0)
      for (let relay of tempRelayList) {
        instance.addExplicitRelay(relay, undefined, true);
      }
  }
  if (instance.pool.status === "idle") {
    instance.connect(2000).catch(() => {
      console.warn("[NDK] relay connection failed (SSG instance)");
    });
  }
  console.log("pool status: ", instance.pool.status);
  return instance;
}
