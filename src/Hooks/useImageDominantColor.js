import { useEffect, useState } from "react";
import { getDominantColor } from "@/Helpers/Helpers";
import {
  getColorFromCache,
  setColorToCache,
} from "@/Helpers/utils/imageDominantColorCache";

export default function useImageDominantColor(img) {
  const [color, setColor] = useState(getColorFromCache(img) || "var(--c1)");
  useEffect(() => {
    if (img) {
      const cachedColor = getColorFromCache(img);
      if (cachedColor) {
        setColor(cachedColor);
        return;
      }
      getDominantColor(img).then((color) => {
        setColor(color);
        setColorToCache(img, color);
      });
    } else setColor("var(--c1)");
  }, [img]);
  return color;
}
