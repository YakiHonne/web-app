import React from "react";
import { useTheme } from "next-themes";
import { getIcon } from "@/Content/IconsURLs";
import { getIconv2 } from "@/Content/IconV2URL";

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
  v = 1
}) {
  const { resolvedTheme } = useTheme();
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
