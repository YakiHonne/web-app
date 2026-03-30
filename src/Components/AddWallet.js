import React from "react";
import Link from "next/link";
import AddYakiWallet from "@/Components/AddYakiWallet";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";

export default function AddWallet({ exit, refresh }) {
  const { t } = useTranslation();
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
        <div className="fit-container fx-centered">
          <p>{t("AvVawBi")}</p>
        </div>
        <Link
          className="fit-container fx-scattered sc-s-18 box-pad-h-s box-pad-v-s option pointer"
          style={{ backgroundColor: "transparent" }}
          href={"/lightning-wallet/nwc"}
          onClick={exit}
        >
          <div className="fx-centered">
            <Icon name="nwc-logo" size={24} isColored/>
            <div>
              <p>{t("AO3Hd2n")}</p>
              <p className="gray-c p-medium">{t("Ah0bYM3")}</p>
            </div>
          </div>
          <div className="box-pad-h-s">
            <Icon name="plus-sign" />
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
            <Icon name="alby-logo" size={24} isColored/>
            <div>
              <p>Alby</p>
              <p className="gray-c p-medium">{t("AFB7e2a")}</p>
            </div>
          </div>
          <div className="box-pad-h-s">
            <Icon name="plus-sign" />
          </div>
        </div>
        <p className="gray-c p-medium p-centered">{t("APcRx0f")}</p>
      </div>
    </div>
  );
}
