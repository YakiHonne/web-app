import React, { useEffect, useState } from "react";
import RelayPreview from "./RelayPreview/RelayPreview";
import { useTranslation } from "react-i18next";
import LoadingDots from "@/Components/LoadingDots";

export default function Global({ relays, relaysBatch, setRelaysBatch }) {
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
      <div className="box-pad-h-m box-pad-v-s sc-s-18 bg-sp fx-centered fit-container">
        <div className="search"></div>
        <input
          type="text"
          className="if ifs-full if-no-border"
          style={{ height: "40px" }}
          placeholder="Search relays..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {!isLoading && !search && (
        <>
          <div className="fit-container box-pad-v-m">
            <h4>{relays.length} relays</h4>
          </div>
          {relaysBatch.map((relay) => {
            return <RelayPreview url={relay} key={relay} />;
          })}
          <button className="btn btn-normal" onClick={handleRelayClick}>
            {t("AxJRrkn")}
          </button>
        </>
      )}
      {search && (
        <>
          {searchResults.map((relay) => {
            return <RelayPreview url={relay} key={relay} />;
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
