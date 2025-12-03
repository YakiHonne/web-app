import Toggle from "@/Components/Toggle";
import {
  getCustomSettings,
  getDefaultSettings,
  updateCustomSettings,
} from "@/Helpers/ClientHelpers";
import React, { useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

export function Notifications({ selectedTab, setSelectedTab }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const [notification, setNotification] = useState(
    getCustomSettings().notification || getDefaultSettings("").notification
  );
  const [hideMentions, setHideMentions] = useState(
    getCustomSettings().hideMentions
  );
  const currentSettings = getCustomSettings() || getDefaultSettings("");
  const notificationDN = {
    mentions: `${t("A8Da0of")} / ${t("AENEcn9")}`,
    reactions: t("Alz0E9Y"),
    reposts: t("Aai65RJ"),
    zaps: "Zaps",
    following: t("A9TqNxQ"),
  };
  const notificationDesc = {
    mentions: t("AyF6bJf"),
    reactions: t("AjlJkCH"),
    reposts: t("A9sfGZo"),
    zaps: t("Ae82ooM"),
    following: t("A5HyxxL"),
  };

  const handleNotification = (index, status) => {
    let tempArr = structuredClone(notification);
    tempArr[index].isHidden = status;
    if (!tempArr.find((item) => !item.isHidden)) {
      dispatch(
        setToast({
          type: 2,
          desc: t("AHfFgQL"),
        })
      );
      return;
    }
    setNotification(tempArr);
    updateCustomSettings({
      pubkey: userKeys.pub,
      ...currentSettings,
      notification: tempArr,
      hideMentions,
    });
  };

  const handleHideMentions = (status) => {
    setHideMentions(status);
    updateCustomSettings({
      pubkey: userKeys.pub,
      ...currentSettings,
      notification,
      hideMentions: status,
    });
  };

  return (
    <div
      className={`fit-container fx-scattered fx-col pointer ${
        selectedTab === "notifications" ? "sc-s box-pad-h-s box-pad-v-s" : ""
      }`}
      style={{
        borderBottom: "1px solid var(--very-dim-gray)",
        gap: 0,
        borderColor: "var(--very-dim-gray)",
        transition: "0.2s ease-in-out",
        borderRadius: 0,
      }}
    >
      <div
        className="fx-scattered fit-container  box-pad-h-m box-pad-v-m "
        onClick={() =>
          selectedTab === "notifications"
            ? setSelectedTab("")
            : setSelectedTab("notifications")
        }
      >
        <div className="fx-centered fx-start-h fx-start-v">
          <div className="box-pad-v-s">
            <div className="ringbell-24"></div>
          </div>
          <div>
            <p>{t("ASSFfFZ")}</p>
            <p className="p-medium gray-c">{t("Aaa8NMg")}</p>
          </div>
        </div>
        <div className="arrow"></div>
      </div>
      {selectedTab === "notifications" && (
        <div className="fx-scattered fit-container fx-col fx-start-v box-pad-h box-pad-v-m">
          <div className="fit-container fx-centered fx-col">
            <div className="fit-container fx-centered fx-col">
              <div className="fx-scattered fit-container">
                <div>
                  <p className="p-maj">{t("AX4fJlE")}</p>
                  <p className="p-medium gray-c">{t("A2S1tYG")}</p>
                </div>
                <div className="fx-centered">
                  <Toggle
                    status={hideMentions}
                    setStatus={handleHideMentions}
                  />
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="fit-container fx-centered fx-col">
            {notification.map((item, index) => {
              return (
                <Fragment key={index}>
                  <div className="fx-scattered fit-container">
                    <div>
                      <p className="p-maj">{notificationDN[item.tab]}</p>
                      <p className="p-medium gray-c">
                        {notificationDesc[item.tab]}
                      </p>
                    </div>
                    <div className="fx-centered">
                      <div
                        className={`toggle ${
                          item.isHidden ? "toggle-dim-gray" : ""
                        } ${!item.isHidden ? "toggle-c1" : "toggle-dim-gray"}`}
                        onClick={() =>
                          handleNotification(index, !item.isHidden)
                        }
                      ></div>
                    </div>
                  </div>
                  <hr />
                </Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
