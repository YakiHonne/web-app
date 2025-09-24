import { getRelayMetadata } from "@/Helpers/utils";
import React from "react";

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
