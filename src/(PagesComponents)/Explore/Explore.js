import React, { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getSubData } from "@/Helpers/Controlers";
import { getParsedPacksEvent } from "@/Helpers/Encryptions";
import { Virtuoso } from "react-virtuoso";
import Spinner from "@/Components/Spinner";
import bannedList from "@/Content/BannedList";
import { useSelector } from "react-redux";
import PackPreview from "./PackPreview";
import { saveUsers } from "@/Helpers/DB";
import { SelectTabs } from "@/Components/SelectTabs";

export default function Explore() {
  const { t } = useTranslation();
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const [sPacks, setSPacks] = useState([]);
  const [mPacks, setMPacks] = useState([]);
  const [lastSPTimestamp, setSPLastTimestamp] = useState(undefined);
  const [lastMPTimestamp, setMPLastTimestamp] = useState(undefined);
  const [selectedType, setSelectedType] = useState("starter");
  const [isLoading, setIsLoading] = useState(true);
  const typeKeys = ["starter", "media"];
  const [barHidden, setBarHidden] = useState(false);
  const lastY = useRef(0);
  const virtuosoRef = useRef(null);
  const packs = useMemo(() => {
    if (selectedType === "starter") return sPacks;
    return mPacks;
  }, [sPacks, mPacks, selectedType]);

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
        setIsLoading(true);
        let until =
          selectedType === "starter" ? lastSPTimestamp : lastMPTimestamp;
        let kinds = selectedType === "starter" ? [39089] : [39092];
        const data = await getSubData(
          [
            {
              kinds,
              limit: 50,
              until,
            },
          ],
          150,
        );
        let packs = data.data.map((pack) => getParsedPacksEvent(pack));
        packs = packs.filter((pack) => pack.pCount > 5);
        let packsPubkeys = packs.map((pack) => pack.pTags.slice(0, 5));
        packsPubkeys = packsPubkeys.flat();
        packsPubkeys = [...new Set(packsPubkeys)];
        saveUsers(packsPubkeys);
        if (selectedType === "starter") {
          setSPacks((prev) => [...packs, ...prev]);
        } else {
          setMPacks((prev) => [...packs, ...prev]);
        }
        if (packs.length === 0) setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedType, lastSPTimestamp, lastMPTimestamp]);

  const handleChangeSection = (index) => {
    setSelectedType(typeKeys[index]);
    virtuosoRef.current?.scrollToIndex({
      top: 32,
      align: "start",
      behavior: "instant",
    });
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
            <div style={{ minWidth: "260px" }}>
              <SelectTabs
                selectedTab={typeKeys.indexOf(selectedType)}
                tabs={[t("AVzZUeP"), t("AusIycI")]}
                setSelectedTab={handleChangeSection}
              />
            </div>
          </div>
          <div style={{ height: "32px" }} />
          {packs && packs.length > 0 && (
            <Virtuoso
              ref={virtuosoRef}
              style={{ width: "100%", height: "100vh" }}
              skipAnimationFrameInResizeObserver={true}
              overscan={1000}
              useWindowScroll={true}
              totalCount={packs.length}
              increaseViewportBy={1000}
              endReached={(index) => {
                if (selectedType === "starter")
                  setSPLastTimestamp(packs[index].created_at - 1);
                else setMPLastTimestamp(packs[index].created_at - 1);
              }}
              itemContent={(index) => {
                let pack = packs[index];
                if (![...userMutedList, ...bannedList].includes(pack.pubkey)) {
                  return <PackPreview pack={pack} />;
                }
              }}
            />
          )}
          {isLoading && (
            <div
              className="fit-container box-pad-v fx-centered fx-col"
              style={{ height: "60vh" }}
            >
              <Spinner size={32} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
