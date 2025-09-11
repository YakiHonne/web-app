import React from "react";
import { useTranslation } from "react-i18next";
import DtoLToggleButton from "../../Components/DtoLToggleButton";
import { useTheme } from "next-themes";

export function ThemeManagement({ selectedTab, setSelectedTab }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  return (
    <div
      className="fit-container fx-scattered fx-col pointer"
      style={{
        borderBottom: "1px solid var(--very-dim-gray)",
        gap: 0,
      }}
    >
      <div
        className="fx-scattered fit-container  box-pad-h-m box-pad-v-m "
        onClick={() =>
          selectedTab === "theme" ? setSelectedTab("") : setSelectedTab("theme")
        }
      >
        <div className="fx-centered fx-start-h fx-start-v">
          <div className="box-pad-v-s">
            <div className="theme-24"></div>
          </div>
          <div>
            <p>{t("A1iiDWU")}</p>
            <p className="p-medium gray-c">{t("Aayzo1w")}</p>
          </div>
        </div>
        <div className="arrow"></div>
      </div>
      <button onClick={() => setTheme("gray")}>gray</button>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("creamy")}>creamy</button>
      {selectedTab === "theme" && (
        <div className="fit-container fx-col fx-centered box-pad-h-m box-pad-v-m ">
          <div className="fx-scattered fit-container">
            <DtoLToggleButton />
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeManagement;
