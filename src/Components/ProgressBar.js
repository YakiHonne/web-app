import React from "react";

export default function ProgressBar({
  current,
  total,
  full = false,
  black = false,
}) {
  return (
    <div className={full ? "progress-bar-full" : "progress-bar"}>
      <div
        style={{
          width: `${(current * 100) / total}%`,
          filter: black ? "brightness(0)" : "initial",
        }}
      ></div>
    </div>
  );
}
