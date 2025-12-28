import React from "react";

export default function AvatarPlaceholder({ size }) {
  let iconSize = Math.floor(size - (size * 50) / 100);
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: "var(--dim-gray)",
      }}
      className="fx-centered"
    >
      <div
        className="user-24"
        style={{ minWidth: `${iconSize}px`, minHeight: `${iconSize}px` }}
      ></div>
    </div>
  );
}
