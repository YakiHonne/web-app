import React, { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function OptionsDropdown({
  options,
  border = false,
  displayAbove = false,
  displayLeft = true,
  vertical = true,
  tooltip = true,
  icon = "dots",
  minWidth = "auto",
}) {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [displayAbove_, setDisplayAbove_] = useState(displayAbove);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowOptions(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef]);

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setShowOptions((prev) => {
      if (!prev) {
        if (optionsRef.current) {
          const rect = optionsRef.current.getBoundingClientRect();
          const distanceFromBottom = window.innerHeight - rect.bottom;
          setDisplayAbove_(distanceFromBottom < 37.5 * (options.length - 1));
        }
      }
      return !prev;
    });
  };
  return (
    <div style={{ position: "relative" }} ref={optionsRef}>
      <div
        className={`${border ? "round-icon" : "round-icon-small"} ${
          tooltip ? "round-icon-tooltip" : ""
        }`}
        style={{ border: border ? "" : "none" }}
        data-tooltip={icon === "arrow" ? "" : t("A5DDopE")}
        onClick={handleDropdownToggle}
      >
        {icon === "dots" && (
          <div
            className={`fx-centered ${vertical ? "fx-col" : ""}`}
            style={{ gap: 0 }}
          >
            <p className="gray-c fx-centered" style={{ height: "6px" }}>
              &#x2022;
            </p>
            <p className="gray-c fx-centered" style={{ height: "6px" }}>
              &#x2022;
            </p>
            <p className="gray-c fx-centered" style={{ height: "6px" }}>
              &#x2022;
            </p>
          </div>
        )}
        {icon === "arrow" && <div className="arrow"></div>}
      </div>
      {showOptions && (
        <div
          style={{
            position: "absolute",
            [displayAbove_ ? "bottom" : "top"]: "110%",
            [displayLeft ? "right" : "left"]: "0",
            backgroundColor: "var(--dim-gray)",
            // border: "none",
            minWidth: minWidth,
            width: "max-content",
            zIndex: 1000,
            // rowGap: "10px",
            rowGap: "0px",
            overflow: "visible",
          }}
          className="box-pad-h-s box-pad-v-s sc-s-18 bg-sp fx-centered fx-col fx-start-v pointer drop-down"
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(false);
          }}
        >
          {options.map((option, index) => {
            return <Fragment key={index}>{option}</Fragment>;
          })}
        </div>
      )}
    </div>
  );
}
