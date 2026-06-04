import React from "react";
import Overlay from "@/Components/Overlay";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";

export default function LinkWallet({ exit, handleLinkWallet }) {
  const { t } = useTranslation();

  return (
    <Overlay exit={exit} width={450}>
      <section
        className="fx-centered fx-col box-pad-h box-pad-v"
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
          <Icon name="warning" />
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
    </Overlay>
  );
}
