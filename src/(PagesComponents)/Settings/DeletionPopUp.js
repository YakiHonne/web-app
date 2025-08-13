import React from "react";
import { useTranslation } from "react-i18next";
import { copyText } from "../../Helpers/Helpers";
import { shortenKey } from "../../Helpers/Encryptions";

export function DeletionPopUp({ exit, handleDelete, wallet }) {
  const { t } = useTranslation();

  return (
    <section className="fixed-container fx-centered box-pad-h">
      <section
        className="fx-centered fx-col sc-s-18 bg-sp box-pad-h box-pad-v"
        style={{ width: "450px" }}
      >
        <div
          className="fx-centered box-marg-s"
          style={{
            minWidth: "54px",
            minHeight: "54px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--red-main)",
          }}
        >
          <div className="warning"></div>
        </div>
        <h3 className="p-centered">{t("APJU882")}</h3>
        <p className="p-centered gray-c box-pad-v-s">{t("AOlHR1d")}</p>
        <div
          className={"fx-scattered if pointer fit-container dashed-onH"}
          style={{ borderStyle: "dashed" }}
          onClick={() => copyText(wallet.data, t("A6Pj02S"))}
        >
          <p>{shortenKey(wallet.data, 20)}</p>
          <div className="copy-24"></div>
        </div>
        <div className="fx-centered fit-container">
          <button className="fx btn btn-gst-red" onClick={handleDelete}>
            {t("Almq94P")}
          </button>
          <button className="fx btn btn-red" onClick={exit}>
            {t("AB4BSCe")}
          </button>
        </div>
      </section>
    </section>
  );
};

export default DeletionPopUp;
