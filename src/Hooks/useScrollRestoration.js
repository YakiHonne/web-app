import { useEffect, useRef } from "react";

export function useScrollRestoration(key = "page-container") {
  const latestScrollRef = useRef(0);

  useEffect(() => {
    const el = document.querySelector(`.${key}`);
    if (!el) return;

    // --- 1. Track scroll continuously ---
    const handleScroll = () => {
      latestScrollRef.current = el.scrollTop;
      sessionStorage.setItem(`${key}-scroll`, latestScrollRef.current);
    };

    el.addEventListener("scroll", handleScroll);

    // --- 2. Restore when mounting ---
    const saved = parseInt(sessionStorage.getItem(`${key}-scroll`) || "0", 10);
    if (saved > 0) {
      const tryRestore = () => {
        if (el.scrollHeight >= saved) {
          el.scrollTo({ top: saved, behavior: "auto" });
          return true;
        }
        return false;
      };

      // initial attempt
      if (!tryRestore()) {
        // --- 3. Retry on resize until it works ---
        const resizeObserver = new ResizeObserver(() => {
          if (tryRestore()) {
            resizeObserver.disconnect();
          }
        });
        resizeObserver.observe(el);
      }
    }

    // --- Cleanup ---
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [key]);
}
