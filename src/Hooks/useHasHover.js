import { useEffect, useState } from "react";

export default function useHasHover() {
  const [hasHover, setHasHover] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handler = (e) => setHasHover(e.matches);
    mq.addEventListener("change", handler);
    setHasHover(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return hasHover;
}
