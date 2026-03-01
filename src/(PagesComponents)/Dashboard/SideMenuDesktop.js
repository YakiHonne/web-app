import React from "react";
import { useTranslation } from "react-i18next";

export default function SideMenuDesktop({ setSelectedTab, selectedTab }) {
  const { t } = useTranslation();
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
      display_name: t("Az2KlKc"),
      value: 9,
    },
    {
      display_name: t("AVysZ1s"),
      value: 3,
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
        height: "100vh",
        width: "300px",
        overflow: "hidden",
        borderRight: "1px solid var(--pale-gray)",
        position: "sticky",
        top: 0,
      }}
      className="mb-hide-800"
    >
      <div className="box-pad-h box-pad-v">
        <h4>{t("ALBhi3j")}</h4>
      </div>
      <div className="fx-centered fx-start-v fx-col" style={{ gap: "0" }}>
        {tabs.map((tab) => {
          return (
            <p
              className="option fit-container box-pad-h box-pad-v-m pointer"
              style={{
                backgroundColor:
                  selectedTab === tab.value ? "var(--pale-gray)" : "",
              }}
              onClick={() => setSelectedTab(tab.value)}
              key={tab.value}
            >
              {tab.display_name}
            </p>
          );
        })}
      </div>
    </div>
  );
}
