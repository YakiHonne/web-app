import React, { useState } from "react";
import Link from "next/link";
import AddYakiWallet from "@/Components/AddYakiWallet";
import { SparkWalletSetup } from "@/Components/Spark";
import { useTranslation } from "react-i18next";

export default function AddWallet({ exit, refresh }) {
  const { t } = useTranslation();
  const [showSparkSetup, setShowSparkSetup] = useState(false);

  if (showSparkSetup) {
    return (
      <div
        className="fixed-container fx-centered box-pad-h"
        style={{ zIndex: "1000" }}
        onClick={(e) => {
          e.stopPropagation();
          exit();
        }}
      >
        <div
          className="sc-s box-pad-h box-pad-v fx-centered fx-col bg-sp"
          style={{ width: "min(100%, 700px)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <SparkWalletSetup
            onComplete={() => {
              refresh();
              exit();
            }}
            onCancel={() => setShowSparkSetup(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      style={{ zIndex: "1000" }}
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="sc-s box-pad-h box-pad-v fx-centered fx-col bg-sp"
        style={{ width: "min(100%,500px)", position: "relative" }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4 className="box-marg-s">{t("A8fEwNq")}</h4>

        <AddYakiWallet refresh={refresh} />
        <div
          className="fit-container fx-scattered sc-s-18 box-pad-h-s box-pad-v-s option pointer"
          style={{ backgroundColor: "transparent" }}
          onClick={() => setShowSparkSetup(true)}
        >
          <div className="fx-centered">
            <div
              className="fx-centered"
              style={{ width: "48px", height: "48px" }}
            >
              <svg width="32" height="32" viewBox="0 0 52 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30.968.273l-.494 18.251 17.358-5.994 3.205 9.905-17.625 5.17 11.172 14.64-8.63 5.891-10.33-14.95-10.488 14.97-8.471-6.12 11.206-14.48-17.59-5.284 3.266-9.884 17.322 6.105-.377-18.24 10.476.02z" fill="currentColor"></path>
              </svg>
            </div>
            <div>
              <p>
                Spark Wallet <span className="p-medium gray-c" style={{ fontWeight: 'normal' }}>(Non-Custodial)</span>
              </p>
              <p className="gray-c p-medium">Breez SDK Lightning Wallet</p>
            </div>
          </div>
          <div className="box-pad-h-s">
            <div className="plus-sign"></div>
          </div>
        </div>
        <div className="fit-container fx-centered">
          <p>{t("AvVawBi")}</p>
        </div>
        <Link
          className="fit-container fx-scattered sc-s-18 box-pad-h-s box-pad-v-s option pointer"
          style={{ backgroundColor: "transparent" }}
          href={"/wallet/nwc"}
          onClick={exit}
        >
          <div className="fx-centered">
            <div
              className="nwc-logo-24"
              style={{ width: "48px", height: "48px" }}
            ></div>
            <div>
              <p>{t("AO3Hd2n")}</p>
              <p className="gray-c p-medium">{t("Ah0bYM3")}</p>
            </div>
          </div>
          <div className="box-pad-h-s">
            <div className="plus-sign"></div>
          </div>
        </Link>
        <div
          className="fit-container fx-scattered sc-s-18 box-pad-h-s box-pad-v-s option pointer"
          style={{ backgroundColor: "transparent" }}
          onClick={() =>
            (window.location.href = process.env.NEXT_PUBLIC_ALBY_ALBY_CONNECT)
          }
        >
          <div className="fx-centered">
            <div
              className="alby-logo-24"
              style={{ width: "48px", height: "48px" }}
            ></div>
            <div>
              <p>Alby</p>
              <p className="gray-c p-medium">{t("AFB7e2a")}</p>
            </div>
          </div>
          <div className="box-pad-h-s">
            <div className="plus-sign"></div>
          </div>
        </div>
        <p className="gray-c p-medium p-centered">{t("APcRx0f")}</p>
      </div>
    </div>
  );
}
