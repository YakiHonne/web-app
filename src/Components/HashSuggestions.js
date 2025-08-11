import React, { useMemo } from "react";
import TopicsTags from "@/Content/TopicsTags";

const getSuggestions = (custom) => {
  let list = TopicsTags.map((item) => [item.main_tag, ...item.sub_tags]).flat();
  if (!custom)
    return list
      .filter((item) => !item.includes(" "))
      .map((item) => item.replace("#", ""));
  return list
    .filter(
      (item) =>
        !item.includes(" ") && item.toLowerCase().includes(custom.toLowerCase())
    )
    .map((item) => item.replace("#", ""));
};

export default function HashSuggestions({ tag, setSelectedTag }) {
  const topicSuggestions = useMemo(() => {
    return getSuggestions(tag);
  }, [tag]);
  
  if (topicSuggestions.length === 0) return;
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        maxHeight: "200px",
        overflow: "scroll",
        zIndex: 100,
      }}
      className="sc-s-18 fx-centered fx-start-v fx-start-h fx-col box-pad-h-s box-pad-v-s"
    >
      {topicSuggestions.map((item, index) => {
        return (
          <button
            key={`${item}-${index}`}
            className={`btn-text-gray pointer fit-container`}
            style={{
              textAlign: "left",
              width: "100%",
              paddingLeft: 0,
              fontSize: "1rem",
              textDecoration: "none",

              transition: ".4s ease-in-out",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTag(item);
            }}
          >
            {item}
          </button>
        );
      })}
      {topicSuggestions.length === 0 && (
        <div className="fit-container fx-centered">
          <p className="gray-c p-medium p-italic">No suggestions</p>
        </div>
      )}
    </div>
  );
}
