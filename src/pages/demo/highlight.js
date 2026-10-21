import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Highlighter } from "lucide-react";
import UserProfilePic from "@/Components/UserProfilePic";
import Date_ from "@/Components/Date_";
import Icon from "@/Components/Icon";
import LinkPreview from "@/Components/LinkPreview";
import useUserProfile from "@/Hooks/useUsersProfile";
import { getSubData } from "@/Helpers/Controlers";
import { saveUsers } from "@/Helpers/DB";
import { iconsNames } from "@/Content/IconV2URL";

const HIGHLIGHT_ID =
  "b0dd3262d82f427bfbed9204d83514e0543eda784a5e3aedb51e68180ee87e2c";
const HIGHLIGHT_RELAYS = ["wss://nos.lol", "wss://relay.primal.net"];

const SNAPSHOT = {
  id: HIGHLIGHT_ID,
  kind: 9802,
  pubkey: "46f3c7bb33cc3019049b76dc89dbb96e34c247bdda68b6ad8632682793ff8a1a",
  created_at: 1790613173,
  content:
    "The main problem with using your git hosting location is that your code is now coupled to a hosting provider. That is, if you move your git hosting to GitLab then you have to change your code! Otherwise, you’ll be fetching the old verison. This can result in you being unable to change git hosting provider because the amount of overhead in switching. So you literally end up with your code coupled to GitHub. Which sounds completely nuts, but it’s something that is pretty much defacto in the Go community.",
  tags: [
    ["comment", "Solution for it can be nostr/ngit "],
    ["i", "https://iain.rocks/blog/dont-couple-your-go-code-to-github"],
    ["r", "https://iain.rocks/blog/dont-couple-your-go-code-to-github", "source"],
    ["textquoteselector", "-", "in, and I’ll explain why.Problem", "I’ve seen this problem become su"],
  ],
};

const getTag = (event, name) => event.tags.find((tag) => tag[0] === name);

const parseHighlight = (event) => {
  const source =
    event.tags.find((tag) => tag[0] === "r" && tag[2] === "source")?.[1] ||
    event.tags.find((tag) => tag[0] === "r" && tag[2] !== "mention")?.[1] ||
    getTag(event, "i")?.[1] ||
    "";
  const quoteSelector = getTag(event, "textquoteselector");
  let domain = "";
  try {
    domain = new URL(source).hostname.replace(/^www\./, "");
  } catch {}
  return {
    ...event,
    comment: (getTag(event, "comment")?.[1] || "").trim(),
    context: getTag(event, "context")?.[1] || "",
    prefix: quoteSelector?.[2] || "",
    suffix: quoteSelector?.[3] || "",
    source,
    domain,
  };
};

const markerStyle = {
  backgroundColor: "var(--orange-side)",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
  padding: "1px 3px",
  borderRadius: "4px",
  lineHeight: 1.7,
};

function HighlightChip() {
  return (
    <div className="sticker sticker-orange-side" style={{ gap: "4px" }}>
      <Highlighter size={12} />
      Highlight
    </div>
  );
}

function ReactionsRow() {
  return (
    <div
      className="fx-scattered fit-container note-indent"
      style={{ paddingTop: "1rem" }}
    >
      <div className="fx-centered" style={{ columnGap: "18px" }}>
        {[
          [iconsNames.heart_01, 2],
          [iconsNames.chat_circle, 2],
          [iconsNames.arrow_reload_02, 2],
          ["bolt", 1],
        ].map(([name, v]) => (
          <div
            key={name}
            className="fx-centered pointer reaction-btn"
            style={{ columnGap: "4px", borderRadius: "20px", padding: "4px 8px" }}
          >
            <Icon name={name} v={v} size={20} opacity={0.4} />
            <span className="p-medium opacity-4">0</span>
          </div>
        ))}
      </div>
      <Icon
        v={2}
        name={iconsNames.chart_bar_vertical_01}
        size={20}
        opacity=".5"
      />
    </div>
  );
}

