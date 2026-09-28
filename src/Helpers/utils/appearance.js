import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { localStorage_ } from "@/Helpers/utils/clientLocalStorage";

const NAV_LAYOUT_KEY = "yaki-nav-layout";
const SIDEBAR_COLLAPSED_KEY = "yaki-sidebar-collapsed";
const GLASS_KEY = "yaki-glass";
const CHANGE_EVENT = "yaki-appearance-change";

export const NAV_LAYOUTS = { topbar: "topbar", sidebar: "sidebar" };
export const GLASS_MODES = { glass: "glass", classic: "classic" };

function read(key, fallback, allowed) {
  try {
    const value = localStorage_?.getItem(key);
    if (value === null || value === undefined) return fallback;
    if (allowed && !allowed.includes(value)) return fallback;
    return value;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage_?.setItem(key, value);
  } catch {}
}

export function getNavLayout() {
  return read(NAV_LAYOUT_KEY, NAV_LAYOUTS.topbar, Object.values(NAV_LAYOUTS));
}

export function getSidebarCollapsed() {
  return read(SIDEBAR_COLLAPSED_KEY, "0", ["0", "1"]) === "1";
}

export function getGlassMode() {
  return read(GLASS_KEY, GLASS_MODES.glass, Object.values(GLASS_MODES));
}

export function applyAppearanceAttributes() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-nav", getNavLayout());
  root.setAttribute("data-nav-collapsed", getSidebarCollapsed() ? "1" : "0");
  root.setAttribute("data-glass", getGlassMode());
}

function notify() {
  applyAppearanceAttributes();
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setNavLayout(value) {
  write(NAV_LAYOUT_KEY, value);
  notify();
}

export function setNavLayoutAnimated(value) {
  if (typeof document === "undefined" || value === getNavLayout()) return setNavLayout(value);
  const root = document.documentElement;
  const canAnimate =
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.matchMedia(`(min-width: ${SIDEBAR_MIN_WIDTH}px)`).matches;
  if (!canAnimate) return setNavLayout(value);
  root.classList.add("nav-morphing");
  try {
    const transition = document.startViewTransition(() => {
      flushSync(() => setNavLayout(value));
    });
    transition.finished.finally(() => root.classList.remove("nav-morphing"));
  } catch {
    root.classList.remove("nav-morphing");
    setNavLayout(value);
  }
}

export function setSidebarCollapsed(collapsed) {
  write(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  notify();
}

export function setGlassMode(value) {
  write(GLASS_KEY, value);
  notify();
}

function snapshot() {
  return {
    navLayout: getNavLayout(),
    sidebarCollapsed: getSidebarCollapsed(),
    glassMode: getGlassMode(),
  };
}

export function useAppearance() {
  const [state, setState] = useState({
    navLayout: NAV_LAYOUTS.topbar,
    sidebarCollapsed: false,
    glassMode: GLASS_MODES.glass,
  });

  useEffect(() => {
    const sync = () => setState(snapshot());
    sync();
    const onStorage = (e) => {
      if ([NAV_LAYOUT_KEY, SIDEBAR_COLLAPSED_KEY, GLASS_KEY].includes(e.key)) {
        applyAppearanceAttributes();
        sync();
      }
    };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return state;
}

export const SIDEBAR_MIN_WIDTH = 1025;

export function useIsSidebarViewport() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${SIDEBAR_MIN_WIDTH}px)`);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

export function isSidebarLayoutActive() {
  if (typeof window === "undefined") return false;
  return (
    getNavLayout() === NAV_LAYOUTS.sidebar &&
    window.matchMedia(`(min-width: ${SIDEBAR_MIN_WIDTH}px)`).matches
  );
}
