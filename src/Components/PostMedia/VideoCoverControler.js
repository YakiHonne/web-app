import React, { useRef, useState } from "react";

export default function VideoCoverControler({ count, index, onChange }) {
  const containerRef = useRef(null);
  const handleRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const slotWidth = rect.width / count;

    const onMouseMove = (ev) => {
      const x = ev.clientX - rect.left;
      const clamped = Math.max(0, Math.min(x, rect.width));
      const newIndex = Math.round(clamped / slotWidth);

      onChange(Math.min(count - 1, newIndex));
    };

    const onMouseUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  if (index === -1) return null;
  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${(index / count) * 100}%`,
          height: "100%",
          background: "rgba(0,0,0,0.8)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${((index + 1) / count) * 100}%`,
          top: 0,
          width: `${100 - ((index + 1) / count) * 100}%`,
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          pointerEvents: "none",
        }}
      />
      <div
        ref={handleRef}
        onMouseDown={onMouseDown}
        style={{
          position: "absolute",
          left: `${(index / count) * 100}%`,
          width: `calc(100% / ${count})`,
          height: "100%",
          borderRadius: "6px",
          border: "3px solid var(--c1)",
          cursor: dragging ? "grabbing" : "grab",
          transition: dragging ? "none" : "left 0.15s ease-out",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
