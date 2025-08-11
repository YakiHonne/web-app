import React, { useEffect, useState } from "react";
import { getNoteTree } from "@/Helpers/Helpers";

export default function TextComp({
  content = "",
  size,
  weight,
  textColor,
  pubkey,
}) {
  const [parsedContent, setParsedContent] = useState(content);
  useEffect(() => {
    const parseContent = () => {
      try {
        let c = getNoteTree(content, true);
        setParsedContent(c);
      } catch (err) {
        console.log(err);
      }
    };
    parseContent();
  }, [content]);

  const getTextSize = () => {
    if (!size) return "";
    if (size === "h1") return "h2-txt p-bold";
    if (size === "h2") return "h3-txt p-bold";
    if (size === "regular") return "";
    if (size === "small") return "p-medium";
  };
  const getTextWeight = () => {
    if (!weight) return "";
    if (weight === "regular") return "";
    if (weight === "bold") return "p-bold";
  };

  const textSize = getTextSize();
  const textWeight = getTextWeight();

  return (
    <div className="fit-container">
      <div className="fit-container fx-start-h fx-centered">
        <div
          className={`${textSize} ${textWeight} fit-container poll-content-box`}
          style={{ "--p-color": textColor }}
        >
          {parsedContent}
        </div>
      </div>
    </div>
  );
}
