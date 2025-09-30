import React from "react";
import { useTranslation } from "react-i18next";
import { userLogout } from "../../Helpers/Controlers";
import { useSelector } from "react-redux";

export default function UserLogout() {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  return (
    <div
      className="fit-container fx-scattered box-pad-h-m box-pad-v-m pointer"
      onClick={() => userLogout(userKeys.pub)}
    >
      <div className="fx-centered fx-start-h">
        <div className="logout-24"></div>
        <p>{t("AyXwdfE")}</p>
      </div>
    </div>
  );
}
