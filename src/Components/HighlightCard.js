import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { nip19 } from "nostr-tools";
import Icon from "@/Components/Icon";
import Spinner from "@/Components/Spinner";
import { eventKinds } from "@/Content/Extra";
import { iconsNames } from "@/Content/IconV2URL";
import { getSubData } from "@/Helpers/Controlers";
import { getParsedRepEvent } from "@/Helpers/Encryptions";
import { getEventFromCache, setEventFromCache } from "@/Helpers/utils/eventsCache";
import { relaysOnPlatform } from "@/Content/Relays";
import { saveUsers } from "@/Helpers/DB";
import { getLinkFromAddr } from "@/Helpers/Helpers";
import useUserProfile from "@/Hooks/useUsersProfile";
import UserProfilePic from "@/Components/UserProfilePic";

const SOURCE_RELAYS = [...relaysOnPlatform, "wss://relay.primal.net"];
const SOURCE_FETCH_LIMIT = 5000;

const getSourceFilter = (highlight) => {
  if (highlight.sourceType === "address") {
    const [kind, pubkey, ...identifier] = highlight.aTag.split(":");
    if (!kind || !pubkey) return null;
    return {
      kinds: [parseInt(kind)],
      authors: [pubkey],
      "#d": [identifier.join(":")],
    };
  }
  if (highlight.sourceType === "event") return { ids: [highlight.eTag] };
  return null;
};

const shortenMiddle = (value, maxLength = 42) => {
  if (!value || value.length <= maxLength) return value;
  const head = Math.ceil(maxLength * 0.62);
  const tail = maxLength - head - 3;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
};

const getSourceKey = (highlight) =>
  highlight.sourceType === "address" ? highlight.aTag : highlight.eTag;

const getSourceLink = (highlight, sourceEvent) => {
  try {
    if (highlight.sourceType === "address") {
      const [kind, pubkey, ...identifier] = highlight.aTag.split(":");
      const naddr = nip19.naddrEncode({
        kind: parseInt(kind),
        pubkey,
        identifier: identifier.join(":"),
        relays: highlight.relayHint ? [highlight.relayHint] : [],
      });
      const path = getLinkFromAddr(naddr);
      return path?.startsWith("/") ? path : "";
    }
    if (highlight.sourceType === "event")
      return `/note/${nip19.neventEncode({
        id: highlight.eTag,
        author: sourceEvent?.pubkey,
        relays: highlight.relayHint ? [highlight.relayHint] : [],
      })}`;
  } catch (err) {
    console.log(err);
  }
  return "";
};

