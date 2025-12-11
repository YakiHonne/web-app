import React, { useEffect, useState, useCallback, useRef } from "react";
import { nip19 } from "nostr-tools";
import LoadingDots from "@/Components/LoadingDots";
import Link from "next/link";
import { isHex } from "@/Helpers/Helpers";
import SearchUserCard from "@/Components/SearchUserCard";
import { useTranslation } from "react-i18next";
import useSearchUsers from "@/Hooks/useSearchUsers";

export default function MentionSuggestions({
  mention,
  setSelectedMention,
  setSelectedMentionMetadata,
  displayAbove = false,
}) {
  const { t } = useTranslation();
  const { users, isSearchLoading } = useSearchUsers(mention);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [users]);

  const encodePubkey = (pubkey) => {
    try {
      if (!isHex(pubkey)) return false;
      return nip19.nprofileEncode({ pubkey });
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!users || users.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < users.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        const user = users[highlightedIndex];
        const url = encodePubkey(user.pubkey);
        if (url) {
          setSelectedMention?.(url);
          setSelectedMentionMetadata?.({ ...user, npub: url });
        }
      }
    },
    [users, highlightedIndex, setSelectedMention, setSelectedMentionMetadata]
  );

  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (users === false) return null;

  return (
    <>
      {isSearchLoading && (
        <div
          className="fit-container sc-s-18"
          style={{
            width: "100%",
            position: "absolute",
            left: 0,
            [displayAbove ? "bottom" : "top"]: "110%",
            overflow: "hidden",
            zIndex: 211,
            height: "20px",
            border: "none",
            backgroundColor: "transparent",
          }}
        >
          <div
            style={{ height: "4px", backgroundColor: "var(--c1)" }}
            className="v-bounce"
          ></div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          [displayAbove ? "bottom" : "top"]: "calc(100% + 5px)",
          left: 0,
          width: "100%",
          maxHeight: "200px",
          overflowY: "auto",
          zIndex: 100,
        }}
        className="sc-s-18 fx-centered fx-start-v fx-start-h fx-col box-pad-v-s"
      >
        {isSearchLoading && users.length === 0 && (
          <>
            <div className="fx-centered fit-container box-pad-v-s">
              <p className="p-small gray-c">{t("AKvHyxG")}</p>
              <LoadingDots />
            </div>
            <hr />
          </>
        )}

        {users.map((user, index) => {
          const url = encodePubkey(user.pubkey);
          if (!url) return null;

          const isHighlighted = index === highlightedIndex;

          return (
            <div
              key={user.pubkey}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`fx-scattered box-pad-v-s box-pad-h-m fit-container pointer search-bar-post ${
                isHighlighted ? "keyboard-active" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMention?.(url);
                setSelectedMentionMetadata?.({ ...user, npub: url });
              }}
              style={{
                borderTop: index !== 0 ? "1px solid var(--pale-gray)" : "",
              }}
            >
              <SearchUserCard user={user} />
              <Link
                href={`/${url}`}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
              >
                <div className="share-icon"></div>
              </Link>
            </div>
          );
        })}

        {users.length === 0 && !isSearchLoading && (
          <div className="fit-container fx-centered">
            <p className="gray-c p-medium p-italic">{t("A6aLMx1")}</p>
          </div>
        )}
      </div>
    </>
  );
}
