import React from "react";
import { useTranslation } from "react-i18next";
import { RelaysConfig } from "./RelaysConfig";

export function RelaysManagement({ selectedTab, setSelectedTab }) {
  const { t } = useTranslation();
  return (
    <div
      className={`fit-container fx-scattered fx-col pointer ${
        selectedTab === "relays" ? "sc-s box-pad-h-s box-pad-v-s" : ""
      }`}
      style={{
        overflow: "visible",
        borderBottom: "1px solid var(--very-dim-gray)",
        borderColor: "var(--very-dim-gray)",
        transition: "0.2s ease-in-out",
        gap: 0,
        borderRadius: 0
      }}
    >
      <div
        className="fx-scattered fit-container box-pad-h-m box-pad-v-m "
        onClick={() =>
          selectedTab === "relays"
            ? setSelectedTab("")
            : setSelectedTab("relays")
        }
      >
        <div className="fx-centered fx-start-h fx-start-v">
          <div className="box-pad-v-s">
            <div className="server-24"></div>
          </div>
          <div>
            <p>{t("A23C0Di")}</p>
            <p className="p-medium gray-c">{t("AUE3WRD")}</p>
          </div>
        </div>
        <div className="arrow"></div>
      </div>

      {selectedTab === "relays" && (
        <>
          <RelaysConfig />
        </>
      )}
    </div>
  );
}

export default RelaysManagement;
