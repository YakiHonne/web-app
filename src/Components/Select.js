import React, { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/Components/Icon";

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
  label = false,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const selectedValue = useMemo(() => {
    return options.find((option) => option?.value === value);
  }, [value, options]);
  const optionsRef = useRef(null);

  const close = () => {
    setDismissing(true);
    setTimeout(() => {
      setShowOptions(false);
      setDismissing(false);
    }, 200);
  };

  useEffect(() => {
    const handleOffClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        close();
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
        className={`fit-container fx-scattered fx-col fx-start-v pointer ${animatedHover ? "option" : ""} if`}
        style={{
          height: label ? "auto" : "var(--40)",
          padding: ".5rem 1rem",
          minWidth: "max-content",
          border: noBorder ? "none" : "",
          gap: label ? 0 : "4px",
        }}
        onClick={() => (disabled ? null : showOptions ? close() : setShowOptions(true))}
      >
        {label && (
          <div>
            <p className="gray-c p-medium">{label}</p>
          </div>
        )}
        <div className="fit-container fx-scattered">
          <div className="fx-centered">
            {selectedValue?.left_el && selectedValue?.left_el}
            <p>{selectedValue?.display_name || defaultLabel}</p>
          </div>
          <Icon name="arrow" size={12} />
        </div>
      </div>
      {showOptions && (
        <div
          style={{
            position: "absolute",
            maxHeight: "350px",
            overflow: "scroll",
            top: revert ? "auto" : "calc(100% + 6px)",
            bottom: revert ? "calc(100% + 6px)" : "auto",
            minWidth: fullWidth ? "100%" : "200px",
            width: "max-content",
            zIndex: 1000,
            rowGap: "0",
            borderRadius: "16px",
            transformOrigin: revert ? "bottom center" : "top center",
          }}
          className={`fx-centered fx-col fx-start-v fx-start-h pointer bg-dropdown dynamic-island-dropdown${dismissing ? " dismissing" : ""}`}
        >
          {header && header}
          <div className="fit-container box-pad-v-s box-pad-h-s">
            {options.map((option, index) => {
              return (
                <div
                  key={index}
                  className={`option-no-scale fit-container fx-scattered ${
                    option?.left_el ? "fx-start-h" : ""
                  } pointer box-pad-h-m`}
                  style={{
                    border: "none",
                    overflow: "visible",
                    padding: ".6rem .75rem",
                    borderRadius: "10px",
                    cursor: option.disabled ? "not-allowed" : "pointer",
                    opacity: option.disabled ? 0.5 : 1,
                  }}
                  onClick={() => {
                    setSelectedValue(option?.value);
                    close();
                  }}
                >
                  {option?.left_el && option?.left_el}
                  <div
                    style={{ color: selectedValue?.value === option?.value ? "var(--c1)" : "" }}
                  >
                    {option?.display_name}
                  </div>
                  {option?.right_el && option?.right_el}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
