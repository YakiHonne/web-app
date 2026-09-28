import React from "react";
import { useRouter } from "next/navigation";
import Icon from "@/Components/Icon";

export default function Backbar() {
  const router = useRouter();

  return (
    // The wrapper stays full width so the button keeps its centred position,
    // but it must not be clickable: it is a transparent, ~60px tall sticky
    // strip spanning the whole column, and a click handler here swallows
    // every click along that band (GitHub issue #127). Only the button itself
    // navigates back.
    <div
      className="fx-centered fit-container box-pad-v-s "
      style={{
        padding: ".5rem",
        top: "max(12px, calc(var(--nav-offset, 84px) - 34px))",
        backgroundColor: "transparent",
        zIndex: 1000,
        position: "sticky",
        pointerEvents: "none",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        <button
          className="btn btn-normal btn-gray fx-centered bg-dropdown"
          onClick={() => router.back()}
          aria-label="Go back"
          style={{
            padding: "0 1rem",
            borderRadius: "50%",
            aspectRatio: "1/1",
            width: "44px",
            height: "44px",
          }}
        >
          <Icon name="arrow" transform="rotate(90deg)" />
        </button>
      </div>
    </div>
  );
}
