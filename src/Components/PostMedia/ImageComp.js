import React from "react";
import { IMAGE_FILTERS } from "@/Content/ImageFilterConfig";

export default function ImageComp({ fileLocalUrl, filter }) {
  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        objectFit: "cover",
        maxHeight: "900px",
        display: "block",
      }}
    >
      <img
        src={fileLocalUrl}
        style={{
          width: "100%",
          objectFit: "fit",
          display: "block",
          backgroundColor: "var(--c1-side)",
          filter: IMAGE_FILTERS[filter],
          border: "none"
        }}
        className="sc-s-18"
      />
    </div>
  );
}
