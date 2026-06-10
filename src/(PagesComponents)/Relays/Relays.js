import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Global from "./Global";
import Collections from "./Collections";
import useFollowingsFavRelays from "@/Hooks/useFollowingsFavRelays";
import useOutboxRelays from "@/Hooks/useOutboxRelays";
import Followings from "./Followings";
import Network from "./Network";
import { sleepTimer } from "@/Helpers/Helpers";
import Spinner from "@/Components/Spinner";
import { SelectTabs } from "@/Components/SelectTabs";

export default function Relays() {
  const { t } = useTranslation();
  const { followingsFavRelays } = useFollowingsFavRelays();
  const { outboxRelays } = useOutboxRelays();
  const [category, setCategory] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [relaysCollections, setRelaysCollections] = useState([]);
  const [globalRelaysBatch, setGlobalRelaysBatch] = useState([]);
  const [outboxRelaysBatch, setOutboxRelaysBatch] = useState([]);
  const [followingsRelaysBatch, setFollowingsRelaysBatch] = useState([]);
  const [relays, setRelays] = useState([]);
  const [barHidden, setBarHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setBarHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchGlobalRelays();
        await fetchCollectionsRelays();
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const fetchGlobalRelays = async () => {
    try {
      const relaysList = await Promise.race([
        axios.get("https://cache-v2.yakihonne.com/api/v1/relays"),
        sleepTimer(2000),
      ]);
      setRelays(relaysList ? relaysList.data : []);
      setGlobalRelaysBatch(relaysList ? relaysList.data.slice(0, 8) : []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCollectionsRelays = async () => {
    try {
      const relaysList = await Promise.race([
        axios.get(
          "https://raw.githubusercontent.com/CodyTseng/awesome-nostr-relays/master/dist/collections.json"
        ),
        sleepTimer(2000),
      ]);
      setRelaysCollections(relaysList ? relaysList.data?.collections : []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div
        className="fit-container fx-centered fx-start-v"
        style={{ minHeight: "100vh" }}
      >
        <div className="fit-container fx-centered fx-start-v fx-col box-pad-h-m box-pad-v">
          <div
            style={{
              position: "fixed",
              top: "96px",
              left: "50%",
              transform: barHidden ? "translateX(-50%) translateY(-24px)" : "translateX(-50%) translateY(0)",
              opacity: barHidden ? 0 : 1,
              pointerEvents: barHidden ? "none" : "auto",
              zIndex: 200,
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
            }}
          >
            <div>
              <SelectTabs
                selectedTab={category}
                tabs={[t("A9b04Ry"), t("A9TqNxQ"), t("AizJ5ib"), t("A0gGIxM")]}
                setSelectedTab={setCategory}
              />
            </div>
          </div>
          <div style={{ height: "32px" }} />
          {isLoading && (
            <div
              className="fit-container box-pad-v fx-centered fx-col"
              style={{ height: "60vh" }}
            >
              <Spinner size={32} />
            </div>
          )}
          {!isLoading && (
            <>
              {category === 0 && (
                <Network
                  relays={outboxRelays}
                  relaysBatch={outboxRelaysBatch}
                  setRelaysBatch={setOutboxRelaysBatch}
                  favoredList={followingsFavRelays}
                />
              )}
              {category === 1 && (
                <Followings
                  relays={followingsFavRelays}
                  relaysBatch={followingsRelaysBatch}
                  setRelaysBatch={setFollowingsRelaysBatch}
                  favoredList={true}
                />
              )}
              {category === 2 && (
                <Collections
                  collections={relaysCollections}
                  favoredList={followingsFavRelays}
                />
              )}
              {category === 3 && (
                <Global
                  relays={relays}
                  relaysBatch={globalRelaysBatch}
                  setRelaysBatch={setGlobalRelaysBatch}
                  favoredList={followingsFavRelays}
                  barHidden={barHidden}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
