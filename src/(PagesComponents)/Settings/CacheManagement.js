import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setToast } from "../../Store/Slides/Publishers";
import { getStorageEstimate, makeReadableNumber } from "../../Helpers/Helpers";
import { clearDBCache } from "../../Helpers/DB";
import LoadingDots from "../../Components/LoadingDots";
import Toggle from "@/Components/Toggle";

export function CacheManagement({ selectedTab, setSelectedTab }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [cacheSize, setCacheSize] = useState(0);
  const [isCacheClearing, setIsCacheClearing] = useState(false);
  const [autoClearCache, setAutoClearCache] = useState(
    localStorage.getItem("autoClearCache")
  );

  useEffect(() => {
    const dbSize = async () => {
      let size = await getStorageEstimate();
      setCacheSize(size);
    };
    dbSize();
  }, []);

  const clearAppCache = async () => {
    try {
      if (isCacheClearing) return false;
      setIsCacheClearing(true);
      let status = await clearDBCache();
      if (status) {
        localStorage?.removeItem("warning-bar-closed");
        dispatch(setToast({ type: 1, desc: t("A0GMVeT") }));
        window.location.reload();
      } else dispatch(setToast({ type: 2, desc: t("Acr4Slu") }));
      setIsCacheClearing(false);
    } catch (err) {
      console.log(err);
      setIsCacheClearing(false);
      dispatch(setToast({ type: 2, desc: t("Acr4Slu") }));
    }
  };

  const handleAutoClearCache = () => {
    if (!autoClearCache) {
      setAutoClearCache(!autoClearCache);
      localStorage?.setItem("autoClearCache", `${Date.now()}`);
    } else {
      setAutoClearCache(!autoClearCache);
      localStorage?.removeItem("autoClearCache");
    }
  };

  return (
    <div
      className={`fit-container fx-scattered fx-col pointer ${
        selectedTab === "cache" ? "sc-s box-pad-h-s box-pad-v-s" : ""
      }`}
      style={{
        borderBottom: "1px solid var(--very-dim-gray)",
        gap: 0,
        borderColor: "var(--very-dim-gray)",
        transition: "0.2s ease-in-out",
        borderRadius: 0
      }}
    >
      <div
        className="fx-scattered fit-container  box-pad-h-m box-pad-v-m "
        onClick={() =>
          selectedTab === "cache" ? setSelectedTab("") : setSelectedTab("cache")
        }
      >
        <div className="fx-centered fx-start-h fx-start-v">
          <div className="box-pad-v-s">
            <div className="cache-24"></div>
          </div>
          <div>
            <p>{t("AZEJWnf")}</p>
            <p className="p-medium gray-c">{t("AHV4nwK")}</p>
          </div>
        </div>
        <div className="arrow"></div>
      </div>
      {selectedTab === "cache" && (
        <div className="fit-container fx-col fx-centered box-pad-h-m box-pad-v-m">
          <div className="fit-container fx-scattered">
            <div>
              <p>{t("AmtslmY")}</p>
              <p className="gray-c p-medium">{t("A9Kte8F")}</p>
            </div>
            <Toggle status={autoClearCache} setStatus={handleAutoClearCache} />
          </div>
          <div className="fx-scattered fit-container">
            <p>{t("AfcEwqC")}</p>
            <p className={cacheSize > 4000 ? "red-c" : "gray-c"}>
              {cacheSize > 4000 ? (
                <span className="p-medium"> ({t("AhfkjK3")}) </span>
              ) : (
                ""
              )}
              {makeReadableNumber(cacheSize)} MB{" "}
            </p>
          </div>
          <div className="fx-centered fit-container fx-end-h">
            <button
              className="btn btn-small btn-normal"
              onClick={clearAppCache}
              disabled={isCacheClearing}
            >
              {isCacheClearing ? <LoadingDots /> : t("AWj8yOR")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CacheManagement;
