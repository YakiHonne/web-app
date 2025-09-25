import LoadingDots from "@/Components/LoadingDots";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Global from "./Global";
import Collections from "./Collections";
import useFollowingsFavRelays from "@/Hooks/useFollowingsFavRelays";
import LocalAggregated from "./LocalAggregated";
import useOutboxRelays from "@/Hooks/useOutboxRelays";

export default function Relays() {
  const { t } = useTranslation();
  const { followingsFavRelays } = useFollowingsFavRelays();
  const { outboxRelays } = useOutboxRelays();
  const [category, setCategory] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [relaysCollections, setRelaysCollections] = useState([]);
  const [globalRelaysBatch, setGlobalRelaysBatch] = useState([]);
  const [outboxRelaysBatch, setOutboxRelaysBatch] = useState([]);
  const [followingsRelaysBatch, setFollowingsRelaysBatch] = useState([]);
  const [relays, setRelays] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRelays, relaysCollections] = await Promise.all([
          axios.get("https://api.nostr.watch/v1/online"),
          axios.get(
            "https://raw.githubusercontent.com/CodyTseng/awesome-nostr-relays/master/dist/collections.json"
          ),
        ]);
        setRelaysCollections(relaysCollections.data?.collections);
        setRelays(allRelays.data);
        setGlobalRelaysBatch(allRelays.data.slice(0, 8));
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div
        className="fit-container fx-centered fx-start-v"
        style={{ minHeight: "100vh" }}
      >
        <div className="fit-container fx-centered fx-start-v fx-col box-pad-h-m box-pad-v">
          <h2>Explore Relays</h2>
          <div
            className="sticky fit-container"
            style={{ padding: 0, marginTop: "1rem", zIndex: 100 }}
          >
            <div
              className="fit-container fx-even"
              style={{
                paddingTop: 0,
                paddingBottom: 0,
                columnGap: 0,
                borderBottom: "1px solid var(--very-dim-gray)",
                borderTop: "1px solid var(--very-dim-gray)",
              }}
            >
              <div
                className={`list-item-b fx-centered fx ${
                  category === 1 ? "selected-list-item-b" : ""
                }`}
                onClick={() => setCategory(1)}
              >
                {t("A9b04Ry")}
              </div>
              <div
                className={`list-item-b fx-centered fx ${
                  category === 2 ? "selected-list-item-b" : ""
                }`}
                onClick={() => setCategory(2)}
              >
                {t("A9TqNxQ")}
              </div>
              <div
                className={`list-item-b fx-centered fx ${
                  category === 3 ? "selected-list-item-b" : ""
                }`}
                onClick={() => setCategory(3)}
              >
                {t("AizJ5ib")}
              </div>
              <div
                className={`list-item-b fx-centered fx ${
                  category === 4 ? "selected-list-item-b" : ""
                }`}
                onClick={() => setCategory(4)}
              >
                {t("A0gGIxM")}
              </div>
            </div>
          </div>
          {isLoading && (
            <div
              className="fit-container fx-centered"
              style={{ height: "60vh" }}
            >
              <LoadingDots />
            </div>
          )}
          {!isLoading && (
            <>
              {category === 1 && (
                <LocalAggregated
                  relays={outboxRelays}
                  relaysBatch={outboxRelaysBatch}
                  setRelaysBatch={setOutboxRelaysBatch}
                />
              )}
            </>
          )}
          {!isLoading && (
            <>
              {category === 2 && (
                <LocalAggregated
                  relays={followingsFavRelays}
                  relaysBatch={followingsRelaysBatch}
                  setRelaysBatch={setFollowingsRelaysBatch}
                  favoredList={true}
                />
              )}
            </>
          )}
          {!isLoading && (
            <>
              {category === 3 && (
                <Collections collections={relaysCollections} />
              )}
            </>
          )}
          {!isLoading && (
            <>
              {category === 4 && (
                <Global
                  relays={relays}
                  relaysBatch={globalRelaysBatch}
                  setRelaysBatch={setGlobalRelaysBatch}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
