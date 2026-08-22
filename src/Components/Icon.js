import React from "react";
import { useTheme } from "next-themes";
import { getIcon } from "@/Content/IconsURLs";
import { getIconv2 } from "@/Content/IconV2URL";
import { getLucideIcon } from "@/Content/LucideIcons";

export default function Icon({
  name,
  size = 16,
  width,
  height,
  isColored = false,
  onClick,
  transform = "unset",
  className = "",
  isBoldThemeColor = false,
  opacity = "initial",
  v = 1,
  strokeWidth
}) {
  const { resolvedTheme } = useTheme();
  const lucide = getLucideIcon(name, v);
  if (lucide) {
    const { Component, fill, bold, knockout, color } = lucide;
    const iconColor = isBoldThemeColor
      ? "var(--c1)"
      : isColored
        ? color || "currentColor"
        : ["dark", "gray"].includes(resolvedTheme)
          ? "#FFFFFF"
          : "#000000";
    // the original v2 assets are drawn with a stroke width of 2, v1 with 1.5;
    // bold variants keep a heavier stroke relative to any override
    const iconStrokeWidth = strokeWidth
      ? bold
        ? strokeWidth + 0.5
        : strokeWidth
      : bold
        ? 2.5
        : v === 2
          ? 2
          : 1.5;
    return (
      <div
        onClick={onClick && onClick}
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: ".2s ease-in-out",
          opacity: opacity || "initial",
          minWidth: width || size,
          minHeight: height || size,
          transform,
        }}
      >
        <Component
          width={width || size}
          height={height || size}
          color={knockout ? "var(--white)" : iconColor}
          strokeWidth={iconStrokeWidth}
          fill={fill ? iconColor : "none"}
        />
      </div>
    );
  }
  // No lucide equivalent (brand logos, flags, colored assets...):
  // keep the original image-based rendering.
  let icon = v === 2 ? getIconv2(name) : getIcon(name);
  if (!icon) return null;
  return (
    <div
      onClick={onClick && onClick}
      className={`${className} ${isBoldThemeColor ? "bold-icon" : ""}`}
      style={{
        backgroundSize: "contain",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        transition: ".2s ease-in-out",
        opacity: opacity || "initial",
        minWidth: width || size,
        minHeight: height || size,
        // cursor: onClick ? "pointer" : "initial",
        filter: !isColored
          ? ["dark", "gray"].includes(resolvedTheme)
            ? "brightness(0) invert()"
            : "brightness(0)"
          : "",
        transform,
        ...(isBoldThemeColor
          ? {
            maskImage: `url(${icon})`,
            WebkitMaskImage: `url(${icon})`,
          }
          : { backgroundImage: `url(${icon})` }),
      }}
    ></div>
  );
}
