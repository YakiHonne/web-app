// import { useRef, useEffect, useState } from "react";
// import { useRouter } from "next/router";

// /**
//  * Very small keep-alive: caches the first rendered element per route key
//  * and keeps all of them mounted; only toggles visibility.
//  */
// export default function KeepAlive({ routeKey, children }) {
//   const cacheRef = useRef({});
//   const [isClient, setIsClient] = useState(false);

//   // Prevent hydration mismatch by only rendering cached content on client
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   // Cache the first element we rendered for this routeKey
//   if (isClient && !cacheRef.current[routeKey]) {
//     cacheRef.current[routeKey] = children;
//   }

//   // On server or first client render, just render the current children
//   if (!isClient) {
//     return <div style={{ height: "100%" }}>{children}</div>;
//   }

//   return (
//     <>
//       {Object.entries(cacheRef.current).map(([key, node]) => (
//         <div
//           key={key}
//           style={{
//             display: key === routeKey ? "block" : "none",
//             height: "100%",
//           }}
//         >
//           {node}
//         </div>
//       ))}
//     </>
//   );
// }

import { useRef, useEffect, useState } from "react";

/**
 * KeepAlive with selective eviction:
 * - Always preserves certain routes (e.g. home, discover)
 * - Evicts older ones if cache grows beyond MAX
 */
export default function KeepAlive({ routeKey, children }) {
  const cacheRef = useRef({});
  const [isClient, setIsClient] = useState(false);

  // ⚙️ config
  const MAX_CACHE = 5; // how many non-persistent routes to keep
  const ALWAYS_KEEP = ["/", "/discover"]; // home + discover

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isClient && !cacheRef.current[routeKey]) {
    // if new route, cache it
    cacheRef.current[routeKey] = children;

    // evict oldest non-persistent if over limit
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
