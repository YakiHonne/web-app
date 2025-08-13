import React from "react";
import { useRouter } from "next/navigation";

export default function Backbar() {
  const router = useRouter();

  return (
    <div
      className="fx-centered fit-container fx-start-h box-pad-v-s sticky"
      onClick={() => router.back()}
      style={{ padding: ".5rem 0" }}
    >
      <div>
        <button
          className="btn btn-normal btn-gray"
          style={{ padding: "0 1rem" }}
        >
          <div className="arrow arrow-back"></div>
        </button>
      </div>
    </div>
  );
}
