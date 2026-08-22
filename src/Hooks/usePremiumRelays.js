import { useCallback, useEffect, useState } from "react";
import { getSubData, saveRelayMetadata } from "@/Helpers/Controlers";
import { getRelayMetadata } from "@/Helpers/utils/relayMetadataCache";
import { getNDKInstance } from "@/Helpers/utils/ndkInstancesCache";

const premiumRelaysCache = new Map();

export const getCachedPremiumRelays = (pubkey) =>
  premiumRelaysCache.get(pubkey);

export default function usePremiumRelays(pubkey, enabled = true) {
  const [premiumRelays, setPremiumRelays] = useState(
    () => premiumRelaysCache.get(pubkey) || [],
  );
  const [isPremiumRelaysLoading, setIsPremiumRelaysLoading] = useState(
    () => enabled && !premiumRelaysCache.has(pubkey),
  );

  const resolve = useCallback(async () => {
    if (premiumRelaysCache.has(pubkey)) {
      setPremiumRelays(premiumRelaysCache.get(pubkey));
      setIsPremiumRelaysLoading(false);
      return;
    }
    setIsPremiumRelaysLoading(true);
    try {
      const res = await getSubData(
        [{ authors: [pubkey], kinds: [10002] }],
        1000,
        [],
        undefined,
        1,
      );
      const relayList =
        res.data.length > 0
          ? res.data[0].tags
              .filter((tag) => tag[0] === "r" && tag[1])
              .filter((tag) => !tag[2] || tag[2] === "read" || tag[2] === "write")
              .map((tag) => tag[1])
          : [];
      const uniqueRelays = [...new Set(relayList)];
      if (uniqueRelays.length === 0) {
        premiumRelaysCache.set(pubkey, []);
        setPremiumRelays([]);
        return;
      }
      await saveRelayMetadata(uniqueRelays);
      const supported = uniqueRelays.filter((url) => {
        const metadata = getRelayMetadata(url);
        return metadata?.supported_nips?.includes(63);
      });
      premiumRelaysCache.set(pubkey, supported);
      setPremiumRelays(supported);
    } catch (err) {
      console.log(err);
      premiumRelaysCache.set(pubkey, []);
      setPremiumRelays([]);
    } finally {
      setIsPremiumRelaysLoading(false);
    }
  }, [pubkey]);

  useEffect(() => {
    if (!pubkey || !enabled) {
      setIsPremiumRelaysLoading(false);
      return;
    }
    resolve();
  }, [pubkey, enabled, resolve]);

  const getPremiumNDK = useCallback(async () => {
    if (premiumRelays.length === 0) return undefined;
    const instance = await getNDKInstance(
      `premium-${pubkey}`,
      premiumRelays,
      true,
    );
    return instance || undefined;
  }, [pubkey, premiumRelays]);

  return { premiumRelays, isPremiumRelaysLoading, getPremiumNDK };
}
