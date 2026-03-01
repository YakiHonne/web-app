import React, { useEffect, useRef, useState } from "react";

export default function useCloseContainer() {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOffClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, []);

  return { containerRef, open, setOpen };
}
