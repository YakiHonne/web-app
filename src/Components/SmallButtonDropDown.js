import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function SmallButtonDropDown({
  options,
  selectedCategory,
  setSelectedCategory,
  showSettings = false,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  const { t } = useTranslation();
  const categoryDisplayName = {
    highlights: t("AWj53bb"),
    widgets: t("AM4vyRX"),
    recent: t("AiAJcg1"),
    "recent_with_replies": t("AgF8nZU"),
    paid: t("AAg9D6c"),
    trending: t("AqqxTe4"),
    explore: t("A9aq49d"),
    following: t("A9TqNxQ"),
  };
  useEffect(() => {
    const handleOffClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowOptions(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef]);

  return (
    <div style={{ position: "relative" }} ref={optionsRef}>
      <div
        className={"btn sticker-gray-black fx-centered "}
        style={{
          backgroundColor: options.includes(selectedCategory)
            ? ""
            : "transparent",
          color: options.includes(selectedCategory) ? "" : "var(--gray)",
          minWidth: "max-content",
        }}
        onClick={() =>
          (options.includes(selectedCategory) &&
            options.length > 1 &&
            !showSettings) ||
          (options.includes(selectedCategory) && showSettings)
            ? setShowOptions(!showOptions)
            : setSelectedCategory(options[0])
        }
      >
        <span className="p-maj">
          {options.includes(selectedCategory)
            ? categoryDisplayName[selectedCategory]
            : categoryDisplayName[options[0]]}
        </span>
        {((options.includes(selectedCategory) &&
          options.length > 1 &&
          !showSettings) ||
          (options.includes(selectedCategory) && showSettings)) && (
          <div className="arrow-12"></div>
        )}
      </div>
      {showOptions && (
        <div
          style={{
            position: "absolute",
       
            top: "110%",
            backgroundColor: "var(--dim-gray)",
            border: "none",
            minWidth: "200px",
            width: "max-content",
            zIndex: 1000,
            rowGap: "0",
          }}
          className="sc-s-18 fx-centered fx-col fx-start-v pointer drop-down-r"
        >
          {options.map((option, index) => {
            return (
              <p
                key={index}
                onClick={() => {
                  setSelectedCategory(option);
                  setShowOptions(false);
                }}
                className={`box-pad-h-m box-pad-v-s fit-container p-maj p-maj ${
                  selectedCategory === option ? "c1-c" : " "
                }`}
              >
                {categoryDisplayName[option]}
                {/* {option.replaceAll("-", " ")} */}
              </p>
            );
          })}
          {showSettings && (
            <Link
              href="/settings"
              state={{ tab: "customization" }}
              className="fit-container fx-scattered  pointer box-pad-h-m box-pad-v-s"
              style={{ backgroundColor: "var(--c1-side)" }}
            >
              <p className="p-medium gray-c btn-text-gray">{t("AV40SRR")}</p>
              <div
                className="setting"
                style={{ minWidth: "12px", minHeight: "12px" }}
              ></div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
