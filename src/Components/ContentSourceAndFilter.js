import React, { useEffect, useRef, useState } from "react";
import ContentSource from "./ContentSettings/ContentSource/ContentSource";
import ContentFilter from "./ContentSettings/ContentFilter";

export default function ContentSourceAndFilter({
  selectedCategory,
  setSelectedCategory,
  selectedFilter,
  setSelectedFilter,
  type = 1,
}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const barRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={barRef} className={`uplift-filter-bar${hidden ? " uplift-filter-bar-hidden" : ""}`}>
      <ContentSource
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        type={type}
        barRef={barRef}
      />
      <ContentFilter
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        type={type}
        barRef={barRef}
      />
    </div>
  );
}
