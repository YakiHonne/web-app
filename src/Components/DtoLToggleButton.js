import React, { useMemo } from "react";
import { useSpring, animated } from "react-spring";
import { useDispatch, useSelector } from "react-redux";
import { setIsDarkMode } from "@/Store/Slides/Extras";
import { toggleColorScheme } from "@/Helpers/Helpers";
import { useTranslation } from "react-i18next";

export default function DtoLToggleButton({ isMobile = false, small = false }) {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.isDarkMode);
  const { t } = useTranslation();
  const properties = {
    sun: {
      r: 9,
      transform: "rotate(40deg)",
      cx: 12,
      cy: 4,
      opacity: 0,
    },
    moon: {
      r: 5,
      transform: "rotate(90deg)",
      cx: 30,
      cy: 0,
      opacity: 1,
    },
    springConfig: { mass: 4, tension: 250, friction: 35 },
  };
  const { r, transform, cx, cy, opacity } = useMemo(() => {
    return isDarkMode === "1" ? properties["moon"] : properties["sun"];
  }, [isDarkMode]);

  const svgContainerProps = useSpring({
    transform,
    config: properties.springConfig,
  });
  const centerCircleProps = useSpring({ r, config: properties.springConfig });
  const maskedCircleProps = useSpring({
    cx,
    cy,
    config: properties.springConfig,
  });
  const linesProps = useSpring({ opacity, config: properties.springConfig });
  const setTheme = () => {
    if (isDarkMode === "0") {
      localStorage.setItem("yaki-theme", "1");
      toggleColorScheme(true);
      dispatch(setIsDarkMode("1"));
    }
    if (isDarkMode === "1") {
      localStorage.setItem("yaki-theme", "0");
      toggleColorScheme(false);
      dispatch(setIsDarkMode("0"));
    }
  };

  return (
    <div
      className="fx-centered fx-start-h fit-container pointer"
      onClick={setTheme}
    >
      <animated.svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 26 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          ...svgContainerProps,
          cursor: "pointer",
          scale: small ? ".7" : 1,
        }}
      >
        <mask id="mask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={isDarkMode === "1" ? "var(--white)" : "var(--black)"}
          />
          <animated.circle
            style={maskedCircleProps}
            cx="12"
            cy="4"
            r="9"
            fill="var(--white)"
          />
        </mask>
        <mask>
          <animated.circle
            style={centerCircleProps}
            fill="var(--black)"
            cx="12"
            cy="12"
            r="9"
            mask="url(#mask)"
          />
          <animated.circle
            style={maskedCircleProps}
            cx="12"
            cy="4"
            r="9"
            fill="var(--white)"
          />
        </mask>
        <animated.circle
          style={centerCircleProps}
          fill="var(--black)"
          cx="12"
          cy="12"
          r="9"
          mask="url(#mask)"
        />

        <animated.g style={linesProps} fill="currentColor">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </animated.g>
      </animated.svg>
      <p className={isMobile ? "p-big link-label" : "gray-c link-label"}>{t("APptFBi")}</p>
    </div>
  );
}
