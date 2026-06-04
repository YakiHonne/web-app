import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { changePrimary, getPrimaryColor } from "@/Helpers/Helpers";
import { primaryColors } from "@/Content/PrimaryColors";
import Icon from "@/Components/Icon";
import { localStorage_ } from "@/Helpers/utils/clientLocalStorage";

const FONT_SIZES = [
  { label: "Small", value: "14px" },
  { label: "Default", value: "16px" },
  { label: "Large", value: "18px" },
  { label: "XL", value: "20px" },
];
const DEFAULT_FONT_INDEX = 1;

function getStoredFontIndex() {
  try {
    const stored = localStorage_?.getItem("yaki-font-size");
    if (stored === null || stored === undefined) return DEFAULT_FONT_INDEX;
    const idx = parseInt(stored, 10);
    return isNaN(idx) ? DEFAULT_FONT_INDEX : idx;
  } catch { return DEFAULT_FONT_INDEX; }
}

export function ThemeManagement({ selectedTab, setSelectedTab }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState(getPrimaryColor());
  const [fontIndex, setFontIndex] = useState(getStoredFontIndex);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[fontIndex].value;
  }, [fontIndex]);

  const handleFontIndex = (idx) => {
    setFontIndex(idx);
    localStorage_?.setItem("yaki-font-size", String(idx));
    document.documentElement.style.fontSize = FONT_SIZES[idx].value;
  };

  const handleChangeColor = (color) => {
    changePrimary(color);
    setPrimaryColor(color);
  };
  return (
    <div
      className={`sc-s fit-container fx-scattered fx-col pointer ${selectedTab === "theme" ? "sc-s box-pad-h-s box-pad-v-s" : ""
        }`}
      style={{
        // borderBottom: "1px solid var(--very-dim-gray)",
        gap: 0,
        // borderColor: "var(--very-dim-gray)",
        transition: "0.2s ease-in-out",
        // borderRadius: 0,
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
            <Icon name="theme" size={24} />
          </div>
          <div>
            <p>{t("A1iiDWU")}</p>
            <p className="p-medium gray-c">{t("Aayzo1w")}</p>
          </div>
        </div>
        <Icon name="arrow" />
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
                <Icon name="yaki-logomark" size={40} />
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
                <Icon name="yaki-logomark" size={40} />
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
                <Icon name="yaki-logomark" size={40} />
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
                <Icon name="yaki-logomark" size={40} />
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

          {/* ── Font size ── */}
          <div className="fit-container box-pad-h-m box-pad-v-s">
            <p>Font size</p>
            <p className="gray-c p-medium">Make the text on screen smaller or larger.</p>
          </div>
          <div className="fit-container box-pad-h-m" style={{ paddingBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, opacity: 0.5, flexShrink: 0 }}>A</span>
              <div style={{ flex: 1, position: "relative" }}>
                {/* visual slider — pointer-events off, driven by click zones below */}
                <input
                  type="range"
                  min={0}
                  max={FONT_SIZES.length - 1}
                  step={1}
                  value={fontIndex}
                  readOnly
                  style={{
                    width: "100%",
                    pointerEvents: "none",
                    "--progress": `${(fontIndex / (FONT_SIZES.length - 1)) * 100}%`,
                  }}
                />
                {/* clickable segments — each covers 1/N of the track width */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  cursor: "pointer",
                }}>
                  {FONT_SIZES.map((_, i) => (
                    <div
                      key={i}
                      style={{ flex: 1 }}
                      onClick={() => handleFontIndex(i)}
                    />
                  ))}
                </div>
                {/* labels */}
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  pointerEvents: "none",
                  padding: "0 7px",
                }}>
                  {FONT_SIZES.map((s, i) => (
                    <span key={i} style={{
                      fontSize: "10px",
                      color: i === fontIndex ? "var(--c1)" : "var(--gray)",
                      fontWeight: i === fontIndex ? 700 : 400,
                      transition: "color 0.15s",
                    }}>{s.label}</span>
                  ))}
                </div>
              </div>
              <span style={{ fontSize: "20px", fontWeight: 700, opacity: 0.5, flexShrink: 0 }}>A</span>
            </div>
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
