import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearToast } from "@/Store/Slides/Publishers";
import Link from "next/link";
import { useTranslation } from "react-i18next";

function ToastContent({ toast, styles }) {
  return (
    <div className="fx-centered fx-gap-h-l">
      <p style={{ color: "var(--black)" }}>{toast.desc}</p>
    </div>
  );
}

function ToastItem({ toast, index, total, isExpanded, onExpand }) {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    const autoCloseTimer = setTimeout(() => handleClose(), 3000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(autoCloseTimer);
    };
  }, []);

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => {
      dispatch(clearToast({ id: toast.id }));
    }, 400);
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case 1:
        return {
          color: "var(--green-main)",
          icon: "bell",
          bg: "var(--green-side)",
        };
      case 2:
        return {
          color: "var(--red-main)",
          icon: "moderation",
          bg: "var(--red-side)",
        };
      case 3:
        return {
          color: "var(--orange-main)",
          icon: "settings",
          bg: "var(--orange-side)",
        };
      default:
        return {
          color: "var(--black)",
          icon: "bell",
          bg: "var(--c1-side)",
        };
    }
  };

  const styles = getTypeStyles();
  const stackIndex = index;
  const isTop = stackIndex === 0;

  const getTransform = () => {
    if (!isVisible) return "translateY(-40px) scale(0.95)";
    if (isExpanded) return "translateY(0) scale(1)";
    const yOffset = stackIndex * 10;
    const scale = 1 - stackIndex * 0.05;
    return `translateY(${yOffset}px) scale(${scale})`;
  };

  const Wrapper = toast.custom && toast.data?.link ? Link : "div";
  const wrapperProps =
    toast.custom && toast.data?.link ? { href: toast.data.link } : {};

  return (
    <div
      className="sc-s-18 shadow-l pointer"
      onClick={!isExpanded && total > 1 ? onExpand : undefined}
      style={{
        width: "min(400px, 90vw)",
        background: "var(--c1-side)",
        border: `1px solid var(--dim-gray)`,
        borderBottom: `2px solid ${styles.color}`,
        position: isExpanded ? "relative" : "absolute",
        top: 0,
        right: 0,
        zIndex: total - stackIndex,
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        opacity: isVisible ? (isExpanded ? 1 : 1 - stackIndex * 0.2) : 0,
        transform: getTransform(),
        pointerEvents: isTop || isExpanded ? "auto" : "none",
        visibility: !isExpanded && stackIndex > 2 ? "hidden" : "visible",
        overflow: "hidden",
      }}
    >
      <Wrapper
        {...wrapperProps}
        className="fit-container fx-scattered box-pad-h box-pad-v-m "
      >
        <ToastContent toast={toast} styles={styles} />

        <div
          className="fx-centered cursor-pointer bg-hover "
          style={{
            zIndex: 5,
            position: "relative",
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: "100%",
          }}
          onClick={handleClose}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: "rotate(-90deg)",
            }}
          >
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="var(--gray)"
              strokeWidth="2"
              fill="transparent"
              opacity="0.2"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke={styles.color}
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={88}
              strokeDashoffset={isVisible ? 88 : 0}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 3s linear",
              }}
            />
          </svg>
          <div className="close" style={{ position: "static" }}>
            <div></div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
}

export default function ToastMessage() {
  const { t } = useTranslation();
  const toasts = useSelector((state) => state.toast);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (toasts.length <= 1) setIsExpanded(false);
  }, [toasts.length]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 10000000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: isExpanded ? "12px" : "0px",
        pointerEvents: "none",
        width: "min(400px, 90vw)",
        minHeight: "100px",
      }}
    >
      {[...toasts].reverse().map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          total={toasts.length}
          isExpanded={isExpanded}
          onExpand={() => setIsExpanded(true)}
        />
      ))}
    </div>
  );
}
