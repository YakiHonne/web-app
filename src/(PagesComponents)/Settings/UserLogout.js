import React from "react";
import { useTranslation } from "react-i18next";
import { userLogout } from "../../Helpers/Controlers";
import { useSelector } from "react-redux";
import Icon from "@/Components/Icon";

export default function UserLogout() {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  return (
    <div
      className="fit-container fx-scattered pointer"
      onClick={() => userLogout(userKeys.pub)}
    >
      <div className="fit-container fx-centered  btn btn-red">
        <Icon name="logout" size={24} />
        <p>{t("AyXwdfE")}</p>
      </div>
    </div>
  );
}
