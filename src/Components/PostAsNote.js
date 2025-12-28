import React from "react";
import WriteNote from "@/Components/WriteNote";

export default function PostAsNote({
  exit,
  content = "",
  linkedEvent,
  protectedRelay,
}) {
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{ width: "min(100%, 650px)", overflow: "visible" }}
        className="sc-s"
        onClick={(e) => e.stopPropagation()}
      >
        <WriteNote
          border={false}
          exit={exit}
          content={content}
          linkedEvent={linkedEvent}
          protectedRelay={protectedRelay}
        />
      </div>
    </div>
  );
}
