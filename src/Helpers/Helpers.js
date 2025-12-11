import React from "react";
import { nip19 } from "nostr-tools";
import {
  decryptEventData,
  encodeBase64URL,
  encrypt44,
  getHex,
  removeObjDuplicants,
} from "./Encryptions";
import axios from "axios";
import { relaysOnPlatform } from "@/Content/Relays";
import { getImagePlaceholder } from "@/Content/NostrPPPlaceholder";
import { store } from "@/Store/Store";
import { setToast } from "@/Store/Slides/Publishers";
import { uploadToS3 } from "./NostrPublisher";
import { customHistory } from "./History";
import MediaUploaderServer from "@/Content/MediaUploaderServer";
import { t } from "i18next";
import axiosInstance from "./HTTP_Client";
import { InitEvent } from "./Controlers";
import { localStorage_ } from "./utils";
import { supportedLanguageKeys } from "@/Content/SupportedLanguages";
import {
  getMediaUploader,
  getParsedNote,
  getSelectedServer,
  isVid,
  nEventEncode,
} from "./ClientHelpers";
import VideoWithFallback from "@/Components/VideoWithFallbacks";
import { primaryColors } from "@/Content/PrimaryColors";

const LoginToAPI = async (publicKey, userKeys) => {
  try {
    let { pubkey, password } = await getLoginsParams(publicKey, userKeys);
    if (!(pubkey && password)) return;
    const data = await axiosInstance.post("/api/v1/login", {
      password,
      pubkey,
    });
    return data.data;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getLoginsParams = async (publicKey, userKeys) => {
  try {
    let content = JSON.stringify({
      pubkey: publicKey,
      sent_at: Math.floor(new Date().getTime() / 1000),
    });

    let password = await encrypt44(
      userKeys,
      process.env.NEXT_PUBLIC_CHECKER_PUBKEY,
      content
    );

    return { password, pubkey: publicKey };
  } catch (err) {
    console.log(err);
    return { password: false, pubkey: false };
  }
};

const getAnswerFromAIRemoteAPI = async (pubkey_, input) => {
  try {
    let { password } = await getLoginsParams(pubkey_, {
      sec: process.env.NEXT_PUBLIC_CHECKER_SEC,
    });
    const res = await axios.post(
      "https://yakiai.yakihonne.com/api/v1/ai",
      {
        input,
      },
      {
        headers: {
          Authorization: password,
        },
      }
    );
    const data = res.data;
    return data;
  } catch (err) {
    throw Error(err);
  }
};

const getLinkFromAddr = (addr_) => {
  try {
    if (!addr_ || typeof addr_ !== 'string') return null;
    let addr = addr_
      .replaceAll("nostr:", "")
      .replaceAll(",", "")
      .replaceAll(":", "")
      .replaceAll(";", "")
      .replaceAll(".", "");
    if (addr.startsWith("naddr")) {
      let data = nip19.decode(addr);
      if (!data.data.identifier) return `/video/${addr}`;
      if (data.data.kind === 30023) return `/article/${addr}`;
      if ([30004, 30005].includes(data.data.kind)) return `/curation/${addr}`;
      if ([34236, 34235].includes(data.data.kind)) return `/video/${addr}`;
      if (data.data.kind === 30033) return `/smart-widget/${addr}`;
    }
    if (addr.startsWith("nprofile")) {
      return `/profile/${addr}`;
    }
    if (addr.startsWith("npub")) {
      let hex = getHex(addr.replace(",", "").replace(".", ""));
      return `/profile/${nip19.nprofileEncode({ pubkey: hex })}`;
    }
    if (addr.startsWith("nevent")) {
      return `/note/${addr}`;
    }
    if (addr.startsWith("note")) {
      return `/note/${addr}`;
    }

    return addr;
  } catch (err) {
    console.log(err);
    return addr_;
  }
};

const getLinkPreview = async (url) => {
  try {
    const metadata = await Promise.race([
      axiosInstance.get(
        "https://api.yakihonne.com/link-preview?url=" + encodeURIComponent(url)
      ),
      sleepTimer(5000),
    ]);
    if (metadata)
      return {
        ...metadata.data,
        imagePP: getImagePlaceholder(),
        domain: url.split("/")[2],
      };
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const nip05Cache = new Map();
const CACHE_EXPIRY = 60 * 60 * 1000;

const getAuthPubkeyFromNip05 = async (nip05Addr) => {
  try {
    const cacheKey = nip05Addr.toLowerCase();
    const cached = nip05Cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.pubkey;
    }

    let addressParts = nip05Addr.split("@");
    if (addressParts.length === 1) {
      addressParts.unshift("_");
    }
    const data = await axios.get(
      `https://${addressParts[1]}/.well-known/nostr.json?name=${addressParts[0]}`
    );

    let pubkey = data.data?.names ? data.data.names[addressParts[0]] : false;

    if (pubkey) {
      pubkey = pubkey.startsWith("npub") ? nip19.decode(pubkey).data : pubkey;
    }
    nip05Cache.set(cacheKey, {
      pubkey,
      timestamp: Date.now(),
    });

    return pubkey;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const getAIFeedContent = (news) => {
  let tags = news.tags;
  let is_authentic = false;
  let key_to_dec = "";
  let l = "";
  let L = "";
  let published_at = "";
  let description = "";
  let image = "";
  let source_url = "";
  let source_domain = "";
  let source_name = "";
  let source_icon = "";

  for (let tag of tags) {
    if (tag[0] === "yaki_ai_feed") key_to_dec = tag[1];
    if (tag[0] === "l") l = tag[1];
    if (tag[0] === "L") L = tag[1];
    if (tag[0] === "published_at") published_at = tag[1];
    if (tag[0] === "description") description = tag[1];
    if (tag[0] === "image") image = tag[1];
    if (tag[0] === "source_url") source_url = tag[1];
    if (tag[0] === "source_domain") source_domain = tag[1];
    if (tag[0] === "source_name") source_name = tag[1];
    if (tag[0] === "source_icon") source_icon = tag[1];
  }
  try {
    is_authentic = key_to_dec
      ? decryptEventData(key_to_dec, `${news.created_at}`).status
      : false;
  } catch (err) {
    console.log(err);
  }

  return {
    id: news.id,
    pubkey: news.pubkey,
    title: news.content,
    created_at: published_at ? news.created_at : parseInt(published_at),
    kind: L,
    l,
    published_at,
    description,
    image: image || getImagePlaceholder(),
    source_url,
    source_domain,
    source_name,
    source_icon,
    is_authentic,
    nEvent: nip19.neventEncode({
      id: news.id,
      relays: relaysOnPlatform,
      author: news.pubkey,
    }),
  };
};

const getFlashnewsContent = (news) => {
  let tags = news.tags;
  let keywords = [];
  let is_important = false;
  let is_authentic = false;
  let source = "";
  let key_to_dec = "";
  let l = "";

  for (let tag of tags) {
    if (tag[0] === "t") keywords.push(tag[1]);
    if (tag[0] === "l") l = tag[1];
    if (tag[0] === "important") is_important = true;
    if (tag[0] === "source") source = tag[1];
    if (tag[0] === "yaki_flash_news") key_to_dec = tag[1];
  }
  try {
    is_authentic = key_to_dec
      ? decryptEventData(key_to_dec, `${news.created_at}`).status
      : false;
  } catch (err) {
    console.log(err);
  }

  let content = getNoteTree(
    news.content,
    undefined,
    undefined,
    undefined,
    news.pubkey
  );
  return {
    id: news.id,
    content: content,
    raw_content: news.content,
    created_at: news.created_at,
    pubkey: news.pubkey,
    keywords,
    source,
    is_important,
    is_authentic,
    l,
    nEvent: nip19.neventEncode({
      id: news.id,
      relays: relaysOnPlatform,
      author: news.pubkey,
    }),
  };
};

const getVideoContent = (video) => {
  if (!video) return false;
  let tags = video.tags;
  let keywords = [];
  let published_at = video.created_at;
  let title = video.content || "";
  let url = "";
  let d = "";
  let image = "";
  let imeta_url = "";
  let imeta_image = "";
  let fallbacks = [];
  let duration = 0;

  for (let tag of tags) {
    if (tag[0] === "t") keywords.push(tag[1]);
    if (tag[0] === "published_at" && tag[1]) published_at = parseInt(tag[1]);
    if (tag[0] === "duration" && tag[1]) duration = parseInt(tag[1]);
    if (tag[0] === "d") d = tag[1];
    if (tag[0] === "url") url = tag[1];
    if (tag[0] === "r") url = tag[1];
    if (tag[0] === "imeta") {
      imeta_url = tag.find((_) => _.includes("url"));
      fallbacks = tag
        .filter((_) => _.includes("fallback"))
        .map((_) => _.replace("fallback", "").trim());
    }
    if (tag[0] === "imeta") imeta_image = tag.find((_) => _.includes("image"));
    if (tag[0] === "title") title = tag[1];
    if ((tag[0] === "thumb" || tag[0] === "image") && tag[1]) image = tag[1];
  }

  if (imeta_url) url = imeta_url.split(" ")[1];
  if (imeta_image) image = imeta_image.split(" ")[1];

  return {
    id: video.id,
    kind: video.kind,
    d,
    content: video.content,
    created_at: video.created_at,
    published_at,
    pubkey: video.pubkey,
    keywords,
    duration: formatMinutesToMMSS(duration),
    tags: video.tags,
    minutes: duration,
    url,
    title,
    image,
    naddr: d
      ? nip19.naddrEncode({
          pubkey: video.pubkey,
          kind: video.kind,
          identifier: d,
        })
      : nip19.neventEncode({
          id: video.id,
          pubkey: video.pubkey,
        }),
    aTag: d ? `${video.kind}:${video.pubkey}:${d}` : video.id,
    fallbacks,
  };
};

const getVideoFromURL = (url, fallbacks = []) => {
  const isURLVid = isVid(url);

  if (isURLVid) {
    if (isURLVid.isYT) {
      return (
        <iframe
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
      return (
        <iframe
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
  if (!isURLVid && fallbacks.length === 0) {
    return (
      <video
        controls={true}
        autoPlay={false}
        name="media"
        width={"100%"}
        className="sc-s-18"
        style={{ border: "none", aspectRatio: "16/9" }}
      >
        <source src={url} type="video/mp4" />
      </video>
    );
  }
  if (!isURLVid && fallbacks.length > 0) {
    return (
      <VideoWithFallback
        sources={[url, ...fallbacks]}
        controls={true}
        autoPlay={false}
        name="media"
        width={"100%"}
        className="sc-s-18"
        style={{ border: "none", aspectRatio: "16/9" }}
      />
    );
  }
};

const shuffleArray = (array) => {
  let tempArray = Array.from(array);
  for (let i = tempArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = tempArray[i];
    tempArray[i] = tempArray[j];
    tempArray[j] = temp;
  }
  return tempArray;
};

const formatMinutesToMMSS = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const remainingSecondsAfterHours = seconds % 3600;
  const minutes = Math.floor(remainingSecondsAfterHours / 60);
  const remainingSeconds = remainingSecondsAfterHours % 60;

  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = remainingSeconds.toString().padStart(2, "0");

  if (hours > 0) {
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  } else {
    return `${paddedMinutes}:${paddedSeconds}`;
  }
};

const levelCount = (nextLevel) => {
  if (nextLevel === 1) return 0;
  else return levelCount(nextLevel - 1) + (nextLevel - 1) * 50;
};

const getCurrentLevel = (points) => {
  return Math.floor((1 + Math.sqrt(1 + (8 * points) / 50)) / 2);
};

const validateWidgetValues = (value, kind, type) => {
  if (kind === "url" && (type === "regular" || !type)) {
    let regex =
      /((https?:www\.)|(https?:\/\/)|(www\.))[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9]{1,6}(\/[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)?/;
    return regex.test(value);
  }
  if (kind === "url" && type === "zap") {
    let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return (
      regex.test(value) ||
      (value.startsWith("lnurl") && value.length > 32) ||
      (value.startsWith("lnbc") && value.length > 32)
    );
  }
  if (kind === "url" && type === "nostr") {
    let regex = /^(npub|note|nprofile|nevent|naddr)/;
    return regex.test(value);
  }
  if (kind === "url" && type === "youtube") {
    let regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([\w-]{11,})/;
    return regex.test(value);
  }
  if (kind === "url" && type === "telegram") {
    let regex = /(?:https?:\/\/)?(?:www\.)?(?:t\.me\/|telegram\.me\/)([\w-]+)/;
    return regex.test(value);
  }
  if (kind === "url" && type === "discord") {
    let regex =
      /(https?:\/\/)?(www\.)?(discord\.(gg|com)\/(invite\/)?([a-zA-Z0-9]{1,16})|discord\.com\/channels\/(@me|[0-9]{17,19})\/[0-9]{17,19})/g;
    return regex.test(value);
  }
  if (kind === "url" && type === "x") {
    let regex = /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\/[a-zA-Z0-9_]+$/;
    return regex.test(value);
  }
  if (kind === "aspect_ratio") {
    return ["1:1", "16:9"].includes(value);
  }
  if (kind === "content") {
    return typeof value === "string";
  }
  if (kind.includes("color")) {
    let regex = /^#[0-9a-fA-F]{6}/;

    if (value === "") return true;
    return regex.test(value);
  }
  if (kind === "weight") {
    if (value === "") return true;
    return ["regular", "bold"].includes(value);
  }
  if (kind === "size") {
    return ["h1", "h2", "regular", "small"].includes(value);
  }
  if (kind === "pubkey") {
    return true;
  }
  if (kind === "type") {
    return [
      "regular",
      "zap",
      "nostr",
      "youtube",
      "telegram",
      "discord",
      "x",
    ].includes(value);
  }
  if (kind === "layout") {
    return [1, 2, "1", "2"].includes(value);
  }
  if (kind === "division") {
    return ["1:1", "1:2", "2:1"].includes(value);
  }
  if (kind === "poll-content") {
    try {
      let parsed = JSON.parse(value);
      let checkKeys = Object.keys(parsed).find(
        (key) =>
          !["created_at", "content", "pubkey", "sig", "id", "tags"].includes(
            key
          )
      );
      if (parsed.kind === 6969 && !checkKeys) return true;
      return false;
    } catch (err) {
      return false;
    }
  }
  return false;
};

const getAppLang = () => {
  let browserLanguage = navigator.languages
    ? navigator.languages[0]
    : navigator.language || "en";
  browserLanguage = browserLanguage.split("-")[0];

  let userLang = localStorage_.getItem("app-lang");
  let lang = userLang || browserLanguage;
  if (supportedLanguageKeys.includes(lang)) return lang;
  return "en";
};

const getContentTranslationConfig = () => {
  let defaultService = {
    service: "lt",
    plan: false,
    selected: true,
    freeApikey: "",
    proApikey: "",
  };
  try {
    let config = localStorage_.getItem("content-lang-config");
    if (config) {
      config = JSON.parse(config);
      let selectedService = config.find((_) => _.selected);
      return selectedService || defaultService;
    } else {
      return defaultService;
    }
  } catch (err) {
    return defaultService;
  }
};

const isNoteMuted = (event, userMutedList) => {
  if (event.kind !== 1) return false;
  let parsedNote = getParsedNote(event, undefined, false);
  const isMutedId = userMutedList.includes(parsedNote.id);
  const isMutedComment = userMutedList.includes(parsedNote?.isComment);
  const isMutedRoot = userMutedList.includes(
    parsedNote.rootData ? parsedNote.rootData[1] : false
  );
  return isMutedId || isMutedComment || isMutedRoot;
};

const updateContentTranslationConfig = (
  service,
  plan,
  freeApikey,
  proApikey
) => {
  try {
    let config = localStorage_.getItem("content-lang-config");
    let newService = {
      service,
      plan: service === "nw" ? true : plan || false,
      freeApikey: freeApikey || "",
      proApikey: proApikey || "",
      selected: true,
    };
    if (config) {
      config = JSON.parse(config) || [];

      let selectedService = config.findIndex((_) => _.service === service);
      config = config.map((_) => {
        return {
          ..._,
          selected: false,
        };
      });

      if (selectedService !== -1) {
        config[selectedService] = {
          service,
          plan: plan !== undefined ? plan : config[selectedService].plan,
          freeApikey: freeApikey || config[selectedService].freeApikey,
          proApikey: proApikey || config[selectedService].proApikey,
          selected: true,
        };
      } else {
        config.push(newService);
      }
    } else {
      config = [newService];
    }
    localStorage_.setItem("content-lang-config", JSON.stringify(config));
  } catch (err) {
    console.log(err);
  }
};

const handleAppDirection = (toChangeLang) => {
  const rtlLanguages = ["ar", "he", "fa", "ur"];
  let langToChange = toChangeLang || getAppLang();
  let docDir = document.documentElement.dir;

  if (
    (!docDir && !rtlLanguages.includes(langToChange)) ||
    (docDir === "ltr" && !rtlLanguages.includes(langToChange))
  )
    return;
  if (rtlLanguages.includes(langToChange)) document.documentElement.dir = "rtl";
  if (!rtlLanguages.includes(langToChange))
    document.documentElement.dir = "ltr";
};

const toggleColorScheme = (theme) => {
  const stylesheets = document.styleSheets;
  for (const sheet of stylesheets) {
    try {
      const rules = sheet?.cssRules || sheet?.rules;
      if (rules) {
        for (const rule of rules) {
          if (
            rule.media &&
            rule.media.mediaText.includes("prefers-color-scheme")
          ) {
            const newMediaText = !theme
              ? "(prefers-color-scheme: dark)"
              : "(prefers-color-scheme: light)";

            rule.media.mediaText = newMediaText;
          }
        }
      }
    } catch (err) {}
  }
};

const getCAEATooltip = (published_at, created_at) => {
  return `CA ${new Date(published_at * 1000).toISOString().split("T")[0]}, EA ${
    new Date(created_at * 1000).toISOString().split("T")[0]
  }`;
};

const FileUpload = async (file, userKeys, cb) => {
  let service = ["1", "2"].includes(
    localStorage_.getItem(`${userKeys.pub}_media_service`)
  )
    ? localStorage_.getItem(`${userKeys.pub}_media_service`)
    : "1";

  let result = "";
  if (service === "1")
    result = await regularServerFileUpload(file, userKeys, cb);

  if (service === "2")
    result = await blossomServerFileUpload(file, userKeys, cb);
  return result;
};

const blossomServerFileUpload = async (file, userKeys, cb) => {
  let mirror = localStorage_.getItem(`${userKeys.pub}_mirror_blossom_servers`);
  let servers = store.getState().userBlossomServers;
  let serverURL =
    servers.length > 0 ? `${servers[0]}` : "https://blossom.yakihonne.com";
  let endpoint = serverURL + "/upload";

  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], {
    type: file.type || "application/octet-stream",
  });
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const localSha256 = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  let x = localSha256;
  let expiration = `${Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7}`;
  let event = {
    kind: 24242,
    content: "Image upload",
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["t", "upload"],
      ["x", x],
      ["expiration", expiration],
      ["u", serverURL],
    ],
  };
  event = await InitEvent(
    event.kind,
    event.content,
    event.tags,
    event.created_at
  );
  if (!event) return;
  let encodeB64 = encodeBase64URL(JSON.stringify(event));

  try {
    let imageURL = await axios.put(endpoint, blob, {
      headers: {
        "Content-Type": blob.type,
        "Content-Length": blob.size.toString(),
        Authorization: `Nostr ${encodeB64}`,
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (cb) cb(percentCompleted);
      },
    });
    mirrorBlossomServerFileUpload(
      mirror,
      servers,
      encodeB64,
      imageURL.data.url
    );
    return imageURL.data.url;
  } catch (err) {
    console.log(err);
    store.dispatch(
      setToast({
        type: 2,
        desc: t("AOKDMRt"),
      })
    );
    return false;
  }
};

const mirrorBlossomServerFileUpload = async (
  isMirror,
  serversList,
  eventHash,
  fileUrl
) => {
  try {
    if (isMirror && serversList.length > 1) {
      serversList = serversList.filter((_, index) => index !== 0);
      let promises = await Promise.allSettled(
        serversList.map(async (server, index) => {
          let endpoint = `${server}/mirror`;
          let data = {
            url: fileUrl,
          };
          try {
            await axios.put(endpoint, data, {
              headers: {
                Authorization: `Nostr ${eventHash}`,
              },
            });
          } catch (err) {
            console.log(err);
          }
        })
      );
    }
  } catch (err) {
    console.log(err);
  }
};

async function downloadBlobAsArrayBuffer(fileUrl) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error("Failed to download the file.");
    }
    const arrayBuffer = await response.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const remoteSha256 = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return remoteSha256;
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
}
const regularServerFileUpload = async (file, userKeys, cb) => {
  let servers = getMediaUploader();
  let selected = getSelectedServer();
  const nip96Endpoints = servers.find((_) => _.value === selected);
  let endpoint = nip96Endpoints ? selected : MediaUploaderServer[0][1];

  if (endpoint === "yakihonne") {
    let imageURL = await uploadToS3(file, userKeys.pub);
    if (imageURL) return imageURL;
    if (!imageURL) {
      store.dispatch(
        setToast({
          type: 2,
          desc: t("AOKDMRt"),
        })
      );
    }

    return false;
  }
  let event = {
    kind: 27235,
    content: "",
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["u", endpoint],
      ["method", "POST"],
    ],
  };
  event = await InitEvent(
    event.kind,
    event.content,
    event.tags,
    event.created_at
  );
  if (!event) return;
  let encodeB64 = encodeBase64URL(JSON.stringify(event));
  let fd = new FormData();
  fd.append("file", file);
  try {
    let imageURL = await axios.post(endpoint, fd, {
      headers: {
        "Content-Type": "multipart/formdata",
        Authorization: `Nostr ${encodeB64}`,
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (cb) cb(percentCompleted);
      },
    });

    return imageURL.data.nip94_event.tags.find((tag) => tag[0] === "url")[1];
  } catch (err) {
    store.dispatch(
      setToast({
        type: 2,
        desc: t("AOKDMRt"),
      })
    );
    return false;
  }
};

const extractNip19 = (note) => {
  let note_ = note.split(/(\s|\n)/g);
  let tags = [];
  let processedNote = [];

  for (let word of note_) {
    if (word === "\n") {
      processedNote.push(word);
      continue;
    }
    let decoded = decodeNip19(word);
    if (decoded) {
      tags.push(decoded.tag);
      if (decoded.id.includes("30031")) tags.push(["l", "smart-widget"]);
      processedNote.push(decoded.scheme);
    } else if (word.startsWith("#")) {
      tags.push(["t", word.replaceAll("#", "")]);
      processedNote.push(word);
    } else {
      processedNote.push(word);
    }
  }
  return {
    tags: removeObjDuplicants(tags),
    content: processedNote.join(""),
  };
};

const decodeNip19 = (word) => {
  try {
    if (!word || typeof word !== 'string') return null;
    let word_ = word
      .replaceAll("@", "")
      .replaceAll("nostr:", "")
      .replaceAll(",", "")
      .replaceAll(".", "")
      .replaceAll(";", "");

    if (word_.startsWith("npub") && word_.length > 30) {
      let decoded = nip19.decode(word_);
      return {
        tag: ["p", decoded.data, "", "mention"],
        id: decoded.data,
        scheme: `nostr:${word_}`,
      };
    }
    if (word_.startsWith("nprofile") && word_.length > 30) {
      let decoded = nip19.decode(word_);
      return {
        tag: ["p", decoded.data.pubkey, "", "mention"],
        id: decoded.data.pubkey,
        scheme: `nostr:${word_}`,
      };
    }
    if (word_.startsWith("nevent") && word_.length > 30) {
      let decoded = nip19.decode(word_);
      return {
        tag: ["e", decoded.data.id, "", "mention"],
        id: decoded.data.id,
        scheme: `nostr:${word_}`,
      };
    }
    if (word_.startsWith("note") && word_.length > 30) {
      let decoded = nip19.decode(word_);
      return {
        tag: ["e", decoded.data, "", "mention"],
        id: decoded.data,
        scheme: `nostr:${word_}`,
      };
    }
    if (word_.startsWith("naddr") && word_.length > 30) {
      let decoded = nip19.decode(word_);
      return {
        tag: [
          "a",
          `${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`,
          "",
          "mention",
        ],
        id: `${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`,
        scheme: `nostr:${word_}`,
      };
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const straightUp = (scrollTo, behavior = "instant") => {
  // let el = document.querySelector(".page-container");
  // if (!el) return;
  // el.scrollTop = scrollTo || 0;
  window.scrollTo({ top: scrollTo || 0, behavior });
};

const redirectToLogin = () => {
  customHistory("/login");
};

const isHex = (str) => {
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(str) && str.length % 2 === 0;
};

const sleepTimer = async (duration = 2000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(false);
    }, duration);
  });
};

const copyText = (value, message, event) => {
  event?.stopPropagation();
  navigator.clipboard.writeText(value);
  store.dispatch(
    setToast({
      type: 1,
      desc: `${message} 👏`,
    })
  );
};

function getLevenshteinDistance(a, b) {
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const matrix = Array.from({ length: lenA + 1 }, (_, i) =>
    Array(lenB + 1).fill(0)
  );

  for (let i = 0; i <= lenA; i++) matrix[i][0] = i;
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[lenA][lenB];
}

function sortByKeyword(array, keyword) {
  return array
    .filter((_) => _.display_name || _.name)
    .sort((a, b) => {
      const aHasNip05 = a.nip05 ? 1 : 0;
      const bHasNip05 = b.nip05 ? 1 : 0;

      const nameA = a.display_name?.toLowerCase() || a.name?.toLowerCase();
      const nameB = b.display_name?.toLowerCase() || b.name?.toLowerCase();

      const aKeywordPriority = nameA
        .toLowerCase()
        .startsWith(keyword.toLowerCase())
        ? 2
        : nameA.toLowerCase().includes(keyword.toLowerCase())
        ? 1
        : 0;
      const bKeywordPriority = nameB
        .toLowerCase()
        .startsWith(keyword.toLowerCase())
        ? 2
        : nameB.toLowerCase().includes(keyword.toLowerCase())
        ? 1
        : 0;

      const scoreA = getLevenshteinDistance(nameA, keyword.toLowerCase());
      const scoreB = getLevenshteinDistance(nameB, keyword.toLowerCase());

      const aScore = 0 + aKeywordPriority + aHasNip05;
      const bScore = 0 + bKeywordPriority + bHasNip05;

      if (aScore !== bScore) return bScore - aScore;
      if (aHasNip05 !== bHasNip05) return bHasNip05 - aHasNip05;
      return scoreB - scoreA;
    });
}

const verifyEvent = (event) => {
  if (!event) {
    console.error("No event to parse");
    return false;
  }
  const { pubkey, kind, tags, content, id } = event;
  if (!(kind && tags && pubkey && id)) {
    console.error("Invalid event structure");
    return false;
  }

  if (kind !== 30033) {
    return false;
  }
  let identifier = "";
  let type = "basic";
  let icon = "";
  let image = "";
  let input = "";
  let buttons = [];

  for (let tag of tags) {
    if (tag[0] === "d") identifier = tag[1];
    if (tag[0] === "l") type = tag[1];
    if (tag[0] === "icon") icon = tag[1];
    if (tag[0] === "image") image = tag[1];
    if (tag[0] === "input") input = tag[1];
    if (tag[0] === "button") {
      let button_ = {
        label: tag[1] || "",
        type: tag[2] || "",
        url: tag[3] || "",
        type_status: ["redirect", "post", "app", "zap", "nostr"].includes(
          tag[2] || ""
        ),
        url_status: isURLValid(tag[3] || "", tag[2] || ""),
      };
      buttons.push(button_);
    }
  }
  let aTag = `${kind}:${pubkey}:${identifier}`;

  return {
    id,
    type,
    icon,
    content: content || "N/A",
    pubkey,
    kind,
    image,
    image_status: isURLValid(image, "redirect"),
    input,
    buttons,
    identifier,
    aTag,
  };
};

export const isURLValid = (url, type) => {
  let emailAddrRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!(url && type)) return false;
  if (
    (!type || ["redirect", "post", "app"].includes(type)) &&
    !(
      url.startsWith("https://") ||
      url.startsWith("http://") ||
      url.startsWith("data:image/")
    )
  )
    return false;
  if (
    type === "nostr" &&
    !(
      url.startsWith("nostr:") ||
      url.startsWith("npub") ||
      url.startsWith("nprofile") ||
      url.startsWith("note1") ||
      url.startsWith("nevent") ||
      url.startsWith("naddr")
    )
  )
    return false;
  if (
    type === "zap" &&
    !(
      emailAddrRegex.test(url) ||
      (url.startsWith("lnurl") && url.length > 32) ||
      (url.startsWith("lnbc") && url.length > 32)
    )
  )
    return false;

  return {
    status: true,
  };
};

const base64ToFile = (base64String, fileName = "image.jpg") => {
  const [prefix, data] = base64String.split(",");
  const mimeType = prefix.match(/:(.*?);/)[1] || "image/jpeg";

  const byteString = atob(data);
  const byteNumbers = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    byteNumbers[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([byteNumbers], { type: mimeType });

  const file = new File([blob], `${Date.now()}.png`, { type: mimeType });

  return file;
};

const getStorageEstimate = async () => {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      throw new Error("Storage Quota API not supported");
    }

    const estimate = await navigator.storage.estimate();
    const usedStorage = estimate.usage;

    return Math.floor(usedStorage / 1000000);
  } catch (error) {
    console.error("Error getting storage estimate:", error);
    return null;
  }
};

const makeReadableNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const assignClientTag = (tags) => {
  return [
    [
      "client",
      "Yakihonne",
      "31990:20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3:1700732875747",
    ],
    ...tags,
  ];
};

const extractRootDomain = (url) => {
  try {
    let hostname = new URL(url).hostname;
    let parts = hostname.split(".");

    if (parts.length > 2) {
      return parts[parts.length - 2];
    }
    return parts[0];
  } catch (error) {
    return url;
  }
};
const addWidgetPathToUrl = (url) => {
  try {
    const parsedUrl = new URL(url);

    const widgetPath = "/.well-known/widget.json";
    if (
      parsedUrl.pathname === widgetPath ||
      parsedUrl.pathname.endsWith(widgetPath)
    ) {
      return url;
    }

    const rootDomain = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    const newUrl = `${rootDomain}${widgetPath}`;

    return newUrl;
  } catch (err) {
    return false;
  }
};

const trimRelay = (relay) => {
  return relay.endsWith("/") ? relay.slice(0, -1) : relay;
};

const changePrimary = (color = getPrimaryColor()) => {
  document.documentElement.style.setProperty("--c1", color);
  document.documentElement.style.setProperty("--orange-main", color);
  document.documentElement.style.setProperty("--orange-side", color + "26");
  localStorage.setItem("yaki-primary-color", color);
};

const getPrimaryColor = () => {
  let primaryColor = localStorage.getItem("yaki-primary-color");
  if (!primaryColors.includes(primaryColor)) {
    primaryColor = primaryColors[0];
  }
  return primaryColor;
};

export {
  getLinkFromAddr,
  getAuthPubkeyFromNip05,
  getAIFeedContent,
  getFlashnewsContent,
  getVideoContent,
  getVideoFromURL,
  shuffleArray,
  formatMinutesToMMSS,
  LoginToAPI,
  levelCount,
  getCurrentLevel,
  validateWidgetValues,
  toggleColorScheme,
  getCAEATooltip,
  FileUpload,
  extractNip19,
  straightUp,
  redirectToLogin,
  isHex,
  sleepTimer,
  copyText,
  getAppLang,
  handleAppDirection,
  getContentTranslationConfig,
  updateContentTranslationConfig,
  sortByKeyword,
  getLinkPreview,
  verifyEvent,
  base64ToFile,
  getStorageEstimate,
  makeReadableNumber,
  assignClientTag,
  extractRootDomain,
  addWidgetPathToUrl,
  getAnswerFromAIRemoteAPI,
  trimRelay,
  isNoteMuted,
  changePrimary,
  getPrimaryColor
};
