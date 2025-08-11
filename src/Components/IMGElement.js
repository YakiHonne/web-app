import React, { useState } from "react";

export default function IMGElement({ src }) {
  const [resize, setResize] = useState(false);

  return (
    <>
      {resize && (
        <div
          className="fixed-container box-pad-h box-pad-v fx-centered"
          onClick={(e) => {
            e.stopPropagation();
            setResize(false);
          }}
        >
          <div
            style={{
              position: "relative",
              width: "min(100%, 1000px)",
            }}
          >
            <div
              className="close"
              onClick={(e) => {
                e.stopPropagation();
                setResize(false);
              }}
            >
              <div></div>
            </div>
            <img
              className="sc-s-18"
              width={"100%"}
              style={{ objectFit: "contain", maxHeight: "80vh" }}
              src={src}
              alt="el"
              loading="lazy"
            />
          </div>
        </div>
      )}
      <div className="img-grid">
        <img
          onClick={(e) => {
            e.stopPropagation();
            setResize(true);
          }}
          className="sc-s-18"
          style={{
            margin: ".5rem 0 .5rem 0",
            cursor: "zoom-in",
            maxWidth: "100%",
            // aspectRatio: "16/9",
            objectFit: "fit",

            maxHeight: "600px",
          }}
          // width={"100%"}
          src={src}
          alt="el"
          loading="lazy"
        />
      </div>
    </>
  );
}
