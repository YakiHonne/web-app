import Lottie from "lottie-react";
import React from "react";
import loading from "@/JSONs/loading.json";
import loadingB from "@/JSONs/loading-b.json";
import { useTheme } from "next-themes";

export default function LoadingLogo({ size = 64 }) {
  const { theme } = useTheme();
  let isDarkMode = ["dark", "gray", "system"].includes(theme)
    ? "dark"
    : "light";
  return (
    <div style={{ width: `${size}px` }}>
      <Lottie
        animationData={isDarkMode !== "light" ? loading : loadingB}
        loop={true}
      />
    </div>
  );
}
