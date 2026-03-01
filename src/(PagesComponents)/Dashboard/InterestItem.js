import React from "react";

export default function InterestItem({ item, handleItemInList, index }) {
  return (
    <div className="fx-scattered  sc-s-18 bg-sp box-pad-h-m box-pad-v-s fit-container">
      <div className="fx-centered">
        <div
          style={{
            minWidth: `38px`,
            aspectRatio: "1/1",
            position: "relative",
          }}
          className="sc-s-18 fx-centered"
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 2,
              backgroundImage: `url(${item.icon})`,
            }}
            className="bg-img cover-bg  fit-container fit-height"
          ></div>
          <p
            className={"p-bold p-caps p-big"}
            style={{ position: "relative", zIndex: 1 }}
          >
            {item.item.charAt(0)}
          </p>
        </div>
        <p className="p-caps">{item.item}</p>
      </div>
      <div className="fx-centered">
        {!item.toDelete && (
          <div
            onClick={() => handleItemInList(false, index)}
            className="round-icon-small"
          >
            <div className="trash"></div>
          </div>
        )}
        {item.toDelete && (
          <div
            onClick={() => handleItemInList(true, index)}
            className="round-icon-small"
          >
            <div className="undo"></div>
          </div>
        )}
        <div
          className="drag-el"
          style={{
            minWidth: "16px",
            aspectRatio: "1/1",
          }}
        ></div>
      </div>
    </div>
  );
}
