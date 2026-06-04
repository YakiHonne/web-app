import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Icon from "@/Components/Icon";

export default function SmallButtonDropDown({
  options,
  selectedCategory,
  setSelectedCategory,
  showSettings = false,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [dismissing, setDismissing] = useState(false);
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

  const close = () => {
    setDismissing(true);
    setTimeout(() => {
      setShowOptions(false);
      setDismissing(false);
    }, 200);
  };

  useEffect(() => {
    const handleOffClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        close();
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
            ? showOptions ? close() : setShowOptions(true)
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
          <Icon name="arrow" size={12} />
        )}
      </div>
      {showOptions && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            minWidth: "200px",
            width: "max-content",
            zIndex: 1000,
            rowGap: "0",
            borderRadius: "16px",
            transformOrigin: "top left",
          }}
          className={`fx-centered fx-col fx-start-v pointer drop-down-r bg-dropdown dynamic-island-dropdown${dismissing ? " dismissing" : ""}`}
        >
          {options.map((option, index) => {
            return (
              <p
                key={index}
                onClick={() => {
                  setSelectedCategory(option);
                  close();
                }}
                className={`box-pad-h-m box-pad-v-s fit-container p-maj ${
                  selectedCategory === option ? "c1-c" : ""
                }`}
                style={{
                  padding: ".6rem 1rem",
                  borderRadius: "10px",
                }}
              >
                {categoryDisplayName[option]}
              </p>
            );
          })}
          {showSettings && (
            <Link
              href="/settings"
              state={{ tab: "customization" }}
              className="fit-container fx-scattered pointer box-pad-h-m box-pad-v-s"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                padding: ".6rem 1rem",
                borderRadius: "0 0 16px 16px",
              }}
            >
              <p className="p-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{t("AV40SRR")}</p>
              <Icon name="setting" size={12} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
