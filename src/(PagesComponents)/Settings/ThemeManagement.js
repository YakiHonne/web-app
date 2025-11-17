import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { changePrimary, getPrimaryColor } from "@/Helpers/Helpers";
import { primaryColors } from "@/Content/PrimaryColors";

export function ThemeManagement({ selectedTab, setSelectedTab }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState(getPrimaryColor());

  const handleChangeColor = (color) => {
    changePrimary(color);
    setPrimaryColor(color);
  };
  return (
    <div
      className={`fit-container fx-scattered fx-col pointer ${
        selectedTab === "theme" ? "sc-s box-pad-h-s box-pad-v-s" : ""
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
      {selectedTab === "theme" && (
        <div className="fit-container fx-scattered fx-wrap">
          <div>
            <p className="box-pad-h-m ">{t("AIKesjZ")}</p>
            <p className="box-pad-h-m gray-c p-medium">{t("AqrUYQh")}</p>
          </div>

          <div className="fit-container fx-scattered box-pad-h-m fx-wrap">
            {/* <div className="fx-centered fit-container"> */}
            <div
              className="fx-centered fx fx-col sc-s-18"
              style={{
                borderColor: theme === "dark" ? "var(--c1)" : "",
                backgroundColor: "#000000",
              }}
              onClick={() => setTheme("dark")}
            >
              <div className="box-pad-h box-pad-v-m fx-centered fx-col">
                <div
                  className="yaki-logomark"
                  style={{
                    filter: "brightness(0) invert()",
                    minWidth: "40px",
                    minHeight: "40px",
                  }}
                ></div>
                <p className="p-medium" style={{ color: "white" }}>
                  Noir
                </p>
              </div>
            </div>
            <div
              className="fx-centered fx fx-col sc-s-18"
              style={{
                borderColor: theme === "gray" ? "var(--c1)" : "",
                backgroundColor: "#171718",
              }}
              onClick={() => setTheme("gray")}
            >
              <div className="box-pad-h box-pad-v-m fx-centered fx-col">
                <div
                  className="yaki-logomark"
                  style={{
                    filter: "brightness(0) invert()",
                    minWidth: "40px",
                    minHeight: "40px",
                  }}
                ></div>
                <p className="p-medium" style={{ color: "white" }}>
                  Graphite
                </p>
              </div>
            </div>
            {/* </div> */}
            {/* <div className="fx-centered fit-container"> */}
            <div
              className="fx-centered fx fx-col sc-s-18"
              style={{
                borderColor: theme === "light" ? "var(--c1)" : "",
                backgroundColor: "#ffffff",
              }}
              onClick={() => setTheme("light")}
            >
              <div className="box-pad-h box-pad-v-m fx-centered fx-col">
                <div
                  className="yaki-logomark"
                  style={{
                    filter: "brightness(0) ",
                    minWidth: "40px",
                    minHeight: "40px",
                  }}
                ></div>
                <p className="p-medium" style={{ color: "black" }}>
                  Neige
                </p>
              </div>
            </div>
            <div
              className="fx-centered fx fx-col sc-s-18"
              style={{
                borderColor: theme === "creamy" ? "var(--c1)" : "",
                backgroundColor: "#FAF7F3",
              }}
              onClick={() => setTheme("creamy")}
            >
              <div className="box-pad-h box-pad-v-m fx-centered fx-col">
                <div
                  className="yaki-logomark"
                  style={{
                    filter: "brightness(0) ",
                    minWidth: "40px",
                    minHeight: "40px",
                  }}
                ></div>
                <p
                  className="p-medium"
                  style={{ color: "black", width: "max-content" }}
                >
                  Ivory
                </p>
              </div>
            </div>
            {/* </div> */}
          </div>
          <div>
            <p className="box-pad-h-m ">{t("AcWEyKJ")}</p>
            <p className="box-pad-h-m gray-c p-medium">{t("AfSekKh")}</p>
          </div>
          <div className="fit-container fx-scattered box-pad-h-m fx-wrap">
            {primaryColors.map((color) => {
              return (
                <div
                  className="bg-sp fx-centered box-pad-h box-pad-v sc-s-d-18 fx pointer"
                  style={{
                    borderStyle: "solid",
                    borderColor: primaryColor === color ? "var(--c1)" : "",
                  }}
                  onClick={() => handleChangeColor(color)}
                >
                  <div
                    style={{
                      borderRadius: "var(--border-r-50)",
                      width: "18px",
                      height: "18px",
                      backgroundColor: color,
                    }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* {selectedTab === "theme" && (
        <div className="fit-container fx-col fx-centered box-pad-h-m box-pad-v-m ">
          <div className="fx-scattered fit-container">
            <DtoLToggleButton />
          </div>
        </div>
      )} */}
    </div>
  );
}

export default ThemeManagement;
