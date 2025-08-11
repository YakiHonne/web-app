import React, { useMemo, useRef, useEffect } from "react";

export function SelectTabs({ selectedTab, tabs, setSelectedTab }) {
  const sliderRef = useRef(null);
  const buttonRefs = useMemo(() => {
    return tabs.map((tab) => ({
      display_name: tab,
      ref: React.createRef(),
    }));
  }, [tabs]);

  
  useEffect(() => {
    const selectedButton = buttonRefs[selectedTab]?.ref?.current;
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
        height: "3.2rem",
        border: "none",
        padding: "0 .45rem",
      }}
    >
      {buttonRefs.map((button, index) => (
        <div
          className={`box-pad-h pointer ${
            selectedTab !== index ? "gray-c" : "white-c"
          }`}
          style={{ position: "relative", zIndex: 1 }}
          key={index}
          ref={button.ref}
          onClick={() => setSelectedTab(index)}
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
          padding: ".45rem 0",
        }}
      >
        <div
          className="fit-container fit-height sc-s-18"
          style={{
            backgroundColor: "var(--orange-main)",
            border: "none",
            boxShadow: "0px 2px 5px rgba(0,0,0,.3)",
          }}
        ></div>
      </div>
    </div>
  );
}
