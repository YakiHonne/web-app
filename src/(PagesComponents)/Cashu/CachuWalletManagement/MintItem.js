import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MintDetails from "./MintDetails";

export default function MintItem({ mint, isSelected, onClick }) {
  const { t } = useTranslation();
  const [showAbout, setShowabout] = useState(false);
  const mintInfo = { ...mint.data, url: mint.url };
  return (
    <>
      {showAbout && (
        <MintDetails mintInfo={mintInfo} exit={() => setShowabout(false)} />
      )}
      <div
        className="box-pad-h-m box-pad-v-m sc-s-18 bg-sp fit-container fx-scattered"
        style={{
          marginBottom: ".5rem",
          borderColor: isSelected ? "var(--green-main)" : "",
        }}
      >
        <div className="fx-centered">
          <div
            style={{
              backgroundImage: `url(${mintInfo.icon_url})`,
              minWidth: "48px",
              minHeight: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--pale-gray)",
            }}
            className="bg-img cover-bg"
          ></div>
          <div>
            <p className="gray-c p-medium p-one-line">{mintInfo.url}</p>
            <p className="p-caps p-one-line">{mintInfo.name}</p>
            <p className="gray-c p-one-line">{mintInfo.description}</p>
          </div>
        </div>
        <div className="fx-centered">
          <button
            className="btn btn-gray btn-small"
            style={{ minWidth: "max-content" }}
            onClick={() => setShowabout(true)}
          >
            {t("AqahbHm")}
          </button>
          <div
            className="round-icon-small pointer"
            onClick={() => onClick(mintInfo.url)}
          >
            {!isSelected && <div className="plus-sign"></div>}
            {isSelected && <div className="trash"></div>}
          </div>
        </div>
      </div>
    </>
  );
}
