import React from "react";

export default function LoadingDots() {
  
  return (
    <div className="fx-centered loading-dots">
      <div
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "var(--border-r-50)",
          backgroundColor: "var(--pale-gray)",
        }}
      ></div>
      <div
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "var(--border-r-50)",
          backgroundColor: "var(--pale-gray)",
        }}
      ></div>
      <div
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "var(--border-r-50)",
          backgroundColor: "var(--pale-gray)",
        }}
      ></div>
    </div>
  );
}
