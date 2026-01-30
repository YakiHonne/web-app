import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import WalletManagement from "./WalletManagement";

export default function CashuWalletCreation() {
  const { t } = useTranslation();
  const [launchWalletCreationProcess, setLaunchWalletCreationProcess] =
    useState(false);
  return (
    <>
      <div className="fx-centered fx-col fit-container sc-s box-pad-h box-pad-v bg-sp">
        <div
          className="wallet-24"
          style={{ minWidth: "48px", minHeight: "48px" }}
        ></div>
        <h3>{t("AvjCl1G")}</h3>
        <p className="gray-c p-centered">{t("ANGBA5u")}</p>
        <div className="fit-container fx-centered box-pad-v-s box-pad-h-m">
          <button
            className="btn btn-normal"
            onClick={() => setLaunchWalletCreationProcess(true)}
          >
            {t("AvjCl1G")}
          </button>
        </div>
      </div>
      {launchWalletCreationProcess && (
        <WalletManagement exit={() => setLaunchWalletCreationProcess(false)} />
      )}
    </>
  );
}
