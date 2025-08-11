import React from "react";
import MiniApp from "@/Components/MiniApp";
import WidgetCardV2 from "@/Components/WidgetCardV2";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";

export default function LaunchSW({ metadata, exit }) {
  if (metadata.type !== "basic")
    return <MiniApp url={metadata.buttons[0].url} exit={exit} />;

  if (metadata.type === "basic")
    return (
      <div
        className="fixed-container fx-centered box-pad-h"
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div
          style={{ width: "min(100%, 550px)", overflow: "scroll", maxHeight: "80vh" }}
          className="sc-s-18 fx-centered fx-start-v fx-start-h fx-col bg-sp box-pad-h-m box-pad-v-m"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="fit-container fx-scattered">
            <h4 className="p-maj">{metadata.title}</h4>
            <div
              className="close"
              style={{ position: "static" }}
              onClick={exit}
            >
              <div></div>
            </div>
          </div>
          <WidgetCardV2
            widget={{
              ...metadata,
              metadata: metadata,
              author: getEmptyuserMetadata(metadata.pubkey),
            }}
            header={false}
            authPreviewPosition="top"
          />
        </div>
      </div>
    );
}
