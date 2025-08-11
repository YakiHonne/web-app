'use client';
import React from "react";
import { customHistory } from "@/Helpers/History";

export default function Backbar() {
  return (
    <div
      className="fx-centered fit-container fx-start-h box-pad-v-s sticky"
      onClick={() => customHistory.back()}
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
