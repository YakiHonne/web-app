import { useCallback, useState } from "react";
import { getUsage } from "@/Endpoints/Subscription";

export default function useFeatureQuota(feature) {
  const [exceeded, setExceeded] = useState(false);
  const [locked, setLocked] = useState(false);
  const [resetAt, setResetAt] = useState(0);

  const refresh = useCallback(
    async ({ assumeExceeded } = {}) => {
      if (assumeExceeded) setExceeded(true);
      try {
        const data = await getUsage();
        const entry = data?.usage?.[feature];
        if (!entry) return;
        const isLocked = entry.limit === 0;
        const exhausted =
          isLocked || (entry.limit > 0 && entry.used >= entry.limit);
        setExceeded(assumeExceeded || exhausted);
        setResetAt(entry.reset_at || 0);
        if (isLocked) setLocked(true);
      } catch { }
    },
    [feature],
  );

  const markExceeded = useCallback((reason) => {
    setExceeded(true);
    if (reason === "upgrade_required") setLocked(true);
  }, []);

  return { exceeded, locked, resetAt, refresh, markExceeded };
}
