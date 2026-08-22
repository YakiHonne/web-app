import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./styles.module.css";

const PADDING = 8;
const TOOLTIP_OFFSET = 14;
const TOOLTIP_WIDTH = 260;
// How long after a click/open to auto-advance (ms)
const AUTO_ADVANCE_DELAY = 2000;

function getRect(selector) {
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const borderRadius = window.getComputedStyle(el).borderRadius || "8px";
    return {
      top: r.top - PADDING,
      left: r.left - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
      elTop: r.top,
      elLeft: r.left,
      elRight: r.right,
      elBottom: r.bottom,
      borderRadius,
    };
  } catch {
    return null;
  }
}

function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

function computeTooltipPosition(rect) {
  if (!rect) return { top: 120, left: 20 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tooltipHeight = 190;
  const isNearRight = rect.elRight + TOOLTIP_WIDTH + 16 > vw;
  let top = rect.top + rect.height + TOOLTIP_OFFSET;
  let left = isNearRight ? rect.elRight - TOOLTIP_WIDTH : rect.elLeft;
  top = clamp(top, 8, vh - tooltipHeight - 8);
  left = clamp(left, 8, vw - TOOLTIP_WIDTH - 8);
  return { top, left };
}

/*
  Veil: four absolutely-positioned divs that surround the spotlight rect,
  leaving the element itself fully clickable. Used for requiresClick steps.
  For non-click steps we use a single full-screen overlay.
*/
function Veil({ rect, onVoidClick }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  if (!rect) {
    return <div className={styles.veilFull} onClick={onVoidClick} />;
  }

  const { top, left, width, height, borderRadius } = rect;
  // Parse border-radius to a number for SVG rx/ry (take the first value)
  const r = Math.min(parseFloat(borderRadius) || 8, width / 2, height / 2);

  const cutout = `M ${left + r} ${top}
    H ${left + width - r} Q ${left + width} ${top} ${left + width} ${top + r}
    V ${top + height - r} Q ${left + width} ${top + height} ${left + width - r} ${top + height}
    H ${left + r} Q ${left} ${top + height} ${left} ${top + height - r}
    V ${top + r} Q ${left} ${top} ${left + r} ${top} Z`;

  return (
    <svg
      className={styles.veilSvg}
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
      onClick={onVoidClick}
    >
      <defs>
        <mask id="tour-cutout">
          <rect width={vw} height={vh} fill="white" />
          <path d={cutout} fill="black" />
        </mask>
      </defs>
      <rect
        width={vw}
        height={vh}
        fill="rgba(0,0,0,0.68)"
        mask="url(#tour-cutout)"
      />
    </svg>
  );
}

export default function NavbarTour({ steps, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [rect, setRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(true);
  const [interactionDone, setInteractionDone] = useState(false);
  const rafRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const autoAdvanceRef = useRef(null);

  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  // Lock scroll for the entire tour lifetime
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const measureStep = useCallback((index) => {
    const step = steps[index];
    if (!step) return;
    const r = getRect(step.selector);
    setRect(r);
    setTooltipPos(computeTooltipPosition(r));
  }, [steps]);

  useEffect(() => {
    measureStep(stepIndex);
    setInteractionDone(false);
    clearTimeout(autoAdvanceRef.current);

    function onResize() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => measureStep(stepIndex));
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(hoverTimerRef.current);
      clearTimeout(autoAdvanceRef.current);
    };
  }, [stepIndex, measureStep]);

  const handleComplete = useCallback(() => {
    setExiting(true);
    setTimeout(() => onComplete?.(), 300);
  }, [onComplete]);

  const goToStep = useCallback((nextIndex, direction = 1) => {
    let idx = nextIndex;
    while (idx >= 0 && idx < steps.length && !document.querySelector(steps[idx].selector)) {
      idx += direction;
    }
    if (idx < 0 || idx >= steps.length) { handleComplete(); return; }
    setTooltipVisible(false);
    setTimeout(() => { setStepIndex(idx); setTooltipVisible(true); }, 180);
  }, [steps, handleComplete]);

  const handleNext = useCallback(() => {
    if (isLast) handleComplete();
    else goToStep(stepIndex + 1, 1);
  }, [isLast, stepIndex, goToStep, handleComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirst) goToStep(stepIndex - 1, -1);
  }, [isFirst, stepIndex, goToStep]);

  // Mark interaction done and schedule auto-advance after delay
  const markDone = useCallback(() => {
    setInteractionDone(true);
    clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => {
      // Close any opened dropdowns by dispatching Escape, then advance
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      // Also click outside to close menus
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      setTimeout(() => {
        if (isLast) handleComplete();
        else goToStep(stepIndex + 1, 1);
      }, 150);
    }, AUTO_ADVANCE_DELAY);
  }, [isLast, stepIndex, goToStep, handleComplete]);

  /* ── Hover detection (optional — auto-advances but doesn't block Next) ── */
  useEffect(() => {
    if (!currentStep?.requiresHover) return;
    const el = document.querySelector(currentStep.selector);
    if (!el) return;
    const onEnter = () => { hoverTimerRef.current = setTimeout(() => markDone(), 800); };
    const onLeave = () => clearTimeout(hoverTimerRef.current);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      clearTimeout(hoverTimerRef.current);
    };
  }, [currentStep, markDone]);

  /* ── Click detection (optional — auto-advances but doesn't block Next) ── */
  useEffect(() => {
    if (!currentStep?.requiresClick) return;
    const el = document.querySelector(currentStep.selector);
    if (!el) return;
    const onClick = () => markDone();
    el.addEventListener("click", onClick, true);
    return () => el.removeEventListener("click", onClick, true);
  }, [currentStep, markDone]);

  /* ── Highlight opacity: force icons inside the target to full opacity ── */
  useEffect(() => {
    if (!currentStep?.selector) return;
    const styleId = "tour-highlight-opacity";
    let tag = document.getElementById(styleId);
    if (!tag) {
      tag = document.createElement("style");
      tag.id = styleId;
      document.head.appendChild(tag);
    }
    tag.textContent = `${currentStep.selector} * { opacity: 1 !important; }`;
    return () => { tag.textContent = ""; };
  }, [currentStep]);

  const spotlightStyle = rect
    ? { top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: rect.borderRadius }
    : { top: "-200px", left: "-200px", width: "0px", height: "0px" };

  return (
    <div className={`${styles.tourRoot}${exiting ? ` ${styles.exiting}` : ""}`}>

      {/* Dark veil — punched out around element for click AND hover steps */}
      <Veil rect={rect} onVoidClick={handleNext} />

      {/* Spotlight ring */}
      <div className={styles.spotlight} style={spotlightStyle} />

      {/* Tooltip */}
      <div
        className={styles.tooltip}
        style={{
          top: `${tooltipPos.top}px`,
          left: `${tooltipPos.left}px`,
          opacity: tooltipVisible ? 1 : 0,
          width: `${TOOLTIP_WIDTH}px`,
        }}
      >
        <div className={styles.tooltipStep}>{stepIndex + 1} of {steps.length}</div>
        <h3 className={styles.tooltipTitle}>{currentStep?.title}</h3>
        <p className={styles.tooltipDesc}>{currentStep?.description}</p>

        <div className={styles.tooltipDots}>
          {steps.map((_, i) => (
            <span key={i} className={`${styles.dot}${i === stepIndex ? ` ${styles.active}` : ""}`} />
          ))}
        </div>
      </div>

      {/* Controls pill */}
      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.btnPrev}`}
          onClick={handlePrev}
          disabled={isFirst}
        >← Prev</button>

        <button
          className={`${styles.btn} ${styles.btnSkip}`}
          onClick={handleComplete}
        >Skip</button>

        <button
          className={`${styles.btn} ${styles.btnNext}`}
          onClick={handleNext}
        >{isLast ? "Done" : "Next →"}</button>
      </div>
    </div>
  );
}
