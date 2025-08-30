'use client'
import React, { useEffect, useState } from "react";
import { swContent } from "./content";
import { customHistory } from "@/Helpers/History";

export default function RightSidebar({ page, compact = false }) {
  const ids = swContent[page].subtitles
    .map((subtitle) => [
      subtitle.id,
      ...subtitle.subtitles.map((subsubtitle) => subsubtitle.id),
    ])
    .flat();
  const activeId = useScrollSpy(ids, 85);

  const handleOnURIClick = (uri) => {
    const el = document.getElementById(uri);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    customHistory(window.location.pathname + "#" + uri);
  };
console.log(activeId)
  if (!swContent[page]) return;
  if (swContent[page].subtitles.length === 0) return;
  return (
    <div
      className={`${
        compact ? "" : "slide-right"
      }fit-container fx-centered fx-col fx-start-h fx-start-v`}
      style={{
        borderLeft: compact ? "" : "1px solid var(--pale-gray)",
        paddingLeft: compact ? "" : "20px",
        gap: "4px",
      }}
    >
      {!compact && <p className="p-bold">On this page</p>}
      {swContent[page].subtitles.map((subtitle, index) => {
        return (
          <div
            key={index}
            className="fit-container fx-centered fx-start-h fx-start-v fx-col"
            style={{ gap: "4px" }}
          >
            <div
              className={`link-label pointer ${
                activeId === subtitle.id ? "c1-c" : "gray-c"
              }`}
              style={{ fontSize: ".85rem" }}
              onClick={() => handleOnURIClick(subtitle.id)}
            >
              {subtitle.title}
            </div>
            {subtitle.subtitles && (
              <div
                className="fit-container fx-centered fx-start-h fx-start-v fx-col"
                style={{ marginLeft: "10px", gap: "4px" }}
              >
                {subtitle.subtitles.map((subsubtitle, subindex) => {
                  return (
                    <div
                      key={`sub-${subindex}`}
                      className={`link-label pointer ${
                        activeId === subsubtitle.id ? "c1-c" : "gray-c"
                      }`}
                      style={{ fontSize: ".85rem" }}
                      onClick={() => handleOnURIClick(subsubtitle.id)}
                    >
                      {subsubtitle.title}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const useScrollSpy = (ids = [], offset = 80) => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const container = document.querySelector(".infinite-scroll");
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const containerHeight = container.clientHeight;
      const isAtBottom = scrollPosition + containerHeight >= scrollHeight - 10;

      if (scrollPosition === 0) {
        setActiveId("");
        return;
      }
      if (isAtBottom && ids.length > 0) {
        setActiveId(ids[ids.length - 1]);
        return;
      }

      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el) {
          const top =
            el.getBoundingClientRect().top +
            container.scrollTop -
            container.getBoundingClientRect().top;
          if (scrollPosition + offset >= top) {
            setActiveId(ids[i]);
            break;
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // trigger once on mount

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [ids, offset]);

  return activeId;
};