function CardShell({ event, headerExtra, subline, children }) {
  const { userProfile, isNip05Verified } = useUserProfile(event.pubkey);
  return (
    <div
      className="box-pad-v-m fit-container note-item"
      style={{ border: "unset" }}
    >
      <div className="fit-container box-pad-h-m fx-centered fx-col">
        <div className="fit-container">
          <div className="fit-container fx-centered fx-start-h fx-start-v note-card-row">
            <div className="note-card-avatar fx-centered fx-col">
              <UserProfilePic
                size={40}
                mainAccountUser={false}
                user_id={userProfile.pubkey}
                img={userProfile.picture}
                metadata={userProfile}
              />
            </div>
            <div
              className="fit-container fx-centered fx-start-h fx-start-v fx-col"
              style={{ gap: "6px" }}
            >
              <div className="fx-scattered fit-container note-card-header">
                <div className="fx-centered" style={{ gap: "8px" }}>
                  <div className="fx-centered note-card-avatar-mobile">
                    <UserProfilePic
                      size={36}
                      mainAccountUser={false}
                      user_id={userProfile.pubkey}
                      img={userProfile.picture}
                      metadata={userProfile}
                    />
                  </div>
                  <div className="fx-centered" style={{ gap: "3px" }}>
                    <p className="p-bold p-one-line" style={{ margin: 0 }}>
                      {userProfile.display_name || userProfile.name}
                    </p>
                    {isNip05Verified && <Icon name="checkmark-c1" isColored />}
                    {subline ? (
                      <p className="gray-c p-medium p-one-line" style={{ margin: 0 }}>
                        {subline}
                      </p>
                    ) : (
                      <p className="gray-c p-medium" style={{ margin: 0 }}>
                        <Date_
                          toConvert={new Date(event.created_at * 1000)}
                          time={true}
                        />
                      </p>
                    )}
                  </div>
                </div>
                <div className="fx-centered">
                  {headerExtra}
                  <Icon name="translate" opacity=".5" size={20} />
                </div>
              </div>
              <div className="fit-container" dir="auto">
                {children}
              </div>
            </div>
          </div>
          <ReactionsRow />
        </div>
      </div>
    </div>
  );
}

function SourceRow({ highlight }) {
  return (
    <a
      href={highlight.source}
      target="_blank"
      rel="noreferrer"
      className="fit-container fx-scattered sc-s-18 bg-sp box-pad-h-m box-pad-v-s pointer"
      style={{ marginTop: ".5rem" }}
    >
      <div className="fx-centered fx-start-h" style={{ gap: "8px", minWidth: 0 }}>
        <Icon name={iconsNames.globe} v={2} size={18} />
        <div style={{ minWidth: 0 }}>
          <p className="gray-c p-medium">{highlight.domain}</p>
          <p className="p-one-line">{highlight.source}</p>
        </div>
      </div>
      <Icon name={iconsNames.external_link} v={2} size={18} />
    </a>
  );
}

function VariantMarker({ highlight }) {
  return (
    <CardShell event={highlight} headerExtra={<HighlightChip />}>
      {highlight.comment && <p style={{ marginBottom: ".5rem" }}>{highlight.comment}</p>}
      <p>
        <span style={markerStyle}>{highlight.content}</span>
      </p>
      <LinkPreview url={highlight.source} />
    </CardShell>
  );
}

function VariantQuoteCard({ highlight }) {
  return (
    <CardShell event={highlight} headerExtra={<HighlightChip />}>
      {highlight.comment && <p style={{ marginBottom: ".5rem" }}>{highlight.comment}</p>}
      <div className="fit-container sc-s-18 bg-sp" style={{ overflow: "hidden" }}>
        <div
          className="fit-container box-pad-h-m box-pad-v-m fx-centered fx-col fx-start-v"
          style={{ gap: "8px" }}
        >
          <div className="fx-centered" style={{ gap: "6px" }}>
            <Highlighter size={16} color="var(--c1)" />
            <p className="c1-c p-medium">Highlighted from {highlight.domain}</p>
          </div>
          <p
            style={{
              borderLeft: "3px solid var(--c1)",
              paddingLeft: "12px",
            }}
          >
            {highlight.content}
          </p>
        </div>
        <a
          href={highlight.source}
          target="_blank"
          rel="noreferrer"
          className="fit-container fx-scattered box-pad-h-m box-pad-v-s pointer"
          style={{ borderTop: "1px solid var(--very-dim-gray)" }}
        >
          <div className="fx-centered fx-start-h" style={{ gap: "8px", minWidth: 0 }}>
            <Icon name={iconsNames.globe} v={2} size={16} />
            <p className="gray-c p-medium p-one-line">{highlight.source}</p>
          </div>
          <Icon name={iconsNames.external_link} v={2} size={16} />
        </a>
      </div>
    </CardShell>
  );
}

function VariantInContext({ highlight }) {
  return (
    <CardShell event={highlight} headerExtra={<HighlightChip />}>
      {highlight.comment && <p style={{ marginBottom: ".5rem" }}>{highlight.comment}</p>}
      <div className="fit-container sc-s-18 bg-sp box-pad-h-m box-pad-v-m">
        <p>
          {(highlight.context || highlight.prefix) && (
            <span className="gray-c">…{highlight.prefix} </span>
          )}
          <span style={markerStyle}>{highlight.content}</span>
          {highlight.suffix && <span className="gray-c"> {highlight.suffix}…</span>}
        </p>
      </div>
      <SourceRow highlight={highlight} />
    </CardShell>
  );
}

