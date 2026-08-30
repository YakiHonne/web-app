import dynamic from "next/dynamic";
import Gallery from "@/Components/Gallery";

const AudioLoader = dynamic(() => import("@/Components/AudioLoader"), {
  ssr: false,
});
import IMGElement from "@/Components/IMGElement";
import LinkPreview from "@/Components/LinkPreview";
import LNBCInvoice from "@/Components/LNBCInvoice";
import Nip19Parsing from "@/Components/Nip19Parsing";
import VideoLoader from "@/Components/VideoLoader";
import Link from "next/link";
import { Fragment, createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { localStorage_ } from "./utils/clientLocalStorage";
import { nip19 } from "nostr-tools";
import React from "react";
import MediaUploaderServer from "@/Content/MediaUploaderServer";
import LNURLParsing from "@/Components/LNURLParsing";
import { customHistory } from "./History";
import { store } from "@/Store/Store";
import { setRefreshAppSettings } from "@/Store/Slides/Extras";
import { nanoid } from "nanoid";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { checkJWT, decodeJWT } from "./Encryptions";
const RedPacketBox = dynamic(
  () => import("@/Components/RedPacket/RedPacketBox"),
  { ssr: false },
);
import Icon from "@/Components/Icon";
import { useVideoThumbnail } from "@/Hooks/useVideoThumbnail";
import Carousel from "@/Components/Carousel";
import { getNip22Refs, getThreadRefs } from "@/Helpers/Threads";

const NoteMediaContext = createContext(null);

const NoteTreeWithMedia = ({ children, mediaItems, pubkey, noBlur, sliderPortalId }) => {
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    if (!sliderPortalId) return;
    const el = document.getElementById(sliderPortalId);
    if (el) setPortalTarget(el);
  }, [sliderPortalId]);

  const slider = mediaItems.length > 0 && (
    <MediaSlider mediaItems={mediaItems} onOpen={setGalleryIndex} pubkey={pubkey} noBlur={noBlur} />
  );

  return (
    <NoteMediaContext.Provider value={{ mediaItems, openGallery: setGalleryIndex }}>
      {children}
      {!portalTarget && slider}
      {portalTarget && createPortal(slider, portalTarget)}
      {galleryIndex !== null && (
        <Carousel
          imgs={mediaItems}
          selectedImage={galleryIndex}
          back={(e) => {
            if (e) { e.stopPropagation(); e.preventDefault(); }
            setGalleryIndex(null);
          }}
        />
      )}
    </NoteMediaContext.Provider>
  );
};

const MediaChip = ({ type, url, mediaIndex }) => {
  const ctx = useContext(NoteMediaContext);
  const iconName = type === "image" ? "image_01" : "monitor_play";
  const label = type === "image" ? "image" : "video";
  return (
    <span
      style={{ position: "relative", display: "inline-flex", verticalAlign: "middle" }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (ctx?.openGallery) ctx.openGallery(mediaIndex);
      }}
    >
      <span
        className="pointer sticker sticker-normal sticker-small fx-centered"
        style={{ gap: "4px", transform: "translateY(2px)", cursor: "pointer", color: "var(--gray-c)" }}
      >
        <Icon name={iconName} v={2} size={14} />
        <p style={{ margin: 0 }}>{label}</p>
      </span>
    </span>
  );
};

const SLIDE_WIDTH = "calc((100% - 8px) / 2.3)";

const slideStyle = {
  position: "relative",
  flex: `0 0 ${SLIDE_WIDTH}`,
  width: SLIDE_WIDTH,
  aspectRatio: "9/16",
  borderRadius: "var(--border-r-18)",
  overflow: "hidden",
  background: "var(--very-dim-gray)",
  cursor: "pointer",
};

const VideoThumbnailSlide = ({ url, onOpen, index, onSlideClick }) => {
  const thumbnail = useVideoThumbnail(url);
  return (
    <div
      className="pointer"
      style={slideStyle}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSlideClick(e, index); }}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt="video"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "var(--very-dim-gray)" }} />
      )}
      <div
        className="fx-centered"
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }}
      >
        <Icon name="play_circle" v={2} size={40} isColored={false} />
      </div>
    </div>
  );
};

const ImageSlide = ({ url, onOpen, index, onSlideClick }) => (
  <div
    className="pointer"
    style={slideStyle}
    onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSlideClick(e, index); }}
  >
    <img
      src={url}
      alt="media"
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
    />
  </div>
);

const DRAG_THRESHOLD = 5;

const MediaSlider = ({ mediaItems, onOpen }) => {
  const trackRef = useRef(null);
  const didDrag = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onSlideClick = (_e, index) => {
    if (didDrag.current) return;
    onOpen(index);
  };

  const onMouseDown = (e) => {
    didDrag.current = false;
    startX.current = e.pageX;
    scrollLeft.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = "grabbing";
    trackRef.current.style.userSelect = "none";

    const onMove = (ev) => {
      const dx = ev.pageX - startX.current;
      if (Math.abs(dx) >= DRAG_THRESHOLD) didDrag.current = true;
      trackRef.current.scrollLeft = scrollLeft.current - dx;
    };

    const onUp = () => {
      trackRef.current.style.cursor = "grab";
      trackRef.current.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div style={{ marginTop: "12px", width: "100%" }}>
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          cursor: "grab",
          paddingBottom: "4px",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {mediaItems.map((item, index) =>
          item.type === "video" ? (
            <VideoThumbnailSlide key={index} url={item.url} onOpen={onOpen} index={index} onSlideClick={onSlideClick} />
          ) : (
            <ImageSlide key={index} url={item.url} onOpen={onOpen} index={index} onSlideClick={onSlideClick} />
          )
        )}
      </div>
    </div>
  );
};

let nostrClients = [
  "nstart.me",
  "yakihonne.com",
  "njump.me",
  "nostr.com",
  "nostr.band",
  "iris.to",
  "primal.net",
  "jumble.social",
  "coracle.social",
  "nostrudel.ninja",
  "phoenix.social",
  "habla.news",
  "nosotros.app",
  "nostter.app",
  "lumilumi.app",
  "fevela.me",
  "jumblekat.com",
];

const nostrSchemaRegex =
  /\b(naddr1|note1|nevent1|npub1|nprofile1|nsec1|nrelay1)[a-zA-Z0-9]+\b/;

const doesContainNostrSchema = (url) => {
  try {
    const url_ = new URL(url);
    const domain = url_.hostname.replace(/^www\./, "");
    const isWhitelisted = nostrClients.some((allowed) =>
      domain.endsWith(allowed),
    );
    if (!isWhitelisted) return false;
    return nostrSchemaRegex.test(url);
  } catch {
    return false;
  }
};

const CUSTOM_EMOJI_REGEX = /:([a-zA-Z0-9_+-]+):/g;

const renderCustomEmojis = (text, emojiMap) => {
  if (!emojiMap || !text || !text.includes(":")) return text;
  CUSTOM_EMOJI_REGEX.lastIndex = 0;
  if (!CUSTOM_EMOJI_REGEX.test(text)) return text;
  CUSTOM_EMOJI_REGEX.lastIndex = 0;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = CUSTOM_EMOJI_REGEX.exec(text)) !== null) {
    const url = emojiMap[match[1]];
    if (!url) continue;
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <img
        key={`${match[1]}-${match.index}`}
        src={url}
        alt={`:${match[1]}:`}
        title={`:${match[1]}:`}
        className="custom-emoji"
        loading="lazy"
      />,
    );
    lastIndex = match.index + match[0].length;
  }
  if (parts.length === 0) return text;
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.map((part, index) =>
    typeof part === "string" ? (
      <Fragment key={index}>{part}</Fragment>
    ) : (
      part
    ),
  );
};

