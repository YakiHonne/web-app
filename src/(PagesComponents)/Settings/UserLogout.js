import React from "react";
import { useTranslation } from "react-i18next";
import { userLogout } from "../../Helpers/Controlers";

export default function UserLogout() {
  const { t } = useTranslation();
  return (
    <div
      className="fit-container fx-scattered box-pad-h-m box-pad-v-m pointer"
      onClick={userLogout}
    >
      <div className="fx-centered fx-start-h">
        <div className="logout-24"></div>
        <p>{t("AyXwdfE")}</p>
      </div>
    </div>
  );
}
