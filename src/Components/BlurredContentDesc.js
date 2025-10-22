import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function BlurredContentDesc({ toBlur, label = true }) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  if (!toBlur) return null;
  const handleOpenSettings = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };
  return (
    <>
      {showModal && (
        <DescriptiveWarning
          exit={() => {
            setShowModal(false);
          }}
        />
      )}
      <div
        className="fit-container fit-height fx-centered fx-col pointer"
        style={{
          zIndex: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div
          className="eye-closed-24"
          style={{ filter: "brightness(0) invert()" }}
        ></div>
        {label && <p style={{ color: "white" }}>{t("ABMZqcX")}</p>}
      </div>
      <div
        className="fx-centered fx-end-h fx-start-v pointer"
        style={{
          zIndex: 1,
          position: "absolute",
          top: 0,
          right: 0,
        }}
        onClick={handleOpenSettings}
      >
        <div className="box-pad-h-m box-pad-v-m">
          <div
            className="setting"
            style={{ filter: "brightness(0) invert()" }}
          ></div>
        </div>
      </div>
    </>
  );
}

const DescriptiveWarning = ({ exit }) => {
  const { t } = useTranslation();
  return (
    <div
      className="fixed-container fx-centered box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        style={{ width: "min(100%,400px)", position: "relative" }}
        className="sc-s bg-sp box-pad-h box-pad-v slide-up fx-centered fx-col"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div>
          <div
            className="eye-closed"
            style={{ minWidth: "48px", minHeight: "48px" }}
          ></div>
        </div>
        <h4>{t("AfTjNox")}</h4>
        <p className="gray-c p-centered box-pad-h box-pad-v-s">
          {t("A6xxSyJ")}
        </p>
        <Link href="/settings?tab=customization" onClick={exit}>
          <button className="btn btn-normal">{t("A77m0JH")}</button>
        </Link>
      </div>
    </div>
  );
};
