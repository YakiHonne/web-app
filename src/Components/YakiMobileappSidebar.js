import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import MobileDemo from "./MobileDemo";
let ymaQR = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/yma-qr.png";

export default function YakiMobileappSidebar() {
  const [showDemo, setShowDemo] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      {showDemo && <MobileDemo exit={() => setShowDemo(false)} />}
      <div
        className="fit-container fx-centered fx-col fx-end-v"
        style={{
          position: "relative",
        }}
        onClick={() => setShowDemo(true)}
      >
        <div
          className={`pointer fit-container fx-scattered box-pad-h-s box-pad-v-s inactive-link`}
        >
          <div className="fx-centered">
            <Icon name="mobile" size={24} />
            <div className="link-label">{t("A70sntU")}</div>
          </div>
        </div>
      </div>
    </>
  );
}

