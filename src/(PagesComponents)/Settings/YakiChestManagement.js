import LoginWithAPI from "@/Components/LoginWithAPI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

export default function YakiChestManagement() {
  const { t } = useTranslation();
  const isYakiChestLoaded = useSelector((state) => state.isYakiChestLoaded);
  const yakiChestStats = useSelector((state) => state.yakiChestStats);
  const [showYakiChest, setShowYakiChest] = useState(false);

  return (
    <>
      {showYakiChest && <LoginWithAPI exit={() => setShowYakiChest(false)} />}
      <div
        className="fit-container fx-scattered box-pad-h-m box-pad-v-m pointer"
        style={{
          borderBottom: "1px solid var(--very-dim-gray)",
        }}
      >
        <div className="fx-centered fx-start-h fx-start-v">
          <div className="box-pad-v-s">
            <div className="cup-24"></div>
          </div>
          <div>
            <p>{t("ACALoWH")}</p>
            <p className="p-medium gray-c">{t("AF2ceO1")}</p>
          </div>
        </div>
        {yakiChestStats && isYakiChestLoaded && (
          <div className="fx-centered">
            <p className="green-c p-medium">{t("A5aXNG9")}</p>
            <div
              style={{
                minWidth: "8px",
                aspectRatio: "1/1",
                backgroundColor: "var(--green-main)",
                borderRadius: "var(--border-r-50)",
              }}
            ></div>
          </div>
        )}
        {!yakiChestStats && isYakiChestLoaded && (
          <div className="fx-centered">
            <button
              className="btn btn-small btn-normal"
              onClick={() => setShowYakiChest(true)}
            >
              {t("Azb0lto")}
            </button>
          </div>
        )}
        {!isYakiChestLoaded && (
          <div className="fx-centered">
            <LoadingDots />
          </div>
        )}
      </div>
    </>
  );
}