const normalizeText = (text = "") =>
  text
    .replace(/!\[[^\]]*\]\([^)]*\)?/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|`)/g, "")
    .replace(/\s+/g, " ")
    .trim();

const getContextParts = (text, context) => {
  const highlight = normalizeText(text);
  const surrounding = normalizeText(context);
  if (!highlight || surrounding.length <= highlight.length) return null;
  const index = surrounding.indexOf(highlight);
  if (index === -1) return null;
  let before = surrounding.slice(0, index);
  let after = surrounding.slice(index + highlight.length);
  if (before && /^[a-z]/.test(before)) before = `…${before}`;
  if (after && !/[.!?"”’)\]]$/.test(after)) after = `${after}…`;
  return { before, highlight, after };
};

function HighlightText({ text, context }) {
  const parts = getContextParts(text, context);
  if (!parts) return text;
  return (
    <>
      {parts.before && <span className="gray-c">{parts.before}</span>}
      <span
        style={{
          backgroundColor: "var(--orange-side)",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
          padding: "1px 3px",
          borderRadius: "4px",
        }}
      >
        {parts.highlight}
      </span>
      {parts.after && <span className="gray-c">{parts.after}</span>}
    </>
  );
}

function useHighlightSource(highlight) {
  const key = getSourceKey(highlight);
  const [sourceEvent, setSourceEvent] = useState(
    key ? getEventFromCache(key) : null,
  );
  const [isLoading, setIsLoading] = useState(
    Boolean(key && getSourceFilter(highlight) && !sourceEvent),
  );

  useEffect(() => {
    const filter = getSourceFilter(highlight);
    if (!key || !filter || sourceEvent) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    const loadingTimeout = setTimeout(() => setIsLoading(false), SOURCE_FETCH_LIMIT);
    const fetchSource = async () => {
      setIsLoading(true);
      try {
        const res = await getSubData(
          [filter],
          2500,
          highlight.relayHint ? [highlight.relayHint, ...SOURCE_RELAYS] : SOURCE_RELAYS,
          undefined,
          1,
        );
        const event = res.data[0];
        if (!event || cancelled) return;
        const raw = (event.rawEvent && event.rawEvent()) || event;
        setEventFromCache(key, raw);
        saveUsers([raw.pubkey]);
        setSourceEvent(raw);
      } catch (err) {
        console.log(err);
      }
      clearTimeout(loadingTimeout);
      if (!cancelled) setIsLoading(false);
    };
    fetchSource();
    return () => {
      cancelled = true;
      clearTimeout(loadingTimeout);
    };
  }, [key]);

  return { sourceEvent, isLoading };
}

export function HighlightTag() {
  const { t } = useTranslation();
  return (
    <div className="sticker sticker-orange-side" style={{ gap: "4px" }}>
      <Icon name="highlighter" size={12} isBoldThemeColor />
      {t("AWdFMmw")}
    </div>
  );
}

export default function HighlightCard({ highlight }) {
  const { t } = useTranslation();
  const { sourceEvent, isLoading: isSourceLoading } = useHighlightSource(highlight);
  const authorPubkey =
    sourceEvent?.pubkey ||
    highlight.authors[0] ||
    (highlight.sourceType === "address" ? highlight.aTag.split(":")[1] : "");
  const { userProfile } = useUserProfile(authorPubkey, false);
  const isWeb = highlight.sourceType === "web";
  const title =
    highlight.sourceType === "address" && sourceEvent
      ? getParsedRepEvent(sourceEvent)?.title
      : "";
  const authorName = authorPubkey
    ? userProfile.display_name || userProfile.name
    : "";
  const sourceLabel = isWeb ? highlight.domain : title || authorName;
  const link = isWeb ? highlight.url : getSourceLink(highlight, sourceEvent);

  const noteSnippet =
    highlight.sourceType === "event" && sourceEvent?.content
      ? sourceEvent.content
        .replace(/nostr:\S+|https?:\/\/\S+/g, "")
        .replace(/\s+/g, " ")
        .trim()
      : "";
  const nostrLabel =
    title || (noteSnippet.length > 48 ? `${noteSnippet.slice(0, 48)}…` : noteSnippet);

  const sourceKind =
    highlight.sourceType === "address"
      ? parseInt(highlight.aTag.split(":")[0])
      : sourceEvent?.kind;
  const sourceKindName = eventKinds[sourceKind]
    ? eventKinds[sourceKind].charAt(0).toUpperCase() + eventKinds[sourceKind].slice(1)
    : "";

  const openSource = (e) => {
    e.stopPropagation();
    if (!link || window.getSelection()?.toString()) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fit-container sc-s-18 bg-sp"
      style={{
        overflow: "hidden",
        marginTop: highlight.comment ? ".5rem" : 0,
        cursor: "default",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="fit-container box-pad-h-m box-pad-v-m fx-centered fx-col fx-start-v"
        style={{ gap: "8px" }}
      >
        <div
          className={`fx-centered fx-start-h${link ? " pointer highlight-source-link" : ""}`}
          style={{
            gap: "6px",
            minWidth: 0,
            maxWidth: "calc(100% + 16px)",
            padding: "3px 8px",
            margin: "-3px -8px",
            borderRadius: "8px",
          }}
          onClick={openSource}
        >
          <Icon name="highlighter" size={16} isBoldThemeColor />
          {!sourceLabel && !authorPubkey ? (
            <p className="c1-c p-medium p-one-line" style={{ color: "var(--c1)" }}>
              {t("AWdFMmw")}
            </p>
          ) : (
            <>
              <p
                className="c1-c p-medium"
                style={{ color: "var(--c1)", minWidth: "max-content" }}
              >
                {t("A0oJnJc")}
              </p>
              {!isWeb && authorPubkey && (
                <UserProfilePic
                  size={15}
                  mainAccountUser={false}
                  user_id={authorPubkey}
                  img={userProfile.picture}
                  metadata={userProfile}
                />
              )}
              {!isWeb && sourceKindName && (
                <p className="gray-c p-medium" style={{ minWidth: "max-content" }}>
                  [{sourceKindName}]
                </p>
              )}
              {!isWeb && isSourceLoading && <Spinner size={12} />}
              {(isWeb ? highlight.domain : nostrLabel) && (
                <p className="p-medium p-one-line">
                  {isWeb ? highlight.domain : nostrLabel}
                </p>
              )}
            </>
          )}
        </div>
        <p
          dir="auto"
          style={{
            borderLeft: "3px solid var(--c1)",
            paddingLeft: "12px",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
          }}
        >
          <HighlightText text={highlight.text} context={highlight.context} />
        </p>
      </div>
      {link && (
        <div
          className="fit-container fx-scattered box-pad-h-m box-pad-v-s pointer highlight-source-link"
          style={{ borderTop: "1px solid var(--very-dim-gray)" }}
          onClick={openSource}
        >
          <div className="fx-centered fx-start-h" style={{ gap: "8px", minWidth: 0, maxWidth: "60%" }}>
            <Icon name={iconsNames.globe} v={2} size={16} />
            <p className="gray-c p-medium p-one-line">
              {shortenMiddle(isWeb ? highlight.url : `yakihonne.com${link}`)}
            </p>
          </div>
          <Icon name={iconsNames.external_link} v={2} size={16} />
        </div>
      )}
    </div>
  );
}
