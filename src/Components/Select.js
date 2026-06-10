import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "@/Components/Icon";
import MobileSheet from "@/Components/MobileSheet";
import useIsMobile from "@/Hooks/useIsMobile";

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
  escapeContainer = false,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const isMobile = useIsMobile();
  const selectedValue = useMemo(() => {
    return options.find((option) => option?.value === value);
  }, [value, options]);
  const optionsRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const close = () => {
    if (isMobile) { setShowOptions(false); return; }
    setDismissing(true);
    setTimeout(() => { setShowOptions(false); setDismissing(false); }, 200);
  };

  useEffect(() => {
    const handleOffClick = (e) => {
      const insideTrigger = optionsRef.current?.contains(e.target);
      const insideDropdown = escapeContainer
        ? dropdownRef.current?.contains(e.target)
        : false;
      if (!insideTrigger && !insideDropdown) close();
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [optionsRef, escapeContainer]);

  useEffect(() => {
    if (!escapeContainer || !showOptions) return;
    const updateRect = () => {
      if (triggerRef.current)
        setAnchorRect(triggerRef.current.getBoundingClientRect());
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [escapeContainer, showOptions]);

  const dropdown = showOptions && (
    <div
      ref={escapeContainer ? dropdownRef : null}
      style={
        escapeContainer
          ? {
            position: "fixed",
            maxHeight: revert
              ? Math.min(350, Math.max(120, (anchorRect?.top ?? 350) - 16))
              : Math.min(350, Math.max(120, window.innerHeight - (anchorRect?.bottom ?? 0) - 16)),
            overflow: "scroll",
            ...(revert
              ? { bottom: `calc(100vh - ${anchorRect?.top ?? 0}px + 6px)` }
              : { top: (anchorRect?.bottom ?? 0) + 6 }),
            left: anchorRect?.left ?? 0,
            minWidth: fullWidth
              ? anchorRect?.width ?? 200
              : 200,
            width: "max-content",
            zIndex: 1000,
            rowGap: "0",
            borderRadius: "16px",
            transformOrigin: revert ? "bottom center" : "top center",
          }
          : {
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
          }
      }
      className={`fx-centered fx-col fx-start-v fx-start-h pointer bg-dropdown dynamic-island-dropdown${escapeContainer ? " select-escaped-dropdown" : ""}${dismissing ? " dismissing" : ""}`}
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
  );

  return (
    <div
      style={{
        position: "relative",
        width: fullWidth ? "100%" : "fit-content",
      }}
      className="fit-container"
      ref={(node) => {
        optionsRef.current = node;
        triggerRef.current = node;
      }}
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
      {isMobile ? (
        <MobileSheet open={showOptions} onClose={close} title={label || defaultLabel}>
          <div className="fx-centered fx-col fx-start-v fit-container" style={{ padding: "0 8px" }}>
            {options.map((option, index) => (
              <div
                key={index}
                className="option-no-scale fit-container fx-scattered pointer"
                style={{
                  padding: "0.85rem 1.25rem",
                  borderRadius: "12px",
                  cursor: option.disabled ? "not-allowed" : "pointer",
                  opacity: option.disabled ? 0.5 : 1,
                  color: selectedValue?.value === option?.value ? "var(--c1)" : "",
                }}
                onClick={() => { if (!option.disabled) { setSelectedValue(option?.value); close(); } }}
              >
                {option?.left_el && option.left_el}
                <div style={{ flex: 1 }}>{option?.display_name}</div>
                {option?.right_el && option.right_el}
              </div>
            ))}
          </div>
        </MobileSheet>
      ) : (
        showOptions &&
        (escapeContainer && typeof document !== "undefined"
          ? createPortal(dropdown, document.body)
          : dropdown)
      )}
    </div>
  );
}
