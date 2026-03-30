import React from "react";
import WriteNote from "@/Components/WriteNote";
import Overlay from "./Overlay";

export default function PostAsNote({
  exit,
  content = "",
  linkedEvent,
  protectedRelay,
}) {
  return (
    <Overlay exit={exit} width={650}>
      <div
        style={{ width: "min(100%, 650px)", overflow: "visible" }}
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
    </Overlay>
  );
}
