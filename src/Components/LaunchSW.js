import React from "react";
import MiniApp from "@/Components/MiniApp";
import WidgetCardV2 from "@/Components/WidgetCardV2";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import Overlay from "@/Components/Overlay";

export default function LaunchSW({ metadata, exit }) {
  if (metadata.type !== "basic")
    return <MiniApp url={metadata.buttons[0].url} exit={exit} />;

  if (metadata.type === "basic")
    return (
      <Overlay exit={exit} width={550}>
        <div
          className="fx-centered fx-start-v fx-start-h fx-col box-pad-h-m box-pad-v-m"
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
    </Overlay>
    );
}
