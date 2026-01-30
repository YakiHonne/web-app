import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { relaysOnPlatform } from "@/Content/Relays";
import bannedList from "@/Content/BannedList";

const ndkInstance = new NDK({
  explicitRelayUrls: relaysOnPlatform,
  enableOutboxModel: true,
  muteFilter: (event) => {
    if (bannedList.includes(event.pubkey)) return true;
    return false;
  },
  // mutedIds: new Map([bannedList.map((p) => [p, "p"])]),
});

await ndkInstance.connect(1000);
if (typeof window !== "undefined") {
  ndkInstance.cacheAdapter = new NDKCacheAdapterDexie({
    dbName: "ndk-store",
    expirationTime: 3600 * 24 * 7,
    profileCacheSize: 200,
  });
}

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
