import React, { useEffect } from "react";
import RelayPreview from "./RelayPreview/RelayPreview";
import { useTranslation } from "react-i18next";

export default function LocalAggregated({
  relays,
  relaysBatch,
  setRelaysBatch,
  favoredList = false,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (relaysBatch.length === 0) {
      setRelaysBatch(relays.slice(0, 8));
    }
  }, [relaysBatch]);

  const handleRelayClick = () => {
    let newRelays = relays.slice(relaysBatch.length, relaysBatch.length + 8);
    setRelaysBatch((prev) => [...prev, ...newRelays]);
  };
  return (
    <div className="fit-container fx-centered fx-col box-pad-v">
      {relaysBatch.map((relay) => {
        return (
          <RelayPreview
            url={relay.url}
            key={relay.url}
            favoredList={favoredList ? relay.pubkeys : []}
          />
        );
      })}
      {relaysBatch.length < relays.length && (
        <button className="btn btn-normal" onClick={handleRelayClick}>
          {t("AxJRrkn")}
        </button>
      )}
    </div>
  );
}
