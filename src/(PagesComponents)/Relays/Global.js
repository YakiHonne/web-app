import React, { useEffect, useState } from "react";
import RelayPreview from "./RelayPreview/RelayPreview";
import { useTranslation } from "react-i18next";
import LoadingDots from "@/Components/LoadingDots";
import { trimRelay } from "@/Helpers/Helpers";
import Icon from "@/Components/Icon";
import { iconsNames } from "@/Content/IconV2URL";

export default function Global({
  relays,
  relaysBatch,
  setRelaysBatch,
  favoredList = [],
  barHidden = false,
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!search) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    let timer = setTimeout(() => {
      setSearchResults(relays.filter((relay) => relay.includes(search)));
      clearTimeout(timer);
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  const handleRelayClick = () => {
    let newRelays = relays.slice(relaysBatch.length, relaysBatch.length + 8);
    setRelaysBatch((prev) => [...prev, ...newRelays]);
  };

  return (
    <div className="fit-container fx-centered fx-col box-pad-v">
      <div
        className="bg-dropdown fx-centered"
        style={{
          position: "fixed",
          top: barHidden ? "104px" : "160px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 199,
          width: "min(480px, calc(100vw - 48px))",
          borderRadius: "9999px",
          padding: "4px 4px 4px 14px",
          gap: "8px",
          opacity: barHidden ? 0 : 1,
          pointerEvents: barHidden ? "none" : "auto",
          transition:
            "top 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
        }}
      >
        <Icon name={iconsNames.search_magnifying_glass} v={2} />
        <input
          type="text"
          className="if ifs-full if-no-border"
          style={{ height: "32px", background: "transparent", paddingLeft: 0 }}
          placeholder={t("AWiH4mf")}
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div style={{ height: "60px" }} />

      {!isLoading && !search && (
        <>
          <div className="fit-container box-pad-v-m">
            <h4>{relays.length} relays</h4>
          </div>
          {relaysBatch.map((relay) => {
            let pubkeys = favoredList.find(
              (_) => trimRelay(_.url) === trimRelay(relay)
            );
            pubkeys = pubkeys ? pubkeys.pubkeys : [];
            return (
              <RelayPreview url={relay} key={relay} favoredList={pubkeys} />
            );
          })}
          <button className="btn btn-normal" onClick={handleRelayClick}>
            {t("AxJRrkn")}
          </button>
        </>
      )}
      {search && (
        <>
          {searchResults.map((relay) => {
            let pubkeys = favoredList.find(
              (_) => trimRelay(_.url) === trimRelay(relay)
            );
            pubkeys = pubkeys ? pubkeys.pubkeys : [];
            return (
              <RelayPreview url={relay} key={relay} favoredList={pubkeys} />
            );
          })}
        </>
      )}
      {isLoading && (
        <div
          className="fit-container fit-height fx-centered"
          style={{ height: "60vh" }}
        >
          <LoadingDots />
        </div>
      )}
    </div>
  );
}
