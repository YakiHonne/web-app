import React from "react";
import { getRelayMetadata } from "@/Helpers/utils";

export default function RelayImage({ url, size = 24 }) {
  let icon = getRelayMetadata(url)?.icon;
  let domain = url.replace("wss://", "").replace("ws://", "");
  let iconUrl = `https://${domain.split("/")[0]}/favicon.ico`;
  return (
    <div
      style={{
        minWidth: `${size}px`,
        aspectRatio: "1/1",
        position: "relative",
        transition: "0.1s cubic-bezier(0.99, 0.01, 0.03, 0.76)",
      }}
      className="sc-s fx-centered"
    >
      {!icon && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 2,
            backgroundImage: `url(${icon ? icon : iconUrl})`,
            backgroundColor: "var(--c1-side)",
          }}
          className="bg-img cover-bg  fit-container fit-height"
        ></div>
      )}
      {icon && (
        <img
          src={icon}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            objectFit: "cover",
            zIndex: 2,
            width: "110%",
            height: "110%",
            objectPosition: "center",
            backgroundColor: "var(--c1-side)",
          }}
        />
      )}

      <p
        className={`p-bold p-caps ${size > 24 ? "p-big" : ""}`}
        style={{ position: "relative", zIndex: 1 }}
      >
        {url.split(".")[1]?.charAt(0)}
      </p>
    </div>
  );
}