function VariantBigQuote({ highlight }) {
  return (
    <CardShell
      event={highlight}
      subline={
        <>
          highlighted from{" "}
          <a
            href={highlight.source}
            target="_blank"
            rel="noreferrer"
            className="c1-c"
          >
            {highlight.domain}
          </a>
        </>
      }
    >
      <div
        className="fit-container fx-centered fx-start-h fx-start-v"
        style={{ gap: "10px" }}
      >
        <Icon name={iconsNames.double_quotes_l} v={2} size={28} isBoldThemeColor />
        <p className="p-big" style={{ lineHeight: 1.6 }}>
          {highlight.content}
        </p>
      </div>
      {highlight.comment && (
        <div
          className="fit-container fx-centered fx-start-h sc-s-18 bg-sp box-pad-h-m box-pad-v-s"
          style={{ gap: "8px", marginTop: ".75rem" }}
        >
          <Icon name={iconsNames.chat_circle} v={2} size={18} />
          <p>{highlight.comment}</p>
        </div>
      )}
    </CardShell>
  );
}

function ReferenceNote({ highlight }) {
  return (
    <CardShell event={highlight}>
      <p>
        {highlight.comment} {highlight.content.slice(0, 180)}…
      </p>
    </CardShell>
  );
}

const VARIANTS = [
  {
    id: "a",
    title: "A · Marker",
    desc: "Closest to a note. The highlighted passage gets the marker background, the user's comment sits on top as normal text, the source uses the existing link preview card. A Highlight chip in the header tells it apart from a note.",
    Component: VariantMarker,
  },
  {
    id: "b",
    title: "B · Quote card",
    desc: "Rendered like a quote repost, as NIP-84 asks for highlights with a comment: the comment is the post, the highlight is an embedded card with an accent bar and the source link as its footer.",
    Component: VariantQuoteCard,
  },
  {
    id: "c",
    title: "C · In context",
    desc: "Uses the context / text-quote tags to show the surrounding words in gray around the marked passage, so readers see where it was cut from. Source shown as a compact row.",
    Component: VariantInContext,
  },
  {
    id: "d",
    title: "D · Pull quote",
    desc: "The strongest visual difference: the header reads “highlighted from iain.rocks” instead of a date, the passage is set larger with a quote mark, and the comment becomes a small annotation below.",
    Component: VariantBigQuote,
  },
];

export default function HighlightDemo() {
  const [event, setEvent] = useState(SNAPSHOT);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    saveUsers([SNAPSHOT.pubkey]);
    let cancelled = false;
    const fetchEvent = async () => {
      try {
        const res = await getSubData([{ ids: [HIGHLIGHT_ID] }], 3000, HIGHLIGHT_RELAYS);
        const found = res?.data?.[0];
        if (!found || cancelled) return;
        const raw = typeof found.rawEvent === "function" ? found.rawEvent() : found;
        setEvent(raw);
        setIsLive(true);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEvent();
    return () => {
      cancelled = true;
    };
  }, []);

  const highlight = parseHighlight(event);

  return (
    <>
      <Head>
        <title>Highlights design · YakiHonne</title>
      </Head>
      <div className="fit-container fx-centered fx-col fx-start-v box-pad-v" style={{ gap: "24px" }}>
        <div className="fit-container box-pad-h-m">
          <h3>Highlights (NIP-84, kind 9802)</h3>
          <p className="gray-c">
            Four proposals for showing a highlight in the feed, built from the note card and
            existing tokens only. Shown with the real event{" "}
            {isLive ? "fetched from relays" : "(saved copy, relays not reached yet)"}. Switch the
            theme in Settings to check each one.
          </p>
        </div>

        <div className="fit-container fx-centered fx-col fx-start-v" style={{ gap: "8px" }}>
          <div className="fit-container box-pad-h-m">
            <p className="p-bold">Reference · a regular note</p>
            <p className="gray-c p-medium">For comparison, how the same author and text look as a kind 1 note today.</p>
          </div>
          <ReferenceNote highlight={highlight} />
        </div>

        {VARIANTS.map(({ id, title, desc, Component }) => (
          <div key={id} className="fit-container fx-centered fx-col fx-start-v" style={{ gap: "8px" }}>
            <div className="fit-container box-pad-h-m">
              <p className="p-bold">{title}</p>
              <p className="gray-c p-medium">{desc}</p>
            </div>
            <Component highlight={highlight} />
          </div>
        ))}
      </div>
    </>
  );
}
