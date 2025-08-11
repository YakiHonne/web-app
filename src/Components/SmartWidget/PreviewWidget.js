import React from "react";
import PreviewContainer from "@/Components/SmartWidget/PreviewContainer";

export default function PreviewWidget({ widget, pubkey }) {

  if (!widget || !(widget?.components && Array.isArray(widget?.components)))
    return;
  return (
    <div
      className="box-pad-h-m box-pad-v-m sc-s-18 fx-centered fx-col fit-container"
      style={{
        backgroundColor: widget.background_color,
        borderColor: widget.border_color,
        overflow: "visible",
        gap: "12px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {widget.components.map((widget_, index) => {
        return (
          <PreviewContainer metadata={widget_} key={index} pubkey={pubkey} />
        );
      })}
    </div>
  );
}
