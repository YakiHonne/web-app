import React from "react";

export default function ImgComp({ url = "", aspectRatio }) {
  return (
    <div className="fit-container">
      <div
        className="sc-s-18 fit-container bg-img cover-bg fx-centered"
        style={{
          aspectRatio: aspectRatio?.startsWith("16") ? "16/9" : "1/1",
          backgroundImage: `url(${url})`,
          border: "none",
        }}
      >
        {!url && <div className="image-24"></div>}
      </div>
    </div>
  );
}
