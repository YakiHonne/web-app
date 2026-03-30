import React from "react";
import Icon from "./Icon";

export default function EmojiImg({ content }) {
  if (!content)
    return (
      <Icon name={"heart-bold"} isColored size={24} isBoldThemeColor={true} />
    );
  if (content.startsWith("http"))
    return (
      <div
        style={{
          backgroundImage: `url(${content})`,
          minWidth: "24px",
          minHeight: "24px",
        }}
        className="bg-img cover-bg sc-s"
      ></div>
    );
  if (["+", "-"].includes(content))
    return (
      <Icon name={"heart-bold"} isColored size={24} isBoldThemeColor={true} />
    );
  return <p>{content}</p>;
}
