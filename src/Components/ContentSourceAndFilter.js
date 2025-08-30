import React from "react";
import ContentSource from "./ContentSettings/ContentSource";
import ContentFilter from "./ContentSettings/ContentFilter";

export default function ContentSourceAndFilter({
  selectedCategory,
  setSelectedCategory,
  selectedFilter,
  setSelectedFilter,
  type = 1,
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 101,
      }}
      className="fit-container fx-centered"
    >
      <div className="main-container">
        <main
          style={{ height: "auto" }}
          className="fx-centered fx-end-h box-pad-h-s"
        >
          <div
            className="main-page-nostr-container fx-centered box-pad-v-m"
            style={{
              borderBottom: "1px solid var(--very-dim-gray)",
              backgroundColor: "var(--white)",
            }}
          >
            <div className="main-middle fx-scattered box-pad-h-m">
              <ContentSource
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                type={type}
              />
              <ContentFilter
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                type={type}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
