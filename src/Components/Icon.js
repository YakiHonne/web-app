import React from "react";
import { useTheme } from "next-themes";
import { getIcon } from "@/Content/IconsURLs";

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
}) {
  const { resolvedTheme } = useTheme();
  let icon = getIcon(name);
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
        minWidth: width || size,
        minHeight: height || size,
        cursor: onClick ? "pointer" : "initial",
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
