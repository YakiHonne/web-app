import React from "react";
import emojis from "@/Content/Emojis";


export default function EmojisList({ onClick, position = "right" }) {
  
  return (
    <div
      style={{
        position: "absolute",
        [position]: "0px",
        top: "-30px",
        width: "275px",
        height: "250px",
        transform: "translateY(-100%)",
        boxShadow: "14px 12px 105px -41px rgba(0, 0, 0, 0.25)",
        overflow: "scroll",
        columnGap: 0,
        backgroundColor: "var(--very-dim-gray)"
      }}
      className=" box-pad-h-m box-pad-v-m sc-s-18 fx-scattered fx-wrap fx-start-h"
    >
      {emojis.map((item, index) => {
        return (
          <span className="p-medium pointer emojis-picker" role="img" key={index} onClick={(e) => onClick(e, item)}>
            {item}
          </span>
        );
      })}
    </div>
  );
}
