import React from "react";
import { useRouter } from "next/navigation";
import Icon from "@/Components/Icon";

export default function Backbar() {
  const router = useRouter();

  return (
    <div
      className="fx-centered fit-container box-pad-v-s sticky"
      onClick={() => router.back()}
      style={{ padding: ".5rem", top: "50px", backgroundColor: "transparent", zIndex: 1000 }}
    >
      <div>
        <button
          className="btn btn-normal btn-gray fx-centered bg-dropdown"
          style={{ padding: "0 1rem", borderRadius: "50%", aspectRatio: "1/1", width: "44px", height: "44px" }}
        >
          <Icon name="arrow" transform="rotate(90deg)" />
        </button>
      </div>
    </div>
  );
}
