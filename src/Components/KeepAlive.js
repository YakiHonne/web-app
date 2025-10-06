import { useRef, useEffect, useState } from "react";

export default function KeepAlive({ routeKey, children }) {
  const cacheRef = useRef({});
  const [isClient, setIsClient] = useState(false);

  const MAX_CACHE = 5;
  const ALWAYS_KEEP = ["/", "/discover"]; 
  const ALWAYS_REMOVE = ["/login", "/wallet"]; 

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isClient) {
    Object.keys(cacheRef.current).forEach((key) => {
      if (ALWAYS_REMOVE.includes(key)) {
        delete cacheRef.current[key];
      }
    });
  }

  if (isClient && ALWAYS_REMOVE.includes(routeKey)) {
    if (cacheRef.current[routeKey]) delete cacheRef.current[routeKey];
    return <div style={{ height: "100%" }}>{children}</div>;
  }

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

