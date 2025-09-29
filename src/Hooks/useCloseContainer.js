import { nanoid } from "nanoid";
import React, { useEffect, useRef, useState } from "react";

export default function useCloseContainer() {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOffClick = (e) => {
      e.stopPropagation();
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("click", handleOffClick);
    return () => {
      document.removeEventListener("click", handleOffClick);
    };
  }, [containerRef]);

  return { containerRef, open, setOpen };
}
