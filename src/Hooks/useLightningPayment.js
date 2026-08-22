import { useEffect, useState } from "react";

export default function useLightningPayment(pubkey) {
  const [status, setStatus] = useState("waiting");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!pubkey) return;

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const base = process.env.NEXT_PUBLIC_API_URL;
    const url = `${base}/api/lightning/payment-stream/${pubkey}?api_key=${encodeURIComponent(apiKey)}`;

    const es = new EventSource(url, { withCredentials: true });

    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data);
        if (parsed.status === "paid") {
          setData(parsed);
          setStatus("paid");
          es.close();
        }
      } catch {
      }
    };

    es.onerror = () => {
      es.close();
      setStatus((prev) => (prev === "paid" ? prev : "error"));
    };

    return () => es.close();
  }, [pubkey]);

  return { status, data };
}
