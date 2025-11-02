import React from "react";
import RelayPreview from "./RelayPreview/RelayPreview";
import { trimRelay } from "@/Helpers/Helpers";

export default function Collections({ collections, favoredList = [] }) {
  return (
    <div className="fit-container fx-centered fx-col box-pad-v">
      {collections.map((collection) => {
        return (
          <div
            className="fit-container fx-centered fx-col fx-start-h fx-start-v box-pad-v-s"
            key={collection.id}
          >
            <h4>{collection.name}</h4>
            <p className="gray-c">{collection.description}</p>
            <div className="fit-container fx-centered fx-col">
              {collection.relays.map((relay) => {
                let pubkeys = favoredList.find(
                  (_) => trimRelay(_.url) === trimRelay(relay)
                );
                pubkeys = pubkeys ? pubkeys.pubkeys : [];
                return (
                  <RelayPreview url={relay} key={relay} favoredList={pubkeys} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
