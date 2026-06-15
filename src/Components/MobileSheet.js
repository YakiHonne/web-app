import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ANIM_DURATION = 420;

export default function MobileSheet({ open, onClose, children, title, titleRight }) {
  const sheetRef = useRef(null);
  const [visible, setVisible] = useState(open);
  const [animOpen, setAnimOpen] = useState(open);
  const wasOpened = useRef(open);

  useEffect(() => {
    if (open) {
      wasOpened.current = true;
      setVisible(true);
      document.body.classList.remove("ios-sheet-closing");
      document.body.classList.add("ios-sheet-open");
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimOpen(true)));
    } else {
      if (wasOpened.current && document.body.classList.contains("ios-sheet-open")) {
        document.body.classList.replace("ios-sheet-open", "ios-sheet-closing");
        setTimeout(() => document.body.classList.remove("ios-sheet-closing"), 450);
      }
      setAnimOpen(false);
      const timer = setTimeout(() => setVisible(false), ANIM_DURATION);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!animOpen) return;
    const handle = (e) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [animOpen, onClose]);

  if (typeof document === "undefined" || !visible) return null;

  return createPortal(
    <>
      <div
        className={`mobile-sheet-scrim${animOpen ? " mobile-sheet-scrim-open" : ""}`}
        onClick={onClose}
      />
      <div className={`mobile-sheet${animOpen ? " mobile-sheet-open" : ""}`} ref={sheetRef}>
        <div className="mobile-sheet-handle" />
        {(title || titleRight) && (
          <div className="mobile-sheet-title-row">
            <p className="mobile-sheet-title">{title}</p>
            {titleRight && <div>{titleRight}</div>}
          </div>
        )}
        <div className="mobile-sheet-body">{children}</div>
      </div>
    </>,
    document.body
  );
}
