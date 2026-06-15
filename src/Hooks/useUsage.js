import { useState, useCallback } from "react";
import { getUsage } from "@/Endpoints/Subscription";

export default function useUsage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getUsage();
      setUsage(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { usage, loading, error, fetch };
}
