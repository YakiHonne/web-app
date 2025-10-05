import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Select({
  options,
  value,
  disabled,
  setSelectedValue,
  defaultLabel = "-- Options --",
  revert = false,
  fullWidth = false,
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
        className="fit-container fx-scattered if option pointer"
        style={{ height: "var(--40)", padding: "1rem", minWidth: "max-content" }}
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

            top: revert ? 0 : "110%",
            transform: revert ? "translateY(calc(-100% - 5px))" : "none",
            // border: "none",
            minWidth: fullWidth ? "100%" : "200px",
            width: "max-content",
            zIndex: 1000,
            rowGap: "0",
          }}
          className="sc-s-18 fx-centered fx-col fx-start-v pointer box-pad-v-s box-pad-h-s bg-sp drop-down"
        >
          {options.map((option, index) => {
            return (
              <div
                key={index}
                className={`option-no-scale fit-container fx-scattered ${option?.left_el ? "fx-start-h" : ""}  pointer box-pad-h-m`}
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
          })}
        </div>
      )}
    </div>
  );
}
