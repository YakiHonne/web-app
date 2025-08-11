import React, { useState } from "react";
import SmartWidgetsSystem from "@/Components/YakiNewFeatureIntroComponents/SmartWidgetsSystem";

export default function YakiNewFeatureIntro() {
  const [isDisplayed, setIsDisplayed] = useState(
    localStorage.getItem("feature_showcase")
  );
  const [slideNumber, setSlideNumber] = useState(0);
  const nextSlide = () => {
    if (slideNumber + 1 < SmartWidgetsSystem.length)
      setSlideNumber(slideNumber + 1);
  };
  const prevSlide = () => {
    if (slideNumber - 1 >= 0) setSlideNumber(slideNumber - 1);
  };

  const skipShowcase = () => {
    localStorage.setItem("feature_showcase", "sw");
    setIsDisplayed("sw");
  };

  if (isDisplayed === "sw") return null;
  return (
    <div className="fixed-container fx-centered fx-col box-pad-h">
      <div
        className="sc-s fx-centered carousel"
        style={{ width: "min(100%, 1000px)", columnGap: 0, maxHeight: "560px" }}
      >
        <div
          className="browsing-arrow slide-left carousel-arrows"
          onClick={prevSlide}
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            zIndex: 100,
          }}
        >
          <div className="arrow" style={{ rotate: "90deg" }}></div>{" "}
        </div>
        <div
          className="browsing-arrow slide-right carousel-arrows"
          onClick={nextSlide}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            zIndex: 100,
          }}
        >
          <div className="arrow" style={{ rotate: "-90deg" }}></div>{" "}
        </div>
        {/* </div> */}
        <div
          className="fx-centered fit-container fit-height fx-start-h "
          style={{ columnGap: 0 }}
        >
          {SmartWidgetsSystem.map((item, index) => {
            return (
              <div
                className="fit-container fit-height fx-shrink"
                style={{
                  transform: `translateX(-${100 * slideNumber}%)`,
                  transition: "1s cubic-bezier(.86,-0.06,.13,1.05)",
                  //   transition: "1s cubic-bezier(.48,-0.44,.56,1.53)",
                }}
                key={index}
              >
                {item}
              </div>
            );
          })}
          <div
            className="fit-container"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 100,
              width: "100%",
            }}
          >
            <div
              style={{
                width: `${Math.ceil(
                  ((slideNumber + 1) * 100) / SmartWidgetsSystem.length
                )}%`,
                height: "4px",
                backgroundColor: "var(--c1)",
                transition: "1s ease-in-out",
              }}
            ></div>
          </div>
        </div>
      </div>
      <div>
        <button className="btn btn-text-gray" onClick={skipShowcase}>
          Skip
        </button>
      </div>
    </div>
  );
}
