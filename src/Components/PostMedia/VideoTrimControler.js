import React, { useState, useRef } from "react";

export default function VideoTrimControler({ duration, setRange, range }) {
  const containerRef = useRef(null);
  const minWidth = 20;

  const handleMouseDown = (side) => (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const parentWidth = containerRef.current.offsetWidth;
    const initialRange = { ...range };

    const onMouseMove = (moveEvent) => {
      const dx = ((moveEvent.clientX - startX) / parentWidth) * 100;

      if (side === "left") {
        let newStart = initialRange.start + dx;
        if (newStart < 0) newStart = 0;
        if (newStart > initialRange.end - minWidth)
          newStart = initialRange.end - minWidth;
        setRange((prev) => ({ ...prev, start: newStart }));
      } else if (side === "right") {
        let newEnd = initialRange.end + dx;
        if (newEnd > 100) newEnd = 100;
        if (newEnd < initialRange.start + minWidth)
          newEnd = initialRange.start + minWidth;
        setRange((prev) => ({ ...prev, end: newEnd }));
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleRangeDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const parentWidth = containerRef.current.offsetWidth;
    const initialRange = { ...range };

    const onMouseMove = (moveEvent) => {
      const dx = ((moveEvent.clientX - startX) / parentWidth) * 100;
      let newStart = initialRange.start + dx;
      let newEnd = initialRange.end + dx;

      if (newStart < 0) {
        newEnd -= newStart;
        newStart = 0;
      }
      if (newEnd > 100) {
        newStart -= newEnd - 100;
        newEnd = 100;
      }

      setRange({ start: newStart, end: newEnd });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0,
        top: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${range.start}%`,
          top: "-28px",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          padding: "4px 6px",
          borderRadius: "6px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {((range.start * duration) / 100).toFixed(1)}s
      </div>
      <div
        style={{
          position: "absolute",
          left: `calc(${range.end}% - 40px)`,
          top: "-28px",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          padding: "4px 6px",
          borderRadius: "6px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {((range.end * duration) / 100).toFixed(1)}s
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `calc(${range.start}% + 8px)`,
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          pointerEvents: "none",
          borderTopLeftRadius: "10px",
          borderBottomLeftRadius: "10px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `calc(${range.end}% - 8px)`,
          top: 0,
          width: `calc(${100 - range.end}% + 8px)`,
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          pointerEvents: "none",
          borderTopRightRadius: "10px",
            borderBottomRightRadius: "10px",
        }}
      />

      <div
        onMouseDown={handleRangeDrag}
        style={{
          position: "absolute",
          left: `${range.start}%`,
          width: `${range.end - range.start}%`,
          height: "100%",
          border: "3px solid #4caf50",
          boxSizing: "border-box",
          borderRadius: "10px",
          cursor: "grab",
        }}
      >
        <div
          onMouseDown={(e) => e.stopPropagation() || handleMouseDown("left")(e)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "10px",
            height: "100%",
            cursor: "ew-resize",
            backgroundColor: "#4caf50",
            borderTopRightRadius: "10px",
            borderBottomRightRadius: "10px",
          }}
          className="fx-centered"
        >
          <p style={{ color: "white" }} className="p-bold p-big">
            |
          </p>
        </div>
        <div
          onMouseDown={(e) =>
            e.stopPropagation() || handleMouseDown("right")(e)
          }
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "10px",
            height: "100%",
            cursor: "ew-resize",
            backgroundColor: "#4caf50",
            borderTopLeftRadius: "10px",
            borderBottomLeftRadius: "10px",
          }}
          className="fx-centered"
        >
          <p style={{ color: "white" }} className="p-bold p-big">
            |
          </p>
        </div>
      </div>
    </div>
  );
}
