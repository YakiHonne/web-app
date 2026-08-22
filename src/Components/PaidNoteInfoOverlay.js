import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Overlay from "./Overlay";

export default function PaidNoteInfoOverlay({ onClose }) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleUpgrade = () => {
    onClose();
    router.push("/subscription");
  };

  return (
    <Overlay exit={onClose} width={500}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="fx-centered fx-col box-pad-h box-pad-v">
          <h4 style={{ margin: 0 }}>{t("AfRZ5lx")}</h4>
          <p className="gray-c p-centered" style={{ margin: 0, lineHeight: 1.65 }}>
            {t("Apts019")}
          </p>
        </div>
        <div className="fx-centered fx-col box-pad-h box-pad-v-m" style={{ borderTop: "1px solid var(--dim-gray)" }}>
          <p className="gray-c" style={{ margin: 0 }}>{t("Apts020")}</p>
          <button
            className="btn btn-normal btn-full"
            onClick={handleUpgrade}
          >
            {t("AGo17y4")}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
