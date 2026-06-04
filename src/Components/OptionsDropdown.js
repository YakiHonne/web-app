import React, { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "@/Components/Icon";

export default function OptionsDropdown({
  options,
  border = false,
  vertical = true,
  icon = "dots",
  minWidth = 180,
  parent = window,
}) {
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [position, setPosition] = useState(null);
  const [displayAbove, setDisplayAbove] = useState(false);
  const [displayLeft, setDisplayLeft] = useState(false);

  const close = () => {
    setDismissing(true);
    setTimeout(() => {
      setOpen(false);
      setDismissing(false);
    }, 200);
  };

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleScroll = (e) => {
      // Don't close if the scroll happened inside the dropdown itself
      if (dropdownRef.current?.contains(e.target)) return;
      close();
    };
    const handleResize = () => close();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (open) {
      close();
      return;
    }

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      const itemHeight = 44;
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

    setOpen(true);
  };

  return (
    <>
      <div ref={triggerRef} onClick={toggle} style={{ display: "inline-flex" }}>
        <div
          className={`${border ? "round-icon" : "round-icon-small"}`}
          style={{ border: border ? "" : "none" }}
        >
          {icon === "dots" && (
            <div
              className={`fx-centered ${vertical ? "fx-col" : ""}`}
              style={{ gap: '1px' }}
            >
              <p className="gray-c fx-centered" style={{ height: "4px", fontSize: "14px" }}>
                &#x2022;
              </p>
              <p className="gray-c fx-centered" style={{ height: "4px", fontSize: "14px" }}>
                &#x2022;
              </p>
              <p className="gray-c fx-centered" style={{ height: "4px", fontSize: "14px" }}>
                &#x2022;
              </p>
            </div>
          )}
          {icon === "arrow" && <Icon name="arrow" />}
        </div>
      </div>

      {open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: displayAbove ? "auto" : position.top + 6,
              bottom: displayAbove
                ? parent.innerHeight - position.top + 6
                : "auto",
              left: displayLeft ? position.left - minWidth : position.left,
              minWidth,
              width: "max-content",
              zIndex: 999999,
            }}
            className={`bg-dropdown di-wrapper${dismissing ? " dismissing" : ""}${displayAbove ? " origin-bottom" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <div className="box-pad-h-s box-pad-v-s fx-centered fx-col fx-start-v pointer">
              {options.map((option, i) => (
                <Fragment key={i}>{option}</Fragment>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
