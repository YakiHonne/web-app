import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

export function SelectTabs({ selectedTab, tabs, setSelectedTab, small = false }) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light" || resolvedTheme === "white";
  const isCreamy = resolvedTheme === "creamy";
  const isGray = resolvedTheme === "gray";
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const buttonRefs = useMemo(() => {
    return tabs.map((tab) => ({
      display_name: tab,
      ref: React.createRef(),
    }));
  }, [tabs]);

  const updateSlider = useCallback((scrollIntoView = true) => {
    const selectedButton = buttonRefs[selectedTab]?.ref?.current;
    const slider = sliderRef.current;
    const container = containerRef.current;

    if (selectedButton && slider && container) {
      const { width, left } = selectedButton.getBoundingClientRect();
      const containerLeft = container.getBoundingClientRect().left;
      const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

      slider.style.width = `${width / remSize}rem`;
      slider.style.transform = `translateX(${(left - containerLeft + container.scrollLeft) / remSize}rem)`;

      if (scrollIntoView) {
        selectedButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [selectedTab, buttonRefs]);

  useEffect(() => {
    updateSlider(false);
  }, [updateSlider]);

  useEffect(() => {
    const selectedButton = buttonRefs[selectedTab]?.ref?.current;
    selectedButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e) => {
      isDown = true;
      container.style.cursor = "grabbing";
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      container.style.cursor = "grab";
    };
    const onMouseUp = () => {
      isDown = false;
      container.style.cursor = "grab";
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = x - startX;
      container.scrollLeft = scrollLeft - walk;
      updateSlider();
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mousemove", onMouseMove);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mousemove", onMouseMove);
    };
  }, [updateSlider]);

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <div
        ref={containerRef}
        style={{
          gap: 0,
          position: "relative",
          minHeight: small ? "2rem" : "2.8rem",
          padding: small ? ".2rem" : "0 .45rem",
          overflowX: "auto",
          overflowY: "hidden",
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          cursor: "grab",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          borderRadius: "40px",
          backgroundColor: isLight
            ? "rgba(200, 200, 200, 0.28)"
            : isCreamy
              ? "rgba(210, 185, 150, 0.25)"
              : isGray
                ? "rgba(255, 255, 255, 0.07)"
                : "rgba(20, 20, 20, 0.6)",
          boxShadow: isLight
            ? "0 0 0 1px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.80)"
            : isCreamy
              ? "0 0 0 1px rgba(160,110,50,0.18), 0 4px 6px rgba(100,70,30,0.06), 0 12px 24px rgba(100,70,30,0.08), inset 0 1px 0 rgba(255,255,255,0.70)"
              : isGray
                ? "0 0 0 1px rgba(255,255,255,0.12), 0 4px 6px rgba(0,0,0,0.25), 0 12px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06)"
                : "0 0 0 1px rgba(255,255,255,0.12), 0 4px 6px rgba(0,0,0,0.25), 0 12px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {buttonRefs.map((button, index) => (
          <div
            className={`box-pad-h pointer`}
            style={{
              position: "relative",
              zIndex: 1,
              flexShrink: 0,
              whiteSpace: "nowrap",
              userSelect: "none",
              color: isLight
                ? (selectedTab !== index ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.88)")
                : isCreamy
                  ? (selectedTab !== index ? "rgba(30,20,10,0.45)" : "rgba(30,20,10,0.88)")
                  : (selectedTab !== index ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.88)"),
              transition: "color 0.2s ease",
            }}
            key={index}
            ref={button.ref}
            onClick={() => setSelectedTab(index)}
          >
            {button.display_name}
          </div>
        ))}
        {selectedTab !== -1 && (
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
              className="fit-container fit-height sc-s"
              style={{
                backgroundColor: isLight
                  ? "rgba(0,0,0,0.09)"
                  : isCreamy
                    ? "rgba(160,110,50,0.18)"
                    : "rgba(255,255,255,0.10)",
                border: "none"
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
