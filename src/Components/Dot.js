import React from "react";

export default function Dot({
  size = 10,
  color = "var(--color-primary-text)",
}) {
  return (
    <div
      style={{
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        backgroundColor: color,
        borderRadius: "50%",
      }}
    ></div>
  );
}
