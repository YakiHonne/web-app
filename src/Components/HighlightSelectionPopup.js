import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/Icon";
import PostAsNote from "@/Components/PostAsNote";
import LoginSignup from "@/Components/LoginSignup";
import { copyText } from "@/Helpers/Helpers";
import { setEventFromCache } from "@/Helpers/utils/eventsCache";

const CONTEXT_MAX_LENGTH = 1000;
const BLOCK_SELECTOR = "p, li, blockquote, pre, td, h1, h2, h3, h4, h5, h6";

const cleanParagraph = (paragraph) =>
  paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|`)/g, "")
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

const trimAround = (text, selected) => {
  if (text.length <= CONTEXT_MAX_LENGTH) return text;
  const index = text.indexOf(selected);
  if (index === -1) return "";
  const padding = Math.max(0, Math.floor((CONTEXT_MAX_LENGTH - selected.length) / 2));
  return text
    .slice(Math.max(0, index - padding), index + selected.length + padding)
    .trim();
};

const getSelectionContext = (range, container, text, rawContent) => {
  const selected = text.replace(/\s+/g, " ").trim();
  if (rawContent) {
    const withoutLinks = (value) =>
      selected.includes("http")
        ? value
        : value.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
    const paragraph = rawContent
      .split(/\n\s*\n/)
      .find((item) => cleanParagraph(item).includes(selected));
    if (paragraph) {
      const line = paragraph
        .split("\n")
        .find((item) => cleanParagraph(item).includes(selected));
      return trimAround(withoutLinks(cleanParagraph(line || paragraph)), selected);
    }
  }
  const startNode =
    range.startContainer.nodeType === 1
      ? range.startContainer
      : range.startContainer.parentElement;
  const block = startNode?.closest(BLOCK_SELECTOR);
  if (!block || !container.contains(block)) return "";
  return trimAround((block.innerText || "").replace(/\s+/g, " ").trim(), selected);
};

const buildHighlight = (text, context, source) => {
  const isAddressable = source.kind >= 30000 && source.kind < 40000 && source.aTag;
  const tags = isAddressable
    ? [
      ["a", source.aTag, "", "source"],
      ["e", source.id, "", "source"],
    ]
    : [["e", source.id, "", "source"]];
  tags.push(["p", source.pubkey, "", "author"]);
  return {
    text,
    context,
    tags,
    preview: {
      text,
      comment: "",
      context,
      sourceType: isAddressable ? "address" : "event",
      aTag: isAddressable ? source.aTag : "",
      eTag: source.id,
      relayHint: "",
      url: "",
      domain: "",
      authors: [source.pubkey],
    },
  };
};

export default function HighlightSelectionPopup({ containerRef, sourceEvent }) {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const [selection, setSelection] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const popupRef = useRef(null);

  const readSelection = useCallback(() => {
    const container = containerRef.current;
    const currentSelection = window.getSelection();
    if (!container || !currentSelection || currentSelection.rangeCount === 0) {
      setSelection(null);
      return;
    }
    const text = currentSelection.toString().trim();
    const range = currentSelection.getRangeAt(0);
    if (!text || !container.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    setSelection({
      text,
      context: getSelectionContext(range, container, text, sourceEvent?.content),
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }, [containerRef, sourceEvent]);

  useEffect(() => {
    const onPointerUp = (e) => {
      if (popupRef.current?.contains(e.target)) return;
      requestAnimationFrame(readSelection);
    };
    const onSelectionChange = () => {
      const currentSelection = window.getSelection();
      if (!currentSelection || currentSelection.isCollapsed) setSelection(null);
    };
    document.addEventListener("mouseup", onPointerUp);
    document.addEventListener("touchend", onPointerUp);
    document.addEventListener("keyup", onPointerUp);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("touchend", onPointerUp);
      document.removeEventListener("keyup", onPointerUp);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [readSelection]);

  const handleHighlight = () => {
    if (!selection) return;
    if (!userKeys) {
      setIsLogin(true);
      return;
    }
    const { id, pubkey, kind, content, tags, created_at, sig } = sourceEvent;
    setEventFromCache(
      sourceEvent.aTag && kind >= 30000 ? sourceEvent.aTag : id,
      { id, pubkey, kind, content, tags, created_at, sig },
    );
    setHighlight(buildHighlight(selection.text, selection.context, sourceEvent));
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  const handleCopy = (e) => {
    if (!selection) return;
    copyText(selection.text, t("Ae9XEnt"), e);
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  return (
    <>
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      {highlight && (
        <PostAsNote exit={() => setHighlight(null)} highlight={highlight} />
      )}
      {selection &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            className="bg-dropdown box-pad-h-s box-pad-v-s fx-centered dynamic-island-dropdown"
            style={{
              position: "absolute",
              top: selection.top,
              left: selection.left,
              transform: "translate(-50%, calc(-100% - 10px))",
              zIndex: 1100,
              borderRadius: "16px",
              gap: "4px",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div
              className="fx-centered pointer option-no-scale box-pad-h-s box-pad-v-s repost-dropdown-item"
              style={{ columnGap: "8px" }}
              onClick={handleHighlight}
            >
              <Icon name="highlighter" size={18} isBoldThemeColor />
              <p>{t("AWdFMmw")}</p>
            </div>
            <div
              className="fx-centered pointer option-no-scale box-pad-h-s box-pad-v-s repost-dropdown-item"
              style={{ columnGap: "8px" }}
              onClick={handleCopy}
            >
              <Icon name="copy" size={18} />
              <p>{t("Anwd2wT")}</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
