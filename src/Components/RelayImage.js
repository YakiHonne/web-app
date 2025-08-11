import React from "react";

export default function RelayImage({ url, size = 24 }) {
  return (
    <div
      style={{
        minWidth: `${size}px`,
        aspectRatio: "1/1",
        position: "relative",
      }}
      className="sc-s fx-centered"
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 2,
          backgroundImage: `url(${url.replace(
            "wss://",
            "https://"
          )}/favicon.ico)`,
        }}
        className="bg-img cover-bg  fit-container fit-height"
      ></div>
      <p
        className={`p-bold p-caps ${size > 24 ? "p-big" : ""}`}
        style={{ position: "relative", zIndex: 1 }}
      >
        {url.split(".")[1]?.charAt(0)}
      </p>
    </div>
  );
}
