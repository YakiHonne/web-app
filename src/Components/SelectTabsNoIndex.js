import React, { useMemo, useRef, useEffect } from "react";

export function SelectTabsNoIndex({
  selectedTab,
  tabs,
  setSelectedTab,
  small = false,
}) {
  const sliderRef = useRef(null);
  const buttonRefs = useMemo(() => {
    return tabs.map((tab) => ({
      ...tab,
      ref: React.createRef(),
    }));
  }, [tabs]);

  useEffect(() => {
    let index = buttonRefs.findIndex((_) => _.value === selectedTab);
    const selectedButton = buttonRefs[index]?.ref?.current;
    const slider = sliderRef.current;

    if (selectedButton && slider) {
      const { width, left } = selectedButton.getBoundingClientRect();
      const containerLeft =
        selectedButton.parentElement.getBoundingClientRect().left;
      const remSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );

      slider.style.width = `${width / remSize}rem`;
      slider.style.transform = `translateX(${
        (left - containerLeft) / remSize
      }rem)`;
    }
  }, [selectedTab]);

  return (
    <div
      className="fx-scattered sc-s-18 box-pad-v-s"
      style={{
        gap: 0,
        position: "relative",
        height: small ? "2rem" : "2.8rem",
        border: "none",
        padding: small ? ".2rem" : "0 .45rem",
        backgroundColor: "transparent",
      }}
    >
      {buttonRefs.map((button, index) => (
        <div
          className={`box-pad-h pointer ${
            selectedTab !== button.value ? "gray-c" : ""
          }`}
          style={{ position: "relative", zIndex: 1 }}
          key={index}
          ref={button.ref}
          onClick={() => setSelectedTab(button.value)}
        >
          {button.display_name}
        </div>
      ))}
      <div
        ref={sliderRef}
        className="button-slider fit-height"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          zIndex: 0,
          transition: ".2s ease-in-out",
          padding: small ? ".2rem 0" : ".45rem 0",
        }}
      >
        <div
          className="fit-container fit-height sc-s-18"
          style={{
            backgroundColor: "var(--dim-gray)",
            border: "none",
          }}
        ></div>
      </div>
    </div>
  );
}
