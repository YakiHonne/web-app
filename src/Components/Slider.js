import React, { useEffect, useState, useRef } from "react";

export default function Slider({
  items = [],
  slideBy = 10,
  noGap = false,
  gap = 6,
  smallButtonDropDown = false,
}) {
  const [scrollPX, setScrollPX] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const noScrollBarContainer = useRef(null);
  const noScrollBarContainerMain = useRef(null);

  useEffect(() => {
    let carousel_container = noScrollBarContainerMain.current;
    let carousel = noScrollBarContainer.current;
    if (carousel_container.clientWidth < carousel.scrollWidth && items.length > 3) {
      setShowArrows(true);
    } else {
      setShowArrows(false);
    }

    if (
      !(
        scrollPX + slideBy <
        carousel.scrollWidth - carousel_container.clientWidth
      )
    )
      slideLeft();
  }, [items]);

  const slideRight = () => {
    let carousel_container = noScrollBarContainerMain.current;
    let carousel = noScrollBarContainer.current;

    let pxToSlide =
      scrollPX + slideBy < carousel.scrollWidth - carousel_container.clientWidth
        ? scrollPX + slideBy
        : carousel.scrollWidth - carousel_container.clientWidth;
    setScrollPX(pxToSlide);
  };
  const slideLeft = () => {
    let pxToSlide = scrollPX - slideBy > 0 ? scrollPX - slideBy : 0;
    setScrollPX(pxToSlide);
  };

  return (
    <div
      className="fit-container fx-scattered fx-start-h"
      style={{
        position: "relative",
      }}
    >
      {showArrows && (
        <div
          className="pointer slide-right fit-height fx-centered gradient-bg-left"
          onClick={slideLeft}
          style={{
            position: "absolute",
            paddingRight: ".75rem",
            left: "-1px",
            top: 0,
            zIndex: 1,
          }}
        >
          <div
            className="round-icon-small"
            style={{
              backgroundColor: "var(--c1-side)",
              marginRight: "1px",
              border: "none",
            }}
          >
            <div className="arrow" style={{ transform: "rotate(90deg)" }}></div>
          </div>
        </div>
      )}
      {smallButtonDropDown && (
        <div style={{ paddingLeft: showArrows ? "2rem" : 0 }}>
          {smallButtonDropDown}
        </div>
      )}
      <div
        className="fx-centered fx-start-h no-scrollbar"
        style={{ overflow: "hidden" }}
        ref={noScrollBarContainerMain}
      >
        <div
          className="fx-centered fx-start-h no-scrollbar fx-stretch"
          style={{
            transform: `translateX(-${scrollPX}px)`,
            transition: ".3s ease-in-out",
            columnGap: noGap ? 0 : `${gap}px`,
            paddingLeft: showArrows ? "1.5rem" : 0,
            paddingRight: showArrows ? "1.5rem" : 0,
          }}
          ref={noScrollBarContainer}
        >
          {items.map((item, index) => {
            return (
              <div className="slider-item" key={index} style={{ width: "max-content" }}>
                {item}
              </div>
            );
          })}
        </div>
      </div>

      {showArrows && (
        <div
          className="pointer fit-height fx-centered gradient-bg-right"
          onClick={slideRight}
          style={{
            position: "absolute",
            paddingLeft: ".75rem",
            right: "-1px",
            top: 0,
            zIndex: 1,
          }}
        >
          <div
            className="round-icon-small"
            style={{
              backgroundColor: "var(--c1-side)",
              marginRight: "1px",
              border: "none",
            }}
          >
            <div
              className="arrow"
              style={{ transform: "rotate(-90deg)" }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
