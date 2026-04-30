import React, { useRef, useState, useEffect } from "react";

export default function HorizontalScrollWrapper({
  children,
  className = "",
  gap = "16px",
  padding = "16px",
  centerIfSmall = false,
}) {
  const scrollRef = useRef(null);
  const innerRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current && innerRef.current) {
        setIsOverflowing(innerRef.current.clientWidth > scrollRef.current.clientWidth);
      }
    };

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (scrollRef.current) resizeObserver.observe(scrollRef.current);
    if (innerRef.current) resizeObserver.observe(innerRef.current);

    checkOverflow();

    return () => resizeObserver.disconnect();
  }, [children]);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollRef}
      className={`no-scrollbar ${className}`}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      style={{
        overflowX: "auto",
        cursor: isDown ? "grabbing" : "grab",
        width: "100%",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        ref={innerRef}
        style={{
          display: "flex",
          gap: gap,
          padding: padding,
          minWidth: "100%",
          width: "max-content",
          justifyContent: centerIfSmall && !isOverflowing ? "center" : "flex-start",
        }}
      >
        {children}
      </div>
    </div>
  );
}
