import React from "react";

export default function Spinner({ size = 20, color = "var(--black)" }) {
  return (
    // <div
    //   className="fx-centered"
    //   style={{
    //     width: size,
    //     height: size,
    //     border: `2px solid ${color}`,
    //     borderTop: "2px solid transparent",
    //     borderRadius: "50%",
    //     animation: "rotate 1s linear infinite",
    //   }}
    // />
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: "2px solid rgba(255, 255, 255, 0.25)",
        borderTopColor: color,
        borderRadius: "50%",
        animation: "login-spin 0.7s linear infinite",
        verticalAlign: "middle",
      }}
    />
  );
}
