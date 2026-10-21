import React, { useCallback, useEffect, useRef, useState } from "react";

const FADE_SIZE = 28;

export default function ScrollFade({ children, maxHeight, className = "", style = {} }) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const updateEdges = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.scrollTop > 2;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
    setEdges((prev) =>
      prev.top === top && prev.bottom === bottom ? prev : { top, bottom },
    );
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [updateEdges]);

  const mask = `linear-gradient(to bottom, ${edges.top ? "transparent" : "black"} 0, black ${FADE_SIZE}px, black calc(100% - ${FADE_SIZE}px), ${edges.bottom ? "transparent" : "black"} 100%)`;

  return (
    <div
      ref={ref}
      className={`no-scrollbar ${className}`}
      onScroll={updateEdges}
      style={{
        maxHeight,
        overflow: "auto",
        WebkitMaskImage: mask,
        maskImage: mask,
        ...style,
      }}
    >
      <div>{children}</div>
    </div>
  );
}
