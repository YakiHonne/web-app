import React from "react";
import RelayPreview from "./RelayPreview/RelayPreview";

export default function Collections({ collections }) {
  return (
    <div className="fit-container fx-centered fx-col box-pad-v">
      {collections.map((collection) => {
        return (
          <div className="fit-container fx-centered fx-col fx-start-h fx-start-v box-pad-v-s" key={collection.id}>
            <h4>{collection.name}</h4>
            <p className="gray-c">{collection.description}</p>
            <div className="fit-container fx-centered fx-col">
              {collection.relays.map((relay) => {
                return <RelayPreview url={relay} key={relay} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
