import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Overlay({ children, width = 600, exit, id = "" }) {
  const windowRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let body = document.querySelector("body");
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = "auto";
    };
  }, []);

  const handleExit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!windowRef.current) return;
    windowRef.current.classList.remove("slide-up");
    windowRef.current.classList.add("dismiss");
    let timeout = setTimeout(() => {
      exit(e);
      clearTimeout(timeout);
    }, 400);
  };

  const content = (
    <section
      className="fixed-container box-pad-h fx-centered fade-out"
      onClick={handleExit}
      id={id}
    >
      <main
        ref={windowRef}
        style={{
          width: `min(100%, ${width}px)`,
          position: "relative",
          maxHeight: "80vh",
          overflow: "scroll",
        }}
        onClick={(e) => e.stopPropagation()}
        className="slide-up no-scrollbar sc-s bg-sp"
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
