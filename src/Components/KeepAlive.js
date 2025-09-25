import { useRef, useEffect, useState } from "react";

export default function KeepAlive({ routeKey, children }) {
  const cacheRef = useRef({});
  const [isClient, setIsClient] = useState(false);

  const MAX_CACHE = 5;
  const ALWAYS_KEEP = ["/", "/discover"]; 

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isClient && !cacheRef.current[routeKey]) {
    cacheRef.current[routeKey] = children;

    const keys = Object.keys(cacheRef.current);
    const extraKeys = keys.filter(
      (key) => !ALWAYS_KEEP.includes(key) && key !== routeKey
    );

    if (extraKeys.length > MAX_CACHE) {
      const oldest = extraKeys[0];
      delete cacheRef.current[oldest];
    }
  }

  if (!isClient) {
    return <div style={{ height: "100%" }}>{children}</div>;
  }

  return (
    <>
      {Object.entries(cacheRef.current).map(([key, node]) => (
        <div
          key={key}
          style={{
            display: key === routeKey ? "block" : "none",
            height: "100%",
          }}
        >
          {node}
        </div>
      ))}
    </>
  );
}
