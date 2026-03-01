import React, { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getSubData } from "@/Helpers/Controlers";
import { getParsedPacksEvent } from "@/Helpers/Encryptions";
import { Virtuoso } from "react-virtuoso";
import LoadingLogo from "@/Components/LoadingLogo";
import bannedList from "@/Content/BannedList";
import { useSelector } from "react-redux";
import PackPreview from "./PackPreview";
import { saveUsers } from "@/Helpers/DB";

export default function Explore() {
  const { t } = useTranslation();
  const { userMutedList } = useSelector((state) => state.userMutedList);
  const [sPacks, setSPacks] = useState([]);
  const [mPacks, setMPacks] = useState([]);
  const [lastSPTimestamp, setSPLastTimestamp] = useState(undefined);
  const [lastMPTimestamp, setMPLastTimestamp] = useState(undefined);
  const [selectedType, setSelectedType] = useState("starter");
  const [isLoading, setIsLoading] = useState(true);
  const virtuosoRef = useRef(null);
  const packs = useMemo(() => {
    if (selectedType === "starter") return sPacks;
    return mPacks;
  }, [sPacks, mPacks, selectedType]);

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

  const handleChangeSection = (type) => {
    setSelectedType(type);
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
          <h3>{t("ABxLOSx")}</h3>
          <p className="gray-c p-big">{t("Az99wFD")}</p>
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
                  selectedType === "starter" ? "selected-list-item-b" : ""
                }`}
                onClick={() => handleChangeSection("starter")}
              >
                {t("AVzZUeP")}
              </div>
              <div
                className={`list-item-b fx-centered fx ${
                  selectedType === "media" ? "selected-list-item-b" : ""
                }`}
                onClick={() => handleChangeSection("media")}
              >
                {t("AusIycI")}
              </div>
            </div>
          </div>
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
              <LoadingLogo size={64} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