export function getNoteTree(
  note,
  minimal = false,
  isCollapsedNote = false,
  wordsCount = 150,
  pubkey,
  noBlur = false,
  sliderPortalId = null,
  emojiMap = null,
) {
  if (!note) return "";
  let tree = note
    .trim()
    .split(/(\n)/)
    .flatMap((segment) => (segment === "\n" ? "\n" : segment.split(/\s+/)))
    .filter(Boolean);

  let totalMedia = 0;
  for (let i = 0; i < (isCollapsedNote ? wordsCount : tree.length); i++) {
    const el_ = tree[i]?.replaceAll("nostr:", "") || "";
    if (
      (/(https?:\/\/)/i.test(el_) ||
        el_.startsWith("data:image") ||
        /^ipfs:\/\//i.test(el_)) &&
      !el_.includes("https://yakihonne.com/smart-widget-checker?naddr=") &&
      !minimal
    ) {
      const cleanUrl_ = el_.replace(/[.,|']+$/, "");
      if (!isVid(cleanUrl_)) {
        const check_ = isImageUrl(cleanUrl_);
        if (check_?.type === "image" || check_?.type === "video") totalMedia++;
      }
    }
  }
  const useChipMode = totalMedia > 1;

  let finalTree = [];
  let mediaItems = [];
  let chipPositions = [];
  let maxChar = isCollapsedNote ? wordsCount : tree.length;
  for (let i = 0; i < maxChar; i++) {
    const el = tree[i].replaceAll("nostr:", "");

    const key = `${el}-${i}`;
    if (!el) {
      continue;
    }
    if (el === "\n") {
      const last1 = finalTree[finalTree.length - 1];
      const last2 = finalTree[finalTree.length - 2];
      if (!(last1 && last1.type === "br" && last2 && last2.type === "br")) {
        finalTree.push(<br key={key} />);
      }
    } else if (
      (/(https?:\/\/)/i.test(el) ||
        el.startsWith("data:image") ||
        /^ipfs:\/\//i.test(el)) &&
      !el.includes("https://yakihonne.com/smart-widget-checker?naddr=")
    ) {
      let cleanUrl = el.replace(/[.,|']+$/, "");
      const isURLCommonPlatformVid = isVid(cleanUrl);
      const secureUrl = toSecureMediaUrl(cleanUrl);
      if (!minimal) {
        if (isURLCommonPlatformVid) {
          finalTree.push(
            <VideoLoader
              pubkey={pubkey}
              key={key}
              isCommonPlatform={isURLCommonPlatformVid.isYT ? "yt" : "vm"}
              src={isURLCommonPlatformVid.videoId}
            />,
          );
        }
        if (!isURLCommonPlatformVid) {
          const checkURL = isImageUrl(cleanUrl);
          if (checkURL) {
            if (checkURL.type === "image") {
              if (useChipMode) {
                const mediaIndex = mediaItems.length;
                mediaItems.push({ url: secureUrl, type: "image" });
                chipPositions.push({ mediaIndex, treeIndex: finalTree.length });
                finalTree.push(
                  <MediaChip
                    key={key}
                    type="image"
                    url={secureUrl}
                    mediaIndex={mediaIndex}
                  />,
                );
              } else {
                finalTree.push(<IMGElement src={secureUrl} key={key} />);
              }
            } else if (checkURL.type === "video") {
              if (useChipMode) {
                const mediaIndex = mediaItems.length;
                mediaItems.push({ url: secureUrl, type: "video" });
                chipPositions.push({ mediaIndex, treeIndex: finalTree.length });
                finalTree.push(
                  <MediaChip
                    key={key}
                    type="video"
                    url={secureUrl}
                    mediaIndex={mediaIndex}
                  />,
                );
              } else {
                finalTree.push(
                  <VideoLoader pubkey={pubkey} key={key} src={secureUrl} />,
                );
              }
            }
          } else if (
            cleanUrl.includes(".mp3") ||
            cleanUrl.includes(".ogg") ||
            cleanUrl.includes(".wav")
          ) {
            finalTree.push(
              <AudioLoader audioSrc={toSecureMediaUrl(cleanUrl)} key={key} />,
            );
          } else if (doesContainNostrSchema(cleanUrl)) {
            let cleanPart = cleanUrl.match(nostrSchemaRegex)?.[0];
            if (cleanPart) {
              finalTree.push(
                <Fragment key={key}>
                  <Nip19Parsing addr={cleanPart} minimal={minimal} />
                </Fragment>,
              );
            } else {
              finalTree.push(
                <Fragment key={key}>
                  <LinkPreview url={cleanUrl} minimal={minimal} />{" "}
                </Fragment>,
              );
            }
          } else {
            finalTree.push(
              <Fragment key={key}>
                <LinkPreview url={cleanUrl} minimal={minimal} />{" "}
              </Fragment>,
            );
          }
        }
      } else
        finalTree.push(
          <Fragment key={key}>
            <a
              style={{ wordBreak: "break-word", color: "var(--orange-main)" }}
              href={cleanUrl}
              className="btn-text-gray"
              onClick={(e) => e.stopPropagation()}
            >
              {cleanUrl}
            </a>{" "}
          </Fragment>,
        );
    } else if (isRelayUrl(el))
      finalTree.push(
        <Fragment key={key}>
          <a
            style={{ position: "relative", display: "inline-flex" }}
            className="fx-centered pointer sticker sticker-normal sticker-green-side"
            href={`/r/content?r=${el}`}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            <p>{el}</p>
            <Icon name="share-icon" />
          </a>{" "}
        </Fragment>,
      );
    else if (
      (el?.includes("nostr:") ||
        el?.includes("naddr") ||
        el?.includes("https://yakihonne.com/smart-widget-checker?naddr=") ||
        el?.includes("nprofile") ||
        el?.includes("npub") ||
        el?.includes("note1") ||
        el?.includes("nevent")) &&
      el?.length > 30
    ) {
      const nip19add = el
        .replace("https://yakihonne.com/smart-widget-checker?naddr=", "")
        .replace("nostr:", "");

      const parts = nip19add.split(/([@.,?!\s:()’"'`])/);
      const finalOutput = parts.map((part, index) => {
        if (
          part?.startsWith("npub1") ||
          part?.startsWith("nprofile1") ||
          part?.startsWith("nevent") ||
          part?.startsWith("naddr") ||
          part?.startsWith("note1")
        ) {
          const cleanedPart = part.replace(/[@.,?!]/g, "");
          return (
            <Fragment key={index}>
              <Nip19Parsing addr={cleanedPart} minimal={minimal} />
            </Fragment>
          );
        } else if (part.match(nostrSchemaRegex)?.[0]) {
          return (
            <Fragment key={index}>
              <Nip19Parsing
                addr={part.match(nostrSchemaRegex)?.[0]}
                minimal={minimal}
              />
            </Fragment>
          );
        }
        return part;
      });
      finalTree.push(<Fragment key={key}>{finalOutput} </Fragment>);
    } else if (el.match(nostrSchemaRegex)?.[0]) {
      let cleanPart = el.match(nostrSchemaRegex)?.[0];

      finalTree.push(
        <Fragment key={key}>
          <Nip19Parsing addr={cleanPart} minimal={minimal} />
        </Fragment>,
      );
    } else if (el?.startsWith("lnbc") && el.length > 30) {
      finalTree.push(<LNBCInvoice lnbc={el} key={key} />);
    } else if (el?.startsWith("lnurl") && el.length > 30) {
      finalTree.push(<LNURLParsing lnurl={el} key={key} />);
    } else if (el?.startsWith("#")) {
      const match = el.match(/(#+)([^\s#]+)/);
      if (match) {
        const hashes = match[1];
        const text = match[2];
        const ifMore = el.replace(match[0], "");
        finalTree.push(
          <React.Fragment key={key}>
            {hashes.slice(1)}
            <Link
              style={{ position: "relative", display: "inline-flex" }}
              className="fx-centered pointer sticker sticker-normal sticker-blue-side"
              href={{
                pathname: `/search`,
                query: { tab: "notes", keyword: text },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p>{`${hashes.slice(-1)}${text}`}</p>
              <Icon name="share-icon" />
            </Link>{" "}
            {ifMore && <span>{ifMore} </span>}
          </React.Fragment>,
        );
      }
    } else {
      let jwt = checkJWT(el);
      if (jwt) {
        let { s, s_addr, r, m, a, c_at, pi, img } = decodeJWT(el);

        if (s && s_addr && r && a && c_at && pi) {
          finalTree.push(
            <RedPacketBox
              key={key}
              data={{
                s,
                s_addr,
                r,
                m,
                a,
                c_at,
                pi,
                img,
              }}
            />,
          );
        } else {
          finalTree.push(
            <span
              style={{
                wordBreak: "break-word",
                color: "var(--dark-gray)",
              }}
              key={key}
            >
              {renderCustomEmojis(el, emojiMap)}{" "}
            </span>,
          );
        }
      } else {
        finalTree.push(
          <span
            style={{
              wordBreak: "break-word",
              color: "var(--dark-gray)",
            }}
            key={key}
          >
            {renderCustomEmojis(el, emojiMap)}{" "}
          </span>,
        );
      }
    }
  }

  let trailingMediaIndices = new Set();
  if (useChipMode && chipPositions.length > 0) {
    let lastNonMediaIdx = -1;
    for (let i = finalTree.length - 1; i >= 0; i--) {
      const el = finalTree[i];
      const isChip = el?.type === MediaChip;
      const isBr = el?.type === "br";
      if (!isChip && !isBr) {
        lastNonMediaIdx = i;
        break;
      }
    }
    for (const cp of chipPositions) {
      if (cp.treeIndex > lastNonMediaIdx) {
        trailingMediaIndices.add(cp.mediaIndex);
      }
    }
  }

  const prunedTree = finalTree.map((el) => {
    if (el?.type === MediaChip && trailingMediaIndices.has(el.props.mediaIndex)) {
      return null;
    }
    return el;
  }).filter(Boolean);

  const mergedTree = mergeConsecutivePElements(prunedTree, pubkey, noBlur);
  if (mediaItems.length === 0) return mergedTree;
  return (
    <NoteTreeWithMedia mediaItems={mediaItems} pubkey={pubkey} noBlur={noBlur} sliderPortalId={sliderPortalId}>
      {mergedTree}
    </NoteTreeWithMedia>
  );
}

export function getComponent(children) {
  if (!children) return <></>;
  let res = [];
  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === "string") {
      let all = children[i].toString().split(" ");
      for (let child of all) {
        let key = `${i}-${child}-${Date.now() / Math.floor(Math.random() * 100000)
          }`;
        let child_ = getNIP21FromURL(child.toString());
        if (child_.startsWith("nostr:")) {
          try {
            if (
              (child_.includes("nostr:") ||
                child_.includes("naddr") ||
                child_.includes("nprofile") ||
                child_.includes("npub") ||
                child_.includes("nevent")) &&
              child_.length > 30
            ) {
              const nip19add = child_
                .replace("nostr:", "")
                .replace("@", "")
                .replace(".", "")
                .replace(",", "");

              res.push(
                <>
                  <Nip19Parsing addr={nip19add} key={key} />{" "}
                </>,
              );
            }
          } catch (err) {
            res.push(
              <span
                dir="auto"
                key={key}
                style={{
                  wordBreak: "break-word",
                }}
              >
                {child_.split("nostr:")[1]}{" "}
              </span>,
            );
          }
        }
        if (!child_.startsWith("nostr:")) {
          const lines = child_.split("\n");
          res.push(
            <span>
              {lines.map((line, index) => (
                <React.Fragment key={index}>
                  <span
                    dir="auto"
                    key={key}
                    style={{
                      wordBreak: "break-word",
                    }}
                  >
                    {line}{" "}
                  </span>
                  {index < lines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>,
          );
        }
      }
    }
    if (typeof children[i] !== "string") {
      let key = `${i}-${Date.now()}`;
      if (children[i].type === "a") {
        const checkURL = isImageUrl(children[i].props?.href);
        if (checkURL) {
          if (checkURL.type === "image") {
            res.push(
              <img
                className="sc-s-18"
                style={{ margin: "1rem auto" }}
                width={"100%"}
                src={toSecureMediaUrl(children[i].props?.href)}
                alt="el"
                loading="lazy"
                key={key}
              />,
            );
          }
          if (checkURL.type === "video") {
            res.push(
              <VideoLoader
                key={key}
                src={toSecureMediaUrl(children[i].props?.href)}
              />,
            );
          }
        }
        if (!checkURL) {
          res.push(
            <a
              key={key}
              style={{
                wordBreak: "break-word",
                color: "var(--orange-main)",
              }}
              href={children[i].props?.href}
              target="_blank"
              className="btn-text-gray"
              onClick={(e) => e.stopPropagation()}
              dir="auto"
            >
              {children[i].props?.children?.length > 0
                ? children[i].props?.children[0]
                : children[i].props?.children}
            </a>,
          );
        }
      } else
        res.push(
          <span
            dir="auto"
            key={key}
            style={{
              wordBreak: "break-word",
            }}
          >
            {children[i]}{" "}
          </span>,
        );
    }
  }
  return <div className="fit-container">{mergeConsecutivePElements(res)}</div>;
}

export { getNip22Refs } from "@/Helpers/Threads";

export const isPremiumNoteAccessible = (pubkey) => {
  try {
    const state = store.getState();
    if (state.userKeys?.pub === pubkey) return true;
    const { subscriptions } = state.creatorsSubscriptions || {};
    if (!subscriptions || subscriptions.length === 0) return false;
    return subscriptions.some((_) => {
      if (_.creator_pubkey !== pubkey) return false;
      const displayStatus = _.display_status || _.status;
      if (displayStatus) return ["active", "canceling"].includes(displayStatus);
      return Boolean(_.active);
    });
  } catch (err) {
    return false;
  }
};

export const isLockedPremiumEvent = (event) => {
  if (!event?.tags) return false;
  const isPremium = event.tags.some((tag) => tag[0] === "nip63");
  if (!isPremium) return false;
  return !isPremiumNoteAccessible(event.pubkey);
};

export function getParsedNote(
  event,
  isCollapsedNote = false,
  parseContent = true,
) {
  try {
    if (!event) return;

    let expiration, isQuote, isPremium, checkForLabel, isComment, isNotRoot, isReply, isProtected, nip22Root, emojiMap;
    for (let tag of event.tags) {
      if (!expiration && tag[0] === "expiration") expiration = tag;
      if (!isQuote && tag[0] === "q") isQuote = tag;
      if (!isPremium && tag[0] === "nip63") isPremium = tag;
      if (!checkForLabel && tag[0] === "l") checkForLabel = tag;
      if (!isComment && tag.length > 0 && tag[3] === "root") isComment = tag;
      if (!isNotRoot && tag.length > 3 && tag[3] === "root") isNotRoot = tag;
      if (!isReply && tag.length > 3 && tag[3] === "reply") isReply = tag;
      if (!isProtected && tag[0] === "-") isProtected = tag;
      if (tag[0] === "emoji" && tag[1] && tag[2]) {
        if (!emojiMap) emojiMap = {};
        emojiMap[tag[1]] = tag[2];
      }
      if (!nip22Root && ["A", "E", "I"].includes(tag[0]) && tag[1]) nip22Root = tag;
    }

    if (event.kind === 1111 && nip22Root) {
      const refs = getNip22Refs(event);
      if (refs) {
        isNotRoot = [refs.rootType, refs.rootValue];
        isReply = refs.isTopLevel ? undefined : ["e", refs.parentValue];
        if (!isComment) isComment = isReply || isNotRoot;
      }
    }

    let isExpired = expiration && parseInt(expiration[1]) < Date.now() / 1000;
    if (isExpired) return;
    let isNoteLong = event.content.split(" ").length > 150;
    let isCollapsedNoteEnabled = getCustomSettings().collapsedNote;
    isCollapsedNoteEnabled =
      isCollapsedNoteEnabled === undefined ? true : isCollapsedNoteEnabled;
    let isCollapsedNote_ =
      isCollapsedNoteEnabled && isCollapsedNote && isNoteLong;
    let isPaidNote = false;
    if (isPremium && !isPremiumNoteAccessible(event.pubkey)) return false;
    if (checkForLabel && ["UNCENSORED NOTE"].includes(checkForLabel[1]))
      return false;
    if (checkForLabel && ["FLASH NEWS"].includes(checkForLabel[1])) {
      isPaidNote = true;
    }

    let nEvent = event?.encode ? event.encode() : nEventEncode(event.id);

    let rawEvent = (event?.rawEvent && event.rawEvent()) || { ...event };
    if (event.kind === 1 || event.kind === 1111) {
      let note_tree = parseContent
        ? getNoteTree(
          event.content,
          undefined,
          isCollapsedNote_,
          undefined,
          event.pubkey,
          false,
          `slider-${event.id}`,
          emojiMap,
        )
        : event.content;

      return {
        ...rawEvent,
        note_tree,
        isQuote: isQuote ? isQuote[1] : "",
        isComment: isReply ? isReply[1] : isComment ? isComment[1] : false,
        isRoot: !isNotRoot ? true : false,
        rootData: isNotRoot,
        isReply: isReply ? true : false,
        isPaidNote,
        isCollapsedNote: isCollapsedNote_,
        nEvent,
        isProtected,
        isPremium
      };
    }

    if (event.kind === 6) {
      if (!event.content) return;
      let relatedEvent = getParsedNote(JSON.parse(event.content), true);
      if (!relatedEvent) return false;
      return {
        ...rawEvent,
        relatedEvent,
      };
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function compactContent(note, pubkey) {
  if (!note) return "";
  let content = note
    .trim()
    .split(/(\n)/)
    .flatMap((segment) => (segment === "\n" ? "\n" : segment.split(/\s+/)))
    .filter(Boolean);
  let compactedContent = [];
  let index = 0;
  for (let word of content) {
    let replacedNostrPrefix = word
      .trim()
      .replaceAll("nostr:", "")
      .replaceAll("@", "");
    if (
      word.startsWith("data:image") ||
      /^ipfs:\/\//i.test(word) ||
      /(https?:\/\/[^ ]*\.(?:gif|png|jpg|jpeg|webp))/i.test(word)
    )
      compactedContent.push(
        <IMGElement src={toSecureMediaUrl(word)} key={index} />,
      );
    else if (word === "\n") {
      compactedContent.push(<br key={index} />);
    } else {
      const parts = replacedNostrPrefix.split(/([@.,?!\s:()’"'])/);

      const finalOutput = parts.map((part, index) => {
        if (
          part?.startsWith("npub1") ||
          part?.startsWith("nprofile1") ||
          part?.startsWith("nevent") ||
          part?.startsWith("naddr") ||
          part?.startsWith("note1")
        ) {
          const cleanedPart = part.replace(/[@.,?!]/g, "");

          return (
            <Fragment key={index}>
              <Nip19Parsing addr={cleanedPart} minimal={true} />
            </Fragment>
          );
        }

        return part;
      });
      compactedContent.push(<Fragment key={index}>{finalOutput} </Fragment>);
    }
    index++;
  }
  return mergeConsecutivePElements(compactedContent, pubkey);
}

export const DEFAULT_IPFS_GATEWAYS = [
  "https://ipfs.io",
  "https://w3s.link",
  "https://4everland.io",
];

export function parseIpfsUri(url) {
  if (typeof url !== "string") return null;
  let match = /^ipfs:\/\/(?:ipfs\/)?([^?#]+)/i.exec(url.trim());
  return match ? match[1] : null;
}

export function getIpfsGateways() {
  let settings = getCustomSettings();
  return Array.isArray(settings.ipfsGateways) && settings.ipfsGateways.length
    ? settings.ipfsGateways
    : DEFAULT_IPFS_GATEWAYS;
}

export function resolveIpfsUri(url, gatewayIndex = 0) {
  let cidPath = parseIpfsUri(url);
  if (!cidPath) return url;
  let gateways = getIpfsGateways();
  let gateway = gateways[Math.min(gatewayIndex, gateways.length - 1)];
  return `${gateway.replace(/\/+$/, "")}/ipfs/${cidPath}`;
}

export function toSecureMediaUrl(url) {
  if (typeof url !== "string") return url;
  if (/^ipfs:\/\//i.test(url)) return resolveIpfsUri(url);
  if (!/^http:\/\//i.test(url)) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
      return url;
    parsed.protocol = "https:";
    return parsed.toString();
  } catch (err) {
    return url.replace(/^http:\/\//i, "https://");
  }
}

export function isImageUrl(url) {
  try {
    if (/^data:image/.test(url)) return { type: "image" };
    if (/^data:video/.test(url)) return { type: "video" };
    if (/^ipfs:\/\//i.test(url)) {
      let cidPath = parseIpfsUri(url) || "";
      if (/\.(gif|png|jpg|jpeg|webp|avif)$/i.test(cidPath))
        return { type: "image" };
      if (/\.(mp4|mov|webm|ogg|avi|qt|m3u8)$/i.test(cidPath))
        return { type: "video" };
      return false;
    }
    if (/(https?:\/\/[^ ]*\.(gif|png|jpg|jpeg|webp))/i.test(url))
      return { type: "image" };
    if (/(https?:\/\/[^ ]*\.(mp4|mov|webm|ogg|avi|qt|m3u8))/i.test(url))
      return { type: "video" };
    if (
      /(\/images\/|cdn\.|img\.|\/media\/|\/uploads\/|encrypted-tbn0\.gstatic\.com\/images|i\.insider\.com\/)/i.test(
        url,
      ) &&
      !/\.(mp4|mov|webm|ogg|avi|qt|m3u8)$/i.test(url)
    ) {
      return { type: "image" };
    }
    if (
      /([?&]format=image|[?&]type=image)/i.test(url) &&
      !/\.(mp4|mov|webm|ogg|avi|qt|m3u8)$/i.test(url)
    ) {
      return { type: "image" };
    }

    return false;
  } catch (error) {
    return false;
  }
}

export function isVid(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?|vimeo\.com\/)([^\?&]+)/;

  const match = url.match(regex);

  if (match) {
    const videoId = match[1];
    let platform = "";
    if (match[0].startsWith("https://vimeo.com")) platform = "Vimeo";
    if (match[0].includes("youtu")) platform = "YouTube";

    if (platform === "YouTube") {
      if (/^(channel\/|c\/|@|playlist\b|user\/)/.test(videoId)) return false;
      return {
        isYT: true,
        videoId: videoId.replace("shorts/", ""),
      };
    }
    if (platform === "Vimeo") {
      return {
        isYT: false,
        videoId,
      };
    }
    return false;
  }
  return false;
}
export const getKeys = () => {
  try {
    let keys = localStorage_.getItem("_nostruserkeys");
    keys = JSON.parse(keys);
    return keys;
  } catch (err) {
    return false;
  }
};

const b64uToBytesSafe = (b64u) => {
  if (!b64u) return new Uint8Array();

  const b64 = b64u
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(b64u.length / 4) * 4, "=");

  const binary = atob(b64);

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

export const getDVMMasterKey = (key) => {
  try {
    let payload = localStorage_.getItem(key);
    if (!payload) return false;
    payload = JSON.parse(payload);
    if (!payload.kr) return false;
    let rootkey = b64uToBytesSafe(payload.kr);
    const salt = new Uint8Array();
    const ksubmit_info = new TextEncoder().encode("pidgeon:v3:key:submit");
    const mbox_info = new TextEncoder().encode("pidgeon:v3:key:mailbox");
    let ksubmit = hkdf(sha256, rootkey, salt, ksubmit_info, 32);
    let mbox = hkdf(sha256, rootkey, salt, mbox_info, 32);
    return { ksubmit, mbox, mb: payload.mb, relays: payload.relays };
  } catch (err) {
    return false;
  }
};
export const setDVMMasterKey = ({ key, payload }) => {
  try {
    localStorage_.setItem(key, JSON.stringify(payload));
    let rootkey = b64uToBytesSafe(payload.kr);
    const salt = new Uint8Array();
    const ksubmit_info = new TextEncoder().encode("pidgeon:v3:key:submit");
    const mbox_info = new TextEncoder().encode("pidgeon:v3:key:mailbox");
    let ksubmit = hkdf(sha256, rootkey, salt, ksubmit_info, 32);
    let mbox = hkdf(sha256, rootkey, salt, mbox_info, 32);
    return { ksubmit, mbox, mb: payload.mb, relays: payload.relays };
  } catch (err) {
    return false;
  }
};

export const getMetadataFromCachedAccounts = (pubkey) => {
  let accounts = getConnectedAccounts();
  let account = accounts.find((account) => account.pubkey === pubkey);
  if (account) {
    let metadata = { ...account };
    delete metadata.userKeys;
    return metadata;
  }
  return false;
};

const checkForNewAddedSettings = (prevSettings) => {
  let settings = {
    pubkey: prevSettings.pubkey,
    userHoverPreview:
      prevSettings.userHoverPreview !== undefined
        ? prevSettings.userHoverPreview
        : true,
    collapsedNote:
      prevSettings.collapsedNote !== undefined
        ? prevSettings.collapsedNote
        : true,
    longPress:
      prevSettings.longPress !== undefined ? prevSettings.longPress : "notes",
    defaultReaction:
      prevSettings.defaultReaction !== undefined
        ? prevSettings.defaultReaction
        : "❤️",
    repliesView:
      prevSettings.repliesView !== undefined
        ? prevSettings.repliesView
        : "thread",
    oneTapReaction:
      prevSettings.oneTapReaction !== undefined
        ? prevSettings.oneTapReaction
        : false,
    hideMentions:
      prevSettings.hideMentions !== undefined
        ? prevSettings.hideMentions
        : true,
    currency:
      prevSettings.currency !== undefined ? prevSettings.currency : "usd",
    blurNonFollowedMedia:
      prevSettings.blurNonFollowedMedia !== undefined
        ? prevSettings.blurNonFollowedMedia
        : true,
    ipfsGateways: Array.isArray(prevSettings.ipfsGateways)
      ? prevSettings.ipfsGateways
      : DEFAULT_IPFS_GATEWAYS,
    linkPreview:
      prevSettings.linkPreview !== undefined ? prevSettings.linkPreview : true,
    reactionsSettings:
      prevSettings.reactionsSettings !== undefined
        ? prevSettings.reactionsSettings
        : [
          { reaction: "likes", status: true },
          { reaction: "replies", status: true },
          { reaction: "repost", status: true },
          { reaction: "quote", status: true },
          { reaction: "zap", status: true },
        ],
    notification:
      prevSettings.notification !== undefined
        ? prevSettings.notification
        : [
          { tab: "mentions", isHidden: false },
          { tab: "reactions", isHidden: false },
          { tab: "reposts", isHidden: false },
          { tab: "zaps", isHidden: false },
          { tab: "following", isHidden: false },
        ],
  };
  return settings;
};

export function getCustomSettings() {
  let nostkeys = getKeys();
  let customHomeSettings = localStorage_.getItem("chsettings");
  if (!nostkeys) return getDefaultSettings("");
  if (!customHomeSettings) return getDefaultSettings(nostkeys.pub);
  try {
    customHomeSettings = JSON.parse(customHomeSettings);
    let customHomeSettings_ = customHomeSettings.find(
      (settings) => settings?.pubkey === nostkeys.pub,
    );
    return customHomeSettings_
      ? checkForNewAddedSettings(customHomeSettings_)
      : getDefaultSettings(nostkeys.pub);
  } catch (err) {
    return getDefaultSettings("");
  }
}

export function getDefaultSettings(pubkey) {
  return {
    pubkey,
    userHoverPreview: true,
    collapsedNote: true,
    longPress: "notes",
    defaultReaction: "❤️",
    currency: "usd",
    repliesView: "thread",
    oneTapReaction: false,
    blurNonFollowedMedia: true,
    ipfsGateways: DEFAULT_IPFS_GATEWAYS,
    linkPreview: true,
    hideMentions: true,
    reactionsSettings: [
      { reaction: "likes", status: true },
      { reaction: "replies", status: true },
      { reaction: "repost", status: true },
      { reaction: "quote", status: true },
      { reaction: "zap", status: true },
    ],
    notification: [
      { tab: "mentions", isHidden: false },
      { tab: "reactions", isHidden: false },
      { tab: "reposts", isHidden: false },
      { tab: "zaps", isHidden: false },
      { tab: "following", isHidden: true },
    ],
  };
}

export function getMediaUploader() {
  let nostkeys = getKeys();
  let servers = localStorage_.getItem("media-uploader");
  let tempServers = MediaUploaderServer.map((s) => {
    return {
      display_name: s[0],
      value: s[1],
    };
  });
  if (!(servers && nostkeys)) return tempServers;
  try {
    servers = JSON.parse(servers);
    let servers_ = servers.find((server) => server?.pubkey === nostkeys.pub);
    servers_ = servers_ ? servers_.servers : [];
    return [
      ...tempServers,
      ...servers_.map((s) => {
        return {
          display_name: s[0],
          value: s[1],
        };
      }),
    ];
  } catch (err) {
    return tempServers;
  }
}
export function getSelectedServer() {
  let nostkeys = getKeys();
  let servers = localStorage_.getItem("media-uploader");

  if (!(servers && nostkeys)) return MediaUploaderServer[0][1];
  try {
    servers = JSON.parse(servers);
    let servers_ = servers.find((server) => server?.pubkey === nostkeys.pub);
    let selected = servers_ ? servers_.selected : MediaUploaderServer[0][1];

    return selected;
  } catch (err) {
    return MediaUploaderServer[0][1];
  }
}

export function updateMediaUploader(data, selected) {
  let userKeys = getKeys();
  let servers = localStorage_.getItem("media-uploader");
  if (!userKeys) return;
  try {
    servers = servers ? JSON.parse(servers) : [];
    let pubkey = userKeys?.pub;
    let servers_index = servers.findIndex((_) => _?.pubkey === pubkey);
    if (servers_index !== -1) {
      if (data) servers[servers_index].servers.push(data);
      servers[servers_index].selected = selected;
    }
    if (servers_index === -1) {
      servers.push({ pubkey, servers: data ? [data] : [], selected });
    }
    localStorage_.setItem("media-uploader", JSON.stringify(servers));
  } catch (err) {
    console.log(err);
    localStorage_.removeItem("media-uploader");
  }
}
export function replaceMediaUploader(data, selected) {
  let userKeys = getKeys();
  let servers = localStorage_.getItem("media-uploader");
  if (!userKeys) return;
  try {
    servers = servers ? JSON.parse(servers) : [];
    let pubkey = userKeys?.pub;
    let servers_index = servers.findIndex((_) => _?.pubkey === pubkey);
    if (servers_index !== -1) {
      if (data) servers[servers_index].servers = data;
      servers[servers_index].selected = selected;
    }
    if (servers_index === -1) {
      servers.push({ pubkey, servers: data ? [data] : [], selected });
    }
    localStorage_.setItem("media-uploader", JSON.stringify(servers));
  } catch (err) {
    console.log(err);
    localStorage_.removeItem("media-uploader");
  }
}

export function getWallets() {
  let nostkeys = getKeys();
  let wallets = localStorage_.getItem("yaki-wallets");
  if (!(wallets && nostkeys)) return [];
  try {
    wallets = JSON.parse(wallets);
    let wallets_ = wallets.find((wallet) => wallet?.pubkey === nostkeys.pub);
    return wallets_ ? wallets_.wallets : [];
  } catch (err) {
    return [];
  }
}
export function getAllWallets() {
  let wallets = localStorage_.getItem("yaki-wallets");
  if (!wallets) return [];
  try {
    wallets = JSON.parse(wallets);
    return wallets;
  } catch (err) {
    return [];
  }
}

export function getNoteDraft(eventKey) {
  let nostkeys = getKeys();
  let drafts = localStorage_.getItem("note-drafts");
  if (!(drafts && nostkeys)) return "";
  try {
    drafts = JSON.parse(drafts);
    let draft = drafts.find((draft) => draft?.pubkey === nostkeys.pub);
    return draft[eventKey] || "";
  } catch (err) {
    return "";
  }
}

export function updateNoteDraft(eventKey, data, pubkey_) {
  let userKeys = getKeys();
  let drafts = localStorage_.getItem("note-drafts");
  if (!userKeys && !pubkey_) return;
  try {
    drafts = drafts ? JSON.parse(drafts) : [];
    let pubkey = userKeys?.pub || pubkey_;
    let drafts_index = drafts.findIndex((_) => _?.pubkey === pubkey);
    if (drafts_index !== -1) {
      drafts[drafts_index][eventKey] = data;
    }
    if (drafts_index === -1) {
      drafts.push({ pubkey, [eventKey]: data });
    }
    localStorage_.setItem("note-drafts", JSON.stringify(drafts));
  } catch (err) {
    console.log(err);
    localStorage_.removeItem("note-drafts");
  }
}

export function getArticleDraft() {
  let nostkeys = getKeys();
  let drafts = localStorage_.getItem("art-drafts");
  if (!(drafts && nostkeys)) return getDefaultArtDraft("");
  try {
    drafts = JSON.parse(drafts);
    let draft = drafts.find((draft) => draft?.pubkey === nostkeys.pub);
    return draft || getDefaultArtDraft(nostkeys.pub);
  } catch (err) {
    return getDefaultArtDraft("");
  }
}
export function removeArticleDraft() {
  let nostkeys = getKeys();
  let drafts = localStorage_.getItem("art-drafts");
  if (!(drafts && nostkeys)) return;
  try {
    drafts = JSON.parse(drafts);
    let draft = drafts.filter((draft) => draft?.pubkey !== nostkeys.pub);
    localStorage_.setItem("art-drafts", JSON.stringify(draft));
  } catch (err) {
    return;
  }
}

export function updateArticleDraft(data, pubkey_) {
  let userKeys = getKeys();
  let drafts = localStorage_.getItem("art-drafts");
  if (!userKeys && !pubkey_) return;
  try {
    drafts = drafts ? JSON.parse(drafts) : [];
    let pubkey = userKeys?.pub || pubkey_;
    let draftData = {
      pubkey,
      title: data.title,
      content: data.content,
      created_at: Math.floor(Date.now() / 1000),
    };
    let drafts_index = drafts.findIndex((_) => _?.pubkey === pubkey);
    if (drafts_index !== -1) {
      drafts[drafts_index] = draftData;
    }
    if (drafts_index === -1) {
      drafts.push(draftData);
    }
    localStorage_.setItem("art-drafts", JSON.stringify(drafts));
  } catch (err) {
    console.log(err);
    localStorage_.removeItem("art-drafts");
  }
}

export function updateCustomSettings(settings, pubkey_) {
  let userKeys = getKeys();
  let customHomeSettings = localStorage_.getItem("chsettings");
  if (!userKeys && !pubkey_) return;

  try {
    customHomeSettings = customHomeSettings
      ? JSON.parse(customHomeSettings)
      : [];
    let pubkey = userKeys?.pub || pubkey_;
    let customHomeSettings_index = customHomeSettings.findIndex(
      (_) => _?.pubkey === pubkey,
    );
    if (customHomeSettings_index !== -1) {
      customHomeSettings[customHomeSettings_index] = settings;
    }
    if (customHomeSettings_index === -1) {
      customHomeSettings.push(settings);
    }
    localStorage_.setItem("chsettings", JSON.stringify(customHomeSettings));
    store.dispatch(setRefreshAppSettings(Date.now()));
  } catch (err) {
    console.log(err);
    localStorage_.removeItem("chsettings");
    store.dispatch(setRefreshAppSettings(Date.now()));
  }
}

export function getWotConfig() {
  let userKeys = getKeys();
  if (!userKeys) return getWotConfigDefault("");
  let config = localStorage_.getItem(`${userKeys.pub}-wot-config`);
  if (!config) return getWotConfigDefault();
  try {
    config = JSON.parse(config);
    let checkConfig = Object.entries(config).filter(([key, value]) => {
      if (["all", "notifications", "reactions", "dms", "score"].includes(key))
        return true;
    });
    if (checkConfig.length === 5) return config;
    else return getWotConfigDefault();
  } catch (err) {
    return getWotConfigDefault();
  }
}
export function getCustomServices() {
  let userKeys = getKeys();
  if (!userKeys) return {};
  let customServices = localStorage_.getItem(
    `custom-lang-services-${userKeys.pub}`,
  );
  if (!customServices) return {};
  try {
    customServices = JSON.parse(customServices);
    return customServices;
  } catch (err) {
    return {};
  }
}
export function updateWallets(wallets_, pubkey_) {
  let userKeys = getKeys();
  let wallets = localStorage_.getItem("yaki-wallets");
  if (!userKeys && !pubkey_) return;

  try {
    wallets = wallets ? JSON.parse(wallets) : [];
    let pubkey = pubkey_ || userKeys?.pub;
    let wallets_index = wallets.findIndex(
      (wallet) => wallet?.pubkey === pubkey,
    );
    if (wallets_index !== -1) {
      wallets[wallets_index].wallets = wallets_;
    }
    if (wallets_index === -1) {
      wallets.push({ pubkey, wallets: wallets_ });
    }
    localStorage_.setItem("yaki-wallets", JSON.stringify(wallets));
    return wallets;
  } catch (err) {
    console.log(err);
    localStorage_.removeItem("yaki-wallets");
    return [];
  }
}
export function getRepliesViewSettings() {
  try {
    let userKeys = getKeys();
    if (userKeys?.pub) {
      let isThread = localStorage_.getItem(`replies-view-${userKeys.pub}`);
      if (isThread === "thread") return true;
      return false;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}
export function setRepliesViewSettings(settings = "box") {
  try {
    let userKeys = getKeys();
    if (userKeys?.pub) {
      localStorage_.setItem(`replies-view-${userKeys.pub}`, settings);
    }
  } catch (err) {
    console.log(err);
  }
}

export function getConnectedAccounts() {
  try {
    let accounts = localStorage_.getItem("yaki-accounts") || [];
    accounts = Array.isArray(accounts) ? [] : JSON.parse(accounts);
    return accounts;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export function redirectToLogin() {
  customHistory("/login");
}

export function getPostToEdit(naddr) {
  if (!naddr) return {};
  try {
    let post =
      localStorage.getItem(naddr) || localStorage.getItem("ArticleToEdit");
    if (post) {
      post = JSON.parse(post);
      return post;
    }
    return {};
  } catch (err) {
    console.log(err);
    return {};
  }
}

export const checkMentionInContent = (note, pubkey) => {
  let matches = note.match(/\b(?:npub1|nprofile1)[0-9a-z]+\b/g);
  matches =
    matches?.map((_) => {
      try {
        if (_.startsWith("npub")) return nip19.decode(_).data;
        if (_.startsWith("nprofile")) return nip19.decode(_).data.pubkey;
      } catch (err) {
        console.log(err);
        return false;
      }
    }) || [];
  return matches?.includes(pubkey);
};

const mergeConsecutivePElements = (arr, pubkey, noBlur) => {
  const result = [];
  let currentTextElement = null;
  let currentImages = [];
  const isImage = (el) =>
    el && typeof el.type !== "string" && el.type === IMGElement;

  const isVideo = (el) =>
    el &&
    typeof el.type !== "string" &&
    (el.type === VideoLoader || el.props?.poster !== undefined);

  const isComponent = (el) =>
    el &&
    typeof el.type !== "string" &&
    el.type !== IMGElement &&
    el.type !== VideoLoader;

  const isMediaOrComponent = (el) =>
    isImage(el) || isVideo(el) || isComponent(el);

  const cleanedArray = [];
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];

    if (el.type === "br") {
      const prev = arr[i - 1];
      const next = arr[i + 1];

      if (isMediaOrComponent(prev) || isMediaOrComponent(next)) {
        continue;
      }

      if (next?.type === "br" && isMediaOrComponent(prev)) {
        continue;
      }
      if (["p", "span"].includes(next?.type) && isMediaOrComponent(prev)) {
        continue;
      }

      let trailingBrCount = 0;
      for (let j = cleanedArray.length - 1; j >= 0; j--) {
        if (cleanedArray[j].type === "br") trailingBrCount++;
        else break;
      }

      if (trailingBrCount >= 2) {
        if (["p", "span"].includes(next?.type)) {
          continue;
        } else {
          continue;
        }
      }

      cleanedArray.push(el);
    } else {
      cleanedArray.push(el);
    }
  }

  for (const element of cleanedArray) {
    if (["p", "span"].includes(element.type)) {
      if (!currentTextElement) {
        currentTextElement = { ...element };
        currentTextElement.props = {
          ...element.props,
          children: [element.props.children],
        };
      } else {
        let tempPrevChildren = currentTextElement.props.children;

        if (typeof element.props.children !== "string") {
          tempPrevChildren.push(element.props.children);
        }
        if (
          typeof tempPrevChildren[tempPrevChildren.length - 1] === "string" &&
          typeof element.props.children === "string"
        ) {
          tempPrevChildren[tempPrevChildren.length - 1] = `${tempPrevChildren[tempPrevChildren.length - 1]
            } ${element.props.children}`;
        }
        if (
          typeof tempPrevChildren[tempPrevChildren.length - 1] !== "string" &&
          typeof element.props.children === "string"
        ) {
          tempPrevChildren.push(` ${element.props.children}`);
        }

        currentTextElement = {
          ...currentTextElement,
          props: {
            ...currentTextElement.props,
            children: tempPrevChildren,
          },
        };
      }
    } else if (isImage(element)) {
      if (currentTextElement) {
        result.push(currentTextElement);
        currentTextElement = null;
      }
      currentImages.push(element);
    } else {
      if (currentTextElement) {
        result.push(currentTextElement);
        currentTextElement = null;
      }
      if (currentImages.length > 0) {
        result.push(createImageGrid(currentImages, pubkey, noBlur));
        currentImages = [];
      }
      result.push(element);
    }
  }

  if (currentTextElement) result.push(currentTextElement);
  if (currentImages.length > 0)
    result.push(createImageGrid(currentImages, pubkey, noBlur));

  return result;
};

function isRelayUrl(value) {
  try {
    const u = new URL(value);

    if (!/^wss?:$/i.test(u.protocol)) return false;

    const host = u.hostname;

    if (host === "localhost") return true;

    const ipv4 =
      /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
    if (ipv4.test(host)) return true;

    const domain = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
    if (domain.test(host)) return true;

    return false;
  } catch (e) {
    return false;
  }
}

const createImageGrid = (images, pubkey, noBlur) => {
  let images_ = images.map((image) => image.props.src);
  const key = nanoid();
  return <Gallery key={key} imgs={images_} pubkey={pubkey} noBlur={noBlur} />;
};

const getWotConfigDefault = () => {
  return {
    score: 2,
    all: false,
    notifications: false,
    reactions: false,
    dms: false,
  };
};

const getDefaultArtDraft = (pubkey) => {
  return {
    pubkey,
    content: "",
    title: "",
    created_at: Math.floor(Date.now() / 1000),
    default: true,
  };
};

export function nEventEncode(id) {
  return nip19.neventEncode({
    id,
  });
}

const getNIP21FromURL = (url) => {
  const regex = /n(event|profile|pub|addr)([^\s\W]*)/;
  const match = url.match(regex);

  if (match) {
    const extracted = match[0];
    return `nostr:${extracted}`;
  } else {
    return url;
  }
};

const WALLET_RETURN_KEY = "yaki-wallet-return";

export function setWalletReturnPath(path) {
  try {
    if (path) sessionStorage.setItem(WALLET_RETURN_KEY, path);
  } catch (err) {
    console.log(err);
  }
}

export function consumeWalletReturnPath() {
  try {
    const path = sessionStorage.getItem(WALLET_RETURN_KEY);
    if (path) sessionStorage.removeItem(WALLET_RETURN_KEY);
    return path || "";
  } catch (err) {
    return "";
  }
}

export function buildNip22Tags({
  parentId,
  parentPubkey,
  parentKind,
  parentTags = [],
  parentRelay = "",
  tagKind = "e",
}) {
  const kind = parentKind !== undefined && parentKind !== null ? String(parentKind) : "";
  const isParentComment = kind === "1111";
  let tags = [];
  let rootPubkey = parentPubkey;

  if (isParentComment) {
    let rootTag, rootKindTag, rootPubkeyTag;
    for (let tag of parentTags) {
      if (!rootTag && ["A", "E", "I"].includes(tag[0]) && tag[1]) rootTag = tag;
      if (!rootKindTag && tag[0] === "K" && tag[1]) rootKindTag = tag;
      if (!rootPubkeyTag && tag[0] === "P" && tag[1]) rootPubkeyTag = tag;
    }
    if (rootTag) {
      tags.push([rootTag[0], rootTag[1], rootTag[2] || ""]);
      if (rootTag[0] === "A") tags.push(["a", rootTag[1], rootTag[2] || ""]);
      tags.push(["K", rootKindTag ? rootKindTag[1] : ""]);
      if (rootPubkeyTag) {
        rootPubkey = rootPubkeyTag[1];
        tags.push(["P", rootPubkeyTag[1], rootPubkeyTag[2] || ""]);
      }
      tags.push(["e", parentId, parentRelay, parentPubkey]);
      tags.push(["k", "1111"]);
      tags.push(["p", parentPubkey, parentRelay]);
      return tags;
    }
  }

  if (kind === "1") {
    const refs = getThreadRefs({ kind: 1, tags: parentTags });
    if (refs?.marked && refs.root.value && refs.root.value !== parentId) {
      const threadRootType = refs.root.type === "a" ? "a" : "e";
      let threadRootKind = "1";
      let threadRootPubkey = "";
      if (threadRootType === "a") {
        const parts = String(refs.root.value).split(":");
        threadRootKind = parts[0] || "";
        threadRootPubkey = parts[1] || "";
      }
      tags.push([threadRootType.toUpperCase(), refs.root.value, parentRelay]);
      if (threadRootType === "a") tags.push(["a", refs.root.value, parentRelay]);
      tags.push(["K", threadRootKind]);
      if (threadRootPubkey) tags.push(["P", threadRootPubkey, parentRelay]);
      tags.push(["e", parentId, parentRelay, parentPubkey]);
      tags.push(["k", "1"]);
      tags.push(["p", parentPubkey, parentRelay]);
      return tags;
    }
  }

  const rootType =
    tagKind === "a" && String(parentId).split(":").length >= 3 ? "a" : "e";
  let rootKind = kind;
  if (rootType === "a") {
    const parts = String(parentId).split(":");
    if (parts.length >= 3) {
      rootKind = parts[0];
      rootPubkey = parts[1];
    }
  }

  tags.push([rootType.toUpperCase(), parentId, parentRelay]);
  if (rootType === "a") tags.push(["a", parentId, parentRelay]);
  tags.push(["K", String(rootKind || "")]);
  if (rootPubkey) tags.push(["P", rootPubkey, parentRelay]);

  if (rootType === "e") tags.push(["e", parentId, parentRelay, parentPubkey]);
  tags.push(["k", String(rootKind || "")]);
  if (rootPubkey) tags.push(["p", rootPubkey, parentRelay]);

  return tags;
}
