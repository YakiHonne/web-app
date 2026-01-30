import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Select({
  options,
  value,
  disabled,
  setSelectedValue,
  defaultLabel = "-- Options --",
  revert = false,
  fullWidth = false,
  noBorder = false,
  animatedHover = true,
  header = null,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const selectedValue = useMemo(() => {
    return options.find((option) => option?.value === value);
  }, [value, options]);
  const optionsRef = useRef(null);
  useEffect(() => {
    const handleOffClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowOptions(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef]);

  return (
    <div
      style={{
        position: "relative",
        width: fullWidth ? "100%" : "fit-content",
      }}
      className="fit-container"
      ref={optionsRef}
    >
      <div
        className={`fit-container fx-scattered if pointer ${animatedHover ? "option" : ""}`}
        style={{
          height: "var(--40)",
          padding: "1rem",
          minWidth: "max-content",
          border: noBorder ? "none" : "",
        }}
        onClick={() => (disabled ? null : setShowOptions(!showOptions))}
      >
        <div className="fx-centered">
          {selectedValue?.left_el && selectedValue?.left_el}
          <p>{selectedValue?.display_name || defaultLabel}</p>
        </div>
        <div className="arrow-12"></div>
      </div>
      {showOptions && (
        <div
          style={{
            position: "absolute",
            maxHeight: "350px",
            overflow: "scroll",
            top: revert ? 0 : "110%",
            transform: revert ? "translateY(calc(-100% - 5px))" : "none",
            // border: "none",
            minWidth: fullWidth ? "100%" : "200px",
            width: "max-content",
            zIndex: 1000,
            rowGap: "0",
          }}
          className="sc-s-18 fx-centered fx-col fx-start-v fx-start-h pointer bg-sp drop-down"
          // className="sc-s-18 fx-centered fx-col fx-start-v fx-start-h pointer box-pad-v-s box-pad-h-s bg-sp drop-down"
        >
          {header && header}
          <div className="fit-container box-pad-v-s box-pad-h-s">
            {options.map((option, index) => {
              return (
                <div
                  key={index}
                  className={`option-no-scale fit-container fx-scattered ${
                    option?.left_el ? "fx-start-h" : ""
                  }  pointer box-pad-h-m`}
                  style={{
                    border: "none",
                    overflow: "visible",
                    padding: ".5rem",
                    cursor: option.disabled ? "not-allowed" : "pointer",
                    opacity: option.disabled ? 0.5 : 1,
                  }}
                  onClick={() => {
                    setSelectedValue(option?.value);
                    setShowOptions(false);
                  }}
                >
                  {option?.left_el && option?.left_el}
                  <div
                    className={
                      selectedValue?.value === option?.value
                        ? "orange-c"
                        : "gray-c"
                    }
                  >
                    {option?.display_name}
                  </div>
                  {option?.right_el && option?.right_el}
                </div>
              );
            })}{" "}
          </div>
        </div>
      )}
    </div>
  );
}
