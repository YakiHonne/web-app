import { shortenKey } from "@/Helpers/Encryptions";
import { copyText } from "@/Helpers/Helpers";
import React from "react";
import { useTranslation } from "react-i18next";

export default function RelayRequestCode({ code, exit }) {
  const { t } = useTranslation();
  const handleCopy = () => {
    copyText(code, t("AtjfqfF"));
    exit();
  };
  return (
    <div
      className="fixed-container box-pad-h fx-centered"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="box-pad-h box-pad-v sc-s bg-sp fx-centered fx-col slide-up"
        style={{ position: "relative", width: "min(100%, 500px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4>{t("AsiB5O1")}</h4>
        <p className="gray-c p-centered">{t("A8cYhcD")}</p>
        <div
          className="fit-container sc-s-d fx-scattered box-pad-h-m box-pad-v-m pointer"
          onClick={handleCopy}
        >
          <p>{shortenKey(code, 20)}</p>
          <div className="copy"></div>
        </div>
      </div>
    </div>
  );
}
