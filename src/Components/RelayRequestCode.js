import { shortenKey } from "@/Helpers/Encryptions";
import { copyText } from "@/Helpers/Helpers";
import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";

export default function RelayRequestCode({ code, exit }) {
  const { t } = useTranslation();
  const handleCopy = () => {
    copyText(code, t("AtjfqfF"));
    exit();
  };
  return (
    <Overlay exit={exit} width={500}>
      <div
        className="box-pad-h box-pad-v fx-centered fx-col slide-up"
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
          <Icon name="copy" />
        </div>
      </div>
    </Overlay>
  );
}
