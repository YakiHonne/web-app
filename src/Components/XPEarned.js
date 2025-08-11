import React from "react";

export default function XPEarned() {
  
  return (
    <div
      className="fx-end-v fx-centered"
      style={{ position: "fixed", bottom: "0" }}
    >
      <div
        className=" box-pad-h box-pad-v fx-centered"
        style={{ width: "min(100%, 500px)" }}
      >
        <div
          className="popout fx-centered"
          style={{
            width: "100px",
            aspectRatio: "1/1",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--very-dim-gray)",
          }}
        >
          <div className="fx-centered">
            <h3 className="orange-c">+2</h3>
            <p className="p-big">xp</p>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "var(--very-dim-gray)",
            width: "min(calc(100% - 150px), 300px)",
            animationDelay: "4s",
          }}
          className="slide-up sc-s box-pad-h box-pad-v"
        ></div>
      </div>
    </div>
  );
}
