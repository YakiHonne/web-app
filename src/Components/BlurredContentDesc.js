import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";

export default function BlurredContentDesc({ toBlur, label = true }) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  if (!toBlur) return null;
  const handleOpenSettings = (e) => {
    e.stopPropagation();
    e.preventDefault();
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
        <Icon name="eye-closed" size={24} />
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
          <Icon name="setting" />
        </div>
      </div>
    </>
  );
}

const DescriptiveWarning = ({ exit }) => {
  const { t } = useTranslation();
  return (
    <Overlay exit={exit} width={400}>
      <div
        className="box-pad-h box-pad-v slide-up fx-centered fx-col"
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div>
          <Icon name="eye-closed" size={48} />
        </div>
        <h4>{t("AfTjNox")}</h4>
        <p className="gray-c p-centered box-pad-h box-pad-v-s">
          {t("A6xxSyJ")}
        </p>
        <Link href="/settings?tab=customization" onClick={exit}>
          <button className="btn btn-normal">{t("A77m0JH")}</button>
        </Link>
      </div>
    </Overlay>
  );
};
