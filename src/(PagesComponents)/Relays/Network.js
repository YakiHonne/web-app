import React from "react";
import RelayPreview from "./RelayPreview/RelayPreview";

export default function Network({ relays }) {
  return (
    <div className="fit-container fx-centered fx-col box-pad-v">
      {relays.map((relay) => {
        return <RelayPreview url={relay.url} key={relay.url} />;
      })}
    </div>
  );
}
