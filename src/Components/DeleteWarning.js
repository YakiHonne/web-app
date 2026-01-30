import React from "react";
import { useTranslation } from "react-i18next";

export default function DeleteWarning({
  title,
  description,
  exit,
  handleDelete,
}) {
  const { t } = useTranslation();
  return (
    <div className="fixed-container fx-centered box-pad-h">
      <section
        className="fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v"
        style={{ width: "450px" }}
        onClick={(e) => e.stopPropagation()}
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
        {title && (
          <h3 className="p-centered" style={{ wordBreak: "break-word" }}>
            {title}
          </h3>
        )}
        {description && (
          <p className="p-centered gray-c box-pad-v-m">{description}</p>
        )}
        <div className="fx-centered fit-container">
          <button className="fx btn btn-gst-red" onClick={handleDelete}>
            {t("Almq94P")}
          </button>
          <button className="fx btn btn-red" onClick={exit}>
            {t("AB4BSCe")}
          </button>
        </div>
      </section>
    </div>
  );
}
