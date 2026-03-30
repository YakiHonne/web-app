import React from "react";
import Icon from "@/Components/Icon";

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
      <Icon name="user" size={24} />
    </div>
  );
}
