import { useEffect, useRef } from "react";

export function useScrollRestoration(key = "page-container") {
  const latestScrollRef = useRef(0);

  useEffect(() => {
    const el = document.querySelector(`.${key}`);
    if (!el) return;

    const handleScroll = () => {
      latestScrollRef.current = el.scrollTop;
      sessionStorage.setItem(`${key}-scroll`, latestScrollRef.current);
    };

    el.addEventListener("scroll", handleScroll);

    const saved = parseInt(sessionStorage.getItem(`${key}-scroll`) || "0", 10);
    if (saved > 0) {
      const tryRestore = () => {
        if (el.scrollHeight >= saved) {
          el.scrollTo({ top: saved, behavior: "auto" });
          return true;
        }
        return false;
      };

      if (!tryRestore()) {
        const resizeObserver = new ResizeObserver(() => {
          if (tryRestore()) {
            resizeObserver.disconnect();
          }
        });
        resizeObserver.observe(el);
      }
    }

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [key]);
}
