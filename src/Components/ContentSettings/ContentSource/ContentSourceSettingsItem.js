import React from "react";
import Toggle from "@/Components/Toggle";
import RelayImage from "@/Components/RelayImage";
import ContentFeedCategoryPreview from "./ContentFeedCategoryPreview";

export default function ContentSourceSettingsItem({
  group,
  item,
  handleToggleOption,
}) {
  if (group.value === "af") {
    return (
      <div className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s">
        <div className="fx-centered">
          <RelayImage url={item.value} size={32} />
          <div>
            <p>{item.display_name}</p>
            <p className="gray-c">{item.value}</p>
          </div>
        </div>
        <div className="fx-centered">
          <Toggle
            status={item.enabled}
            setStatus={() => handleToggleOption(group.value, item.value)}
          />
          <div
            className="drag-el"
            style={{ minWidth: "16px", aspectRatio: "1/1" }}
          ></div>
        </div>
      </div>
    );
  }
  return (
    <div className="fx-scattered fit-container sc-s-18 bg-sp box-pad-h-s box-pad-v-s" style={{cursor: "grab"}}>
      <div className="fx-centered">
        <ContentFeedCategoryPreview category={{ group: group.value, ...item }} />
      </div>
      <div className="fx-centered">
        <Toggle
          status={item.enabled}
          setStatus={() => handleToggleOption(group.value, item.value)}
        />
        <div
          className="drag-el"
          style={{ minWidth: "16px", aspectRatio: "1/1" }}
        ></div>
      </div>
    </div>
  );
}
