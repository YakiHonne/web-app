import React from "react";
import { useTranslation } from "react-i18next";

export default function LinkWallet({ exit, handleLinkWallet }) {
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
        <h3 className="p-centered">{t("AmQVpu4")}</h3>
        <p className="p-centered gray-c box-pad-v-m">{t("AIgKsNh")}</p>
        <div className="fx-centered fit-container">
          <button className="fx btn btn-gst-red" onClick={handleLinkWallet}>
            {t("AmQVpu4")}
          </button>
          <button className="fx btn btn-red" onClick={exit}>
            {t("AB4BSCe")}
          </button>
        </div>
      </section>
    </section>
  );
}
