import React, { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export default function OptionsDropdown({
  options,
  border = false,
  vertical = true,
  tooltip = true,
  icon = "dots",
  minWidth = 180,
  parent = window,
}) {
  const { t } = useTranslation();
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [displayAbove, setDisplayAbove] = useState(false);
  const [displayLeft, setDisplayLeft] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      const itemHeight = 37.5;
      const dropdownHeight = itemHeight * options.length;
      const dropdownWidth = minWidth;

      const spaceBottom = parent.innerHeight - rect.bottom;
      const spaceTop = rect.top;
      const spaceRight = parent.innerWidth - rect.right;
      const spaceLeft = rect.left;

      const above = spaceBottom < dropdownHeight && spaceTop > spaceBottom;
      const left = spaceRight < dropdownWidth && spaceLeft > spaceRight;

      setDisplayAbove(above);
      setDisplayLeft(left);

      setPosition({
        top: above ? rect.top : rect.bottom,
        left: left ? rect.right : rect.left,
        triggerWidth: rect.width,
      });
    }

    setOpen((v) => !v);
  };

  return (
    <>
      <div ref={triggerRef} onClick={toggle} style={{ display: "inline-flex" }}>
        <div
          className={`${border ? "round-icon" : "round-icon-small"} ${
            tooltip ? "round-icon-tooltip" : ""
          }`}
          style={{ border: border ? "" : "none" }}
          data-tooltip={icon === "arrow" ? "" : t("A5DDopE")}
        >
          {icon === "dots" && (
            <div
              className={`fx-centered ${vertical ? "fx-col" : ""}`}
              style={{ gap: 0 }}
            >
              <p className="gray-c fx-centered" style={{ height: "6px" }}>
                &#x2022;
              </p>
              <p className="gray-c fx-centered" style={{ height: "6px" }}>
                &#x2022;
              </p>
              <p className="gray-c fx-centered" style={{ height: "6px" }}>
                &#x2022;
              </p>
            </div>
          )}
          {icon === "arrow" && <div className="arrow" />}
        </div>
      </div>

      {open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: position.top,
              left: displayLeft ? position.left - minWidth : position.left,
              transform: displayAbove ? "translateY(-100%)" : "none",
              minWidth,
              width: "max-content",
              zIndex: 999999,
              backgroundColor: "var(--dim-gray)",
              overflow: "visible",
            }}
            className="box-pad-h-s box-pad-v-s sc-s-18 bg-sp fx-centered fx-col fx-start-v pointer drop-down"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            {options.map((option, i) => (
              <Fragment key={i}>{option}</Fragment>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
