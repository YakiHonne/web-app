import React from "react";

export default function Spinner({ size = 20, color = "var(--c1)" }) {
  return (
    <div
      className="fx-centered"
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        borderTop: "2px solid transparent",
        borderRadius: "50%",
        animation: "rotate 1s linear infinite",
      }}
    />
  );
}
