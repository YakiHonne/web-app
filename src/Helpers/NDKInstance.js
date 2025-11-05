import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import relaysOnPlatform from "@/Content/Relays";
import bannedList from "@/Content/BannedList";

const ndkInstance = new NDK({
  explicitRelayUrls: relaysOnPlatform,
  enableOutboxModel: true,
  mutedIds: new Map([bannedList.map((p) => [p, "p"])]),
});

await ndkInstance.connect(1000);
if (typeof window !== "undefined") {
  ndkInstance.cacheAdapter = new NDKCacheAdapterDexie({
    dbName: "ndk-store",
    expirationTime: 3600 * 24 * 7,
    profileCacheSize: 200,
  });

  // Suppress console output of common NDK relay errors
  // These errors don't break functionality but clutter the console
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMsg = args.join(' ');
    // Check if this is a relay error we want to suppress
    if (typeof errorMsg === 'string' && (
        errorMsg.includes('already authenticated') ||
        errorMsg.includes('user unauthorized') ||
        errorMsg.includes('restricted') ||
        (errorMsg.includes('Relay') && errorMsg.includes('disconnected'))
    )) {
      // Log as warning instead to reduce noise
      console.warn('[NDK Relay]', errorMsg);
      return;
    }
    // Call original console.error for all other errors
    originalConsoleError.apply(console, args);
  };
}

export { ndkInstance };

export const addExplicitRelays = (relayList) => {
  try {
    if (!Array.isArray(relayList)) return;
    let tempRelayList = relayList.filter(
      (relay) => !ndkInstance.explicitRelayUrls.includes(`${relay}`)
    );
    if (tempRelayList.length === 0) return;
    for (let relay of tempRelayList) {
      ndkInstance.addExplicitRelay(relay, undefined, true);
    }
  } catch (err) {
    console.log(err);
  }
};
