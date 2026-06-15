import React from "react";

export default function ProgressBar({
  current,
  total,
  percentage,
  full = false,
  black = false,
}) {
  const width = percentage !== undefined ? percentage : (current * 100) / total;
  return (
    <div className={full ? "progress-bar-full" : "progress-bar"}>
      <div
        style={{
          width: `${width}%`,
          filter: black ? "brightness(0)" : "initial",
        }}
      ></div>
    </div>
  );
}
