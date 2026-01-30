import React, { useRef } from "react";

export default function LoadingBar({
  current,
  total,
  full = false,
  black = false,
  onClick,
}) {
  const barRef = useRef(null);

  const handleClick = (e) => {
    if (!barRef.current || !onClick) return;

    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * total;

    onClick(newTime); // call the passed function with the new time
  };

  return (
    <div
      ref={barRef}
      className={full ? "progress-bar-full" : "progress-bar"}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div
        style={{
          width: `${(current * 100) / total}%`,
          filter: black ? "brightness(0)" : "initial",
        }}
      ></div>
    </div>
  );
}
