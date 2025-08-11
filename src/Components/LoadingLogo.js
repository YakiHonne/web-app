import Lottie from "lottie-react";
import React from "react";
import { useSelector } from "react-redux";
import loading from "@/JSONs/loading.json";
import loadingB from "@/JSONs/loading-b.json";

export default function LoadingLogo({ size = 64 }) {
  const isDarkMode = useSelector((state) => state.isDarkMode);
  return (
    <div style={{ width: `${size}px` }}>
      <Lottie
        animationData={isDarkMode !== "1" ? loading : loadingB}
        loop={true}
      />
    </div>
  );
}
