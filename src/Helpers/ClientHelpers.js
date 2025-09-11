import AudioLoader from "@/Components/AudioLoader";
import Gallery from "@/Components/Gallery";
import IMGElement from "@/Components/IMGElement";
import LinkPreview from "@/Components/LinkPreview";
import LNBCInvoice from "@/Components/LNBCInvoice";
import Nip19Parsing from "@/Components/Nip19Parsing";
import VideoLoader from "@/Components/VideoLoader";
import Link from "next/link";
import { Fragment } from "react";
import { localStorage_ } from "./utils";
import { nip19 } from "nostr-tools";
import React from "react";
import MediaUploaderServer from "@/Content/MediaUploaderServer";

const nostrSchemaRegex =
  /\b(naddr1|note1|nevent1|npub1|nprofile1|nsec1|nrelay1)[a-zA-Z0-9]+\b/;

export function getNoteTree(
  note,
  minimal = false,
  isCollapsedNote = false,
  wordsCount = 150,
  pubkey
) {
  if (!note) return "";

  let tree = note
    .trim()
    .split(/(\n)/)
    .flatMap((segment) => (segment === "\n" ? "\n" : segment.split(/\s+/)))
    .filter(Boolean);

  let finalTree = [];
  let maxChar = isCollapsedNote ? wordsCount : tree.length;
  for (let i = 0; i < maxChar; i++) {
    const el = tree[i];

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
      (/(https?:\/\/)/i.test(el) || el.startsWith("data:image")) &&
      !el.includes("https://yakihonne.com/smart-widget-checker?naddr=") &&
      !el.includes("https://vota.dorafactory.org/round/") &&
      !el.includes("https://vota-test.dorafactory.org/round/")
    ) {
      const isURLVid = isVid(el);
      if (!minimal) {
        if (isURLVid) {
          if (isURLVid.isYT) {
            finalTree.push(
              <iframe
                loading="lazy"
                key={key}
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  borderRadius: "var(--border-r-18)",
                }}
                src={`https://www.youtube.com/embed/${isURLVid.videoId}`}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            );
          }
          if (!isURLVid.isYT)
            finalTree.push(
              <iframe
                loading="lazy"
                key={key}
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  borderRadius: "var(--border-r-18)",
                }}
                src={`https://player.vimeo.com/video/${isURLVid.videoId}`}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            );
        }
        if (!isURLVid) {
          const checkURL = isImageUrl(el);
          if (checkURL) {
            if (checkURL.type === "image") {
              finalTree.push(<IMGElement src={el} key={key} />);
            } else if (checkURL.type === "video") {
              finalTree.push(
                <VideoLoader
                  key={key}
                  src={el}
                  poster="https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630"
                />
              );
            }
          } else if (
            el.includes(".mp3") ||
            el.includes(".ogg") ||
            el.includes(".wav")
          ) {
            finalTree.push(<AudioLoader audioSrc={el} key={key} />);
          } else if (nostrSchemaRegex.test(el)) {
            let cleanPart = el.match(nostrSchemaRegex)?.[0];
            if (cleanPart) {
              finalTree.push(
                <Fragment key={key}>
                  <Nip19Parsing addr={cleanPart} minimal={minimal} />
                </Fragment>
              );
            } else {
              finalTree.push(
                <Fragment key={key}>
                  <LinkPreview url={el} minimal={minimal} />{" "}
                </Fragment>
              );
            }
          } else {
            finalTree.push(
              <Fragment key={key}>
                <LinkPreview url={el} minimal={minimal} />{" "}
              </Fragment>
            );
          }
        }
      } else
        finalTree.push(
          <Fragment key={key}>
            <a
              style={{ wordBreak: "break-word", color: "var(--orange-main)" }}
              href={el}
              className="btn-text-gray"
              onClick={(e) => e.stopPropagation()}
            >
              {el}
            </a>{" "}
          </Fragment>
        );
    } else if (
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

      const parts = nip19add.split(/([@.,?!\s:()’"'])/);

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
        }

        return part;
      });
      finalTree.push(<Fragment key={key}>{finalOutput} </Fragment>);
    } else if (el?.startsWith("lnbc") && el.length > 30) {
      finalTree.push(<LNBCInvoice lnbc={el} key={key} />);
    } else if (el?.startsWith("#")) {
      const match = el.match(/(#+)([\w-+]+)/);

      if (match) {
        const hashes = match[1];
        const text = match[2];

        finalTree.push(
          <React.Fragment key={key}>
            {hashes.slice(1)}
            <Link
              style={{ wordBreak: "break-word", color: "var(--orange-main)" }}
              href={{
                pathname: `/search`,
                query: { tab: "notes", keyword: text },
              }}
              className="btn-text-gray"
              onClick={(e) => e.stopPropagation()}
            >
              {`${hashes.slice(-1)}${text}`}
            </Link>{" "}
          </React.Fragment>
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
          {el}{" "}
        </span>
      );
    }
  }

  return mergeConsecutivePElements(finalTree, pubkey);
}

export function getComponent(children) {
  if (!children) return <></>;
  let res = [];
  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === "string") {
      let all = children[i].toString().split(" ");
      for (let child of all) {
        let key = `${i}-${child}-${
          Date.now() / Math.floor(Math.random() * 100000)
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
                </>
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
              </span>
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
            </span>
          );
        }
      }
    }
    if (typeof children[i] !== "string") {
      let key = `${i}-${Date.now()}`;
      if (children[i].type === "a" && isImageUrlSync(children[i].props?.href)) {
        res.push(
          <img
            className="sc-s-18"
            style={{ margin: "1rem auto" }}
            width={"100%"}
            src={children[i].props?.href}
            alt="el"
            loading="lazy"
            key={key}
          />
        );
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
          </span>
        );
    }
  }
  return <div className="fit-container">{mergeConsecutivePElements(res)}</div>;
}

export function getParsedNote(event, isCollapsedNote = false) {
  try {
    let isNoteLong = event.content.split(" ").length > 150;
    let isCollapsedNoteEnabled = getCustomSettings().collapsedNote;
    isCollapsedNoteEnabled =
      isCollapsedNoteEnabled === undefined ? true : isCollapsedNoteEnabled;
    let isCollapsedNote_ =
      isCollapsedNoteEnabled && isCollapsedNote && isNoteLong;

    let isQuote = event.tags.find((tag) => tag[0] === "q");
    let checkForLabel = event.tags.find((tag) => tag[0] === "l");
    let isComment = event.tags.find(
      (tag) => tag.length > 0 && tag[3] === "root"
    );

    let isNotRoot =
      event.tags.length === 0
        ? false
        : event.tags.find((tag) => tag.length > 3 && tag[3] === "root");
    let isReply =
      event.tags.length === 0
        ? false
        : event.tags.find((tag) => tag.length > 3 && tag[3] === "reply");
    let isPaidNote = false;
    if (checkForLabel && ["UNCENSORED NOTE"].includes(checkForLabel[1]))
      return false;
    if (checkForLabel && ["FLASH NEWS"].includes(checkForLabel[1])) {
      isPaidNote = true;
    }

    let nEvent = nEventEncode(event.id);

    let rawEvent =
      typeof event.rawEvent === "function" ? event.rawEvent() : event;
    let stringifiedEvent = JSON.stringify(rawEvent);

    if (event.kind === 1) {
      let note_tree = getNoteTree(
        event.content,
        undefined,
        isCollapsedNote_,
        undefined,
        event.pubkey
      );

      return {
        ...rawEvent,
        note_tree,
        stringifiedEvent,
        isQuote: isQuote ? isQuote[1] : "",
        isComment: isReply ? isReply[1] : isComment ? isComment[1] : false,
        isRoot: !isNotRoot ? true : false,
        rootData: isNotRoot,
        isReply: isReply ? true : false,
        isPaidNote,
        isCollapsedNote: isCollapsedNote_,
        nEvent,
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
      /(https?:\/\/[^ ]*\.(?:gif|png|jpg|jpeg|webp))/i.test(word)
    )
      compactedContent.push(<IMGElement src={word} key={index} />);
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

export function isImageUrl(url) {
  try {
    if (/^data:image/.test(url)) return { type: "image" };
    if (/^data:video/.test(url)) return { type: "video" };
    if (/(https?:\/\/[^ ]*\.(gif|png|jpg|jpeg|webp))/i.test(url))
      return { type: "image" };
    if (/(https?:\/\/[^ ]*\.(mp4|mov|webm|ogg|avi))/i.test(url))
      return { type: "video" };
    if (
      /(\/images\/|cdn\.|img\.|\/media\/|\/uploads\/|encrypted-tbn0\.gstatic\.com\/images|i\.insider\.com\/)/i.test(
        url
      ) &&
      !/\.(mp4|mov|webm|ogg|avi)$/i.test(url)
    ) {
      return { type: "image" };
    }
    if (
      /([?&]format=image|[?&]type=image)/i.test(url) &&
      !/\.(mp4|mov|webm|ogg|avi)$/i.test(url)
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
      return {
        isYT: true,
        videoId,
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
export function getKeys() {
  try {
    let keys = localStorage_.getItem("_nostruserkeys");
    keys = JSON.parse(keys);
    return keys;
  } catch (err) {
    return false;
  }
}

export function getCustomSettings() {
  let nostkeys = getKeys();
  let customHomeSettings = localStorage_.getItem("chsettings");
  if (!nostkeys) return getDefaultSettings("");
  if (!customHomeSettings) return getDefaultSettings(nostkeys.pub);
  try {
    customHomeSettings = JSON.parse(customHomeSettings);
    let customHomeSettings_ = customHomeSettings.find(
      (settings) => settings?.pubkey === nostkeys.pub
    );
    return customHomeSettings_
      ? customHomeSettings_
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
    contentList: [
      { tab: "recent", isHidden: false },
      { tab: "recent_with_replies", isHidden: false },
      { tab: "trending", isHidden: false },
      { tab: "highlights", isHidden: false },
      { tab: "paid", isHidden: false },
      { tab: "widgets", isHidden: false },
    ],
    notification: [
      { tab: "mentions", isHidden: false },
      { tab: "reactions", isHidden: false },
      { tab: "reposts", isHidden: false },
      { tab: "zaps", isHidden: false },
      { tab: "following", isHidden: false },
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
      (_) => _?.pubkey === pubkey
    );
    if (customHomeSettings_index !== -1) {
      customHomeSettings[customHomeSettings_index] = settings;
    }
    if (customHomeSettings_index === -1) {
      customHomeSettings.push(settings);
    }
    localStorage_.setItem("chsettings", JSON.stringify(customHomeSettings));
  } catch (err) {
    console.log(err);
    localStorage_.removeItem("chsettings");
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
    `custom-lang-services-${userKeys.pub}`
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
      (wallet) => wallet?.pubkey === pubkey
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
    let post = localStorage.getItem(naddr);
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

const mergeConsecutivePElements = (arr, pubkey) => {
  const result = [];
  let currentTextElement = null;
  let currentImages = [];
  let tempArray = [];

  for (let i = 0; i < arr.length; i++) {
    if (
      !(
        i - 1 > 0 &&
        i + 1 < arr.length &&
        arr[i].type === "br" &&
        typeof arr[i - 1].type !== "string" &&
        arr[i - 1].props?.src &&
        typeof arr[i + 1].type !== "string" &&
        arr[i + 1].props?.src
      )
    ) {
      tempArray.push(arr[i]);
    }
  }
  tempArray = tempArray.filter((element, index, arr) => {
    if (element.type === "br") {
      const prev = arr
        .slice(0, index)
        .reverse()
        .find((el) => el.type !== "br");
      const next = arr.slice(index + 1).find((el) => el.type !== "br");

      if (
        prev?.type !== "string" &&
        prev?.props?.src &&
        next?.type !== "string" &&
        next?.props?.src
      ) {
        return false;
      }
    }

    return true;
  });

  for (const element of tempArray) {
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
          tempPrevChildren[tempPrevChildren.length - 1] = `${
            tempPrevChildren[tempPrevChildren.length - 1]
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
    } else if (
      typeof element.type !== "string" &&
      element.props?.src &&
      element.props?.poster === undefined
    ) {
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
        result.push(createImageGrid(currentImages, pubkey));
        currentImages = [];
      }
      result.push(element);
    }
  }

  if (currentTextElement) {
    result.push(currentTextElement);
  }
  if (currentImages.length > 0) {
    result.push(createImageGrid(currentImages, pubkey));
  }

  return result;
};

const createImageGrid = (images, pubkey) => {
  let images_ = images.map((image) => image.props.src);
  // Create a unique key based on the first image URL and number of images
  const key = `gallery-${images_.length}-${
    images_[0]?.substring(0, 20) || "empty"
  }`;
  return <Gallery key={key} imgs={images_} pubkey={pubkey} />;
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

const isImageUrlSync = (url) => {
  try {
    if (/(https?:\/\/[^ ]*\.(?:gif|png|jpg|jpeg|webp))/i.test(url)) return true;
    return false;
  } catch (error) {
    return false;
  }
};

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
