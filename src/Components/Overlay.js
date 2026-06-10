import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Overlay({
  children,
  width = 600,
  exit,
  id = "",
  allowOverFlow = false,
  maxHeight = 80
}) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const isMobileView = typeof window !== "undefined" && window.innerWidth <= 800;

  useEffect(() => {
    setMounted(true);
    const timeout = setTimeout(() => setActive(true), 20);
    document.body.style.overflow = "hidden";

    const isMobile = window.innerWidth <= 800;
    if (isMobile) {
      document.body.classList.remove("ios-sheet-closing");
      document.body.classList.add("ios-sheet-open");
    }

    return () => {
      document.body.style.overflow = "auto";
      clearTimeout(timeout);
    };
  }, []);

  const handleExit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActive(false);

    if (isMobileView && document.body.classList.contains("ios-sheet-open")) {
      document.body.classList.replace("ios-sheet-open", "ios-sheet-closing");
      setTimeout(() => document.body.classList.remove("ios-sheet-closing"), 450);
    }

    const timeout = setTimeout(() => {
      exit(e);
      clearTimeout(timeout);
    }, isMobileView ? 420 : 200);
  };

  const content = (
    <section
      className={`overlay-backdrop fx-centered box-pad-h ${active ? "active" : ""}`}
      onClick={handleExit}
      id={id}
    >
      <main
        style={{
          width: `min(100%, ${width}px)`,
          position: "relative",
          maxHeight: isMobileView ? "88dvh" : `${maxHeight}vh`,
          overflow: isMobileView ? "auto" : (allowOverFlow ? "visible" : "scroll"),
          borderRadius: isMobileView ? undefined : "24px",
        }}
        onClick={(e) => e.stopPropagation()}
        className={`no-scrollbar bg-dropdown overlay-sheet ${active ? "active" : ""}`}
      >
        {children}
      </main>
    </section>
  );

  return mounted
    ? createPortal(content, document.getElementById("portal-root") || document.body)
    : null;
}
