import React from "react";
import { useTranslation } from "react-i18next";
import { copyText } from "@/Helpers/Helpers";
import { shortenKey } from "@/Helpers/Encryptions";

export default function UnsupportedKindPreview({ addr }) {
  const { t } = useTranslation();
  return (
    <div
      className="fit-container fx-scattered box-pad-h-m box-pad-v-s sc-s-18"
      style={{ margin: ".5rem 0", overflow: "visible" }}
    >
      <div>
        <p className="gray-c">{t("AcFjmGe")}</p>
        <p>{shortenKey(addr, 20)}</p>
      </div>
      <div className="fx-centered">
        <div
          className="round-icon-small round-icon-tooltip"
          data-tooltip={t("ArCMp34")}
          onClick={() => copyText(addr, t("AQf5QYH"))}
        >
          <div className="copy"></div>
        </div>
        <a href={`https://njump.me/${addr}`} target="_blank">
          <div
            className="round-icon-small round-icon-tooltip"
            data-tooltip={t("Aaa3apb")}
          >
            <div className="share-icon"></div>
          </div>
        </a>
      </div>
    </div>
  );
}
