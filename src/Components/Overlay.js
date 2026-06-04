import React, { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    setMounted(true);
    // Tiny delay to ensure element is in DOM before starting transitions
    const timeout = setTimeout(() => {
      setActive(true);
    }, 20);

    let body = document.querySelector("body");
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = "auto";
      clearTimeout(timeout);
    };
  }, []);

  const handleExit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActive(false);

    const timeout = setTimeout(() => {
      exit(e);
      clearTimeout(timeout);
    }, 200);
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
          maxHeight: `${maxHeight}vh`,
          overflow: allowOverFlow ? "visible" : "scroll",
          borderRadius: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
        className={`no-scrollbar bg-dropdown overlay-sheet ${active ? "active" : ""}`}
      >
        {children}
      </main>
    </section>
  );

  return mounted
    ? createPortal(
      content,
      document.getElementById("portal-root") || document.body,
    )
    : null;
}
