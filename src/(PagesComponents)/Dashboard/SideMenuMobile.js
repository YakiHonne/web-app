import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SideMenuMobile({ setSelectedTab, selectedTab }) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const tabs = [
    {
      display_name: t("AJDdA3h"),
      value: 0,
    },
    {
      display_name: t("AYIXG83"),
      value: 1,
    },
    {
      display_name: t("AesMg52"),
      value: 2,
    },
    {
      display_name: t("AVysZ1s"),
      value: 3,
    },
    {
      display_name: t("Az2KlKc"),
      value: 9,
    },
    {
      display_name: t("AStkKfQ"),
      value: 4,
    },
    {
      display_name: t("Aa73Zgk"),
      value: 5,
    },
    {
      display_name: t("A2mdxcf"),
      value: 6,
    },
    {
      display_name: t("AqwEL0G"),
      value: 7,
    },
    {
      display_name: t("AvcFYqP"),
      value: 8,
    },
  ];
  return (
    <div
      style={{
        borderBottom: "1px solid var(--pale-gray)",
        position: "relative",
      }}
      className="desk-hide fit-container"
    >
      <div className="box-pad-h-m box-pad-v-m fit-container fx-scattered">
        <h4>{t("ALBhi3j")}</h4>
        <div
          className="burger-menu"
          onClick={() => setShowMenu(!showMenu)}
        ></div>
      </div>
      {showMenu && (
        <div
          className="fixed-container fx-centered fx-end-h"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        >
          <div
            className="fx-centered fx-start-h fx-start-v fx-col sc-s-18 slide-right"
            style={{
              gap: "0",
              width: "70%",
              height: "100vh",
              borderRadius: "0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="box-pad-h box-pad-v fx-scattered fit-container">
              <h4>{t("ALBhi3j")}</h4>
              <div
                className="close"
                style={{ position: "static" }}
                onClick={() => setShowMenu(!showMenu)}
              >
                <div></div>
              </div>
            </div>
            {tabs.map((tab) => {
              return (
                <p
                  className="option fit-container box-pad-h box-pad-v-m pointer"
                  style={{
                    backgroundColor:
                      selectedTab === tab.value ? "var(--pale-gray)" : "",
                  }}
                  onClick={() => {
                    setSelectedTab(tab.value);
                    setShowMenu(false);
                  }}
                  key={tab.value}
                >
                  {tab.display_name}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
