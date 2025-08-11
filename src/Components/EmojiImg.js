import React from "react";

export default function EmojiImg({ content }) {
  if (!content) return <div className={"heart-bold-24"}></div>;
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
    return <div className={"heart-bold-24"}></div>;
  return <p>{content}</p>;
}
