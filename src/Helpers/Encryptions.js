import { bech32 } from "bech32";
import { Buffer } from "buffer";
import { nip04, nip19, nip44 } from "nostr-tools";
import { decode } from "light-bolt11-decoder";
import { getImagePlaceholder } from "@/Content/NostrPPPlaceholder";
import CryptoJS from "crypto-js";
import { formatMinutesToMMSS, getAppLang } from "./Helpers";
import { getKeys, isVid, nEventEncode } from "./ClientHelpers";
import axiosInstance from "./HTTP_Client";
import { store } from "@/Store/Store";
import { setToast } from "@/Store/Slides/Publishers";
import { BunkerSigner, parseBunkerInput } from "nostr-tools/nip46";
import { localStorage_ } from "./utils/clientLocalStorage";

const LNURL_REGEX =
  /^(?:http.*[&?]lightning=|lightning:)?(lnurl[0-9]{1,}[02-9ac-hj-np-z]+)/;
const LN_ADDRESS_REGEX =
  /^((?:[^<>()\[\]\\.,;:\s@"]+(?:\.[^<>()\[\]\\.,;:\s@"]+)*)|(?:".+"))@((?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const LNURLP_REGEX =
  /^lnurlp:\/\/([\w-]+\.)+[\w-]+(:\d{1,5})?(\/[\w-.\/?%&=]*)?$/;

const getBech32 = (prefix, key) => {
  if (key.startsWith("npub")) return key;
  if (prefix === "npub") return nip19.npubEncode(key);
  if (prefix === "nsec") return nip19.nsecEncode(hexToUint8Array(key));
  if (prefix === "nprofile") return nip19.nprofileEncode({ pubkey: key });

  return "";
};
export function getHex(key) {
  // return nip19.decode(key).data;
  let hex = nip19.decode(key).data;
  if (typeof hex !== "string") return bytesTohex(hex);
  return hex;
  // return secp.utils.bytesToHex(
  //   Uint8Array.from(bech32.fromWords(bech32.decode(key).words))
  // );
}

export function hexToUint8Array(hex) {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    array[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return array;
}

const bytesTohex = (arrayBuffer) => {
  const byteToHex = [];

  for (let n = 0; n <= 0xff; ++n) {
    const hexOctet = n.toString(16).padStart(2, "0");
    byteToHex.push(hexOctet);
  }
  const buff = new Uint8Array(arrayBuffer);
  const hexOctets = [];

  for (let i = 0; i < buff.length; ++i) hexOctets.push(byteToHex[buff[i]]);

  return hexOctets.join("");
};
const shortenKey = (key, length = 10) => {
  let firstHalf = key.substring(0, length);
  let secondHalf = key.substring(key.length - length, key.length);
  return `${firstHalf}....${secondHalf}`;
};
const minimizeKey = (key) => {
  if (!key) return key;
  return key.substring(key.length - 10, key.length);
};

const getEmptyEventStats = (eventID) => {
  return {
    event_id: eventID,
    likes: {
      likes: [],
      since: undefined,
    },
    reposts: {
      reposts: [],
      since: undefined,
    },
    replies: {
      replies: [],
      since: undefined,
    },
    quotes: {
      quotes: [],
      since: undefined,
    },
    zaps: {
      total: 0,
      zaps: [],
      since: undefined,
    },
  };
};
const getEmptyRelaysStats = (url) => {
  return {
    url,
    followings: {
      pubkeys: [],
      since: undefined,
    },
    monitor: {
      countryCode: "",
      countryFlag: "",
      isAuthRequired: false,
      isPaymentRequired: false,
      rttOpen: null,
      since: undefined,
    },
  };
};

const getEmptyuserMetadata = (pubkey) => {
  let backupName = "";
  if (pubkey) {
    if (pubkey.startsWith("npub") || pubkey.startsWith("nprofile"))
      backupName = pubkey.substring(0, 10);
    else {
      backupName = nip19.npubEncode(pubkey).substring(0, 10);
    }
  }
  return {
    kind: 0,
    name: backupName,
    display_name: backupName,
    picture: "",
    banner: "",
    about: "",
    lud06: "",
    lud16: "",
    nip05: "",
    website: "",
    pubkey,
    created_at: 0,
  };
};
const getuserMetadata = (data) => {
  try {
    let userAbout = JSON.parse(data.content) || {};
    let userData = {
      pubkey: data.pubkey,
      picture: userAbout?.picture || "",
      banner: userAbout?.banner || "",
      display_name:
        userAbout?.display_name ||
        userAbout?.name ||
        getBech32("npub", data.pubkey),
      name:
        userAbout?.name ||
        userAbout?.display_name ||
        getBech32("npub", data.pubkey),
      about: userAbout?.about || "",
      nip05: userAbout?.nip05 || "",
      lud06: userAbout?.lud06 || "",
      lud16: userAbout?.lud16 || "",
      website: userAbout?.website || "",
      created_at: data.created_at || Math.floor(Date.now() / 1000),
    };
    return userData;
  } catch (err) {
    console.log(err);
    return getEmptyuserMetadata(data.pubkey);
  }
};

const decodeUrlOrAddress = (lnUrlOrAddress) => {
  const bech32Url = parseLnUrl(lnUrlOrAddress);
  if (bech32Url) {
    const decoded = bech32.decode(bech32Url, 20000);
    return Buffer.from(bech32.fromWords(decoded.words)).toString();
  }

  const address = parseLightningAddress(lnUrlOrAddress);
  if (address) {
    const { username, domain } = address;
    const protocol = domain.match(/\.onion$/) ? "http" : "https";
    return `${protocol}://${domain}/.well-known/lnurlp/${username}`;
  }

  return parseLnurlp(lnUrlOrAddress);
};

const parseLnUrl = (url) => {
  if (!url) return null;
  const result = LNURL_REGEX.exec(url.toLowerCase());
  return result ? result[1] : null;
};

const parseLightningAddress = (address) => {
  if (!address) return null;
  const result = LN_ADDRESS_REGEX.exec(address);
  return result ? { username: result[1], domain: result[2] } : null;
};

const parseLnurlp = (url) => {
  if (!url) return null;

  const parsedUrl = url.toLowerCase();
  if (!LNURLP_REGEX.test(parsedUrl)) return null;

  const protocol = parsedUrl.includes(".onion") ? "http://" : "https://";
  return parsedUrl.replace("lnurlp://", protocol);
};

const encodeLud06 = (url) => {
  try {
    let words = bech32.toWords(Buffer.from(url, "utf8"));
    let newConvertedAddress = bech32.encode("lnurl", words, 2000);
    return newConvertedAddress;
  } catch {
    return "";
  }
};

const getParsedAuthor = (data) => {
  let content = {};
  try {
    content = data.content ? JSON.parse(data.content) : {};
  } catch (err) {
    console.log(err);
  }
  let tempAuthor = {
    kind: 0,
    display_name:
      content?.display_name || content?.name || data.pubkey.substring(0, 10),
    name:
      content?.name || content?.display_name || data.pubkey.substring(0, 10),
    picture: content?.picture || "",
    pubkey: data.pubkey,
    banner: content?.banner || getImagePlaceholder(),
    about: content?.about || "",
    lud06: content?.lud06 || "",
    lud16: content?.lud16 || "",
    website: content?.website || "",
    nip05: content?.nip05 || "",
  };
  return tempAuthor;
};

const getParsedSW = (event) => {
  let id = event.id;
  let title = event.content;
  let pubkey = event.pubkey;
  let image = "";
  let input = "";
  let d = "";
  let type = "basic";
  let icon = "";
  let buttons = [];
  for (let tag of event.tags) {
    if (tag[0] === "d") d = tag[1];
    if (tag[0] === "l") type = tag[1];
    if (tag[0] === "icon") icon = tag[1];
    if (tag[0] === "image") image = tag[1];
    if (tag[0] === "input") input = tag[1];
    if (tag[0] === "button")
      buttons = [...buttons, { label: tag[1], type: tag[2], url: tag[3] }];
  }

  return {
    id,
    created_at: event.created_at,
    sig: event.sig || "sig",
    pubkey,
    aTag: `30033:${event.pubkey}:${d}`,
    type,
    icon,
    tags: event.tags,
    d,
    naddr: nip19.naddrEncode({ pubkey, identifier: d, kind: event.kind }),
    kind: event.kind,
    title,
    image,
    input,
    buttons,
    components: input
      ? [
          { value: image, type: "image" },
          { value: input, type: "input" },
          { value: buttons, type: "button" },
        ]
      : [
          { value: image, type: "image" },
          { value: buttons, type: "button" },
        ],
  };
};

const getParsedRepEvent = (event) => {
  try {
    if (!event) return false;
    let imeta_url = "";
    let content = {
      id: event.id,
      pubkey: event.pubkey,
      kind: event.kind,
      content: event.content,
      created_at: event.created_at,
      tags: event.tags,
      sig: event.sig,
      author: getEmptyuserMetadata(event.pubkey),
      title: [34235, 34236, 30033, 21, 22].includes(event.kind)
        ? event.content
        : "Untitled",
      description: "",
      image: "",
      imagePP: getImagePlaceholder(),
      published_at: event.created_at,
      contentSensitive: false,
      d: "",
      client: "",
      items: [],
      tTags: [],
      zapSplit: [],
      seenOn: event.onRelays
        ? [...new Set(event.onRelays.map((relay) => relay.url))]
        : [],
      dir: detectDirection(event.content),
      vUrl: "",
      iMetaFallbacks: [],
    };
    for (let tag of event.tags) {
      if (tag[0] === "title") {
        content.title = tag[1];
      }
      if (["image", "thumbnail", "thumb"].includes(tag[0])) {
        content.image = tag[1];
      }
      if (["description", "excerpt", "summary"].includes(tag[0])) {
        content.description = tag[1];
      }
      if (tag[0] === "d") {
        content.d = encodeURIComponent(tag[1]);
      }
      if (tag[0] === "zap") {
        content.zapSplit.push(tag);
      }
      if (tag[0] === "published_at" && tag[1]) {
        content.published_at =
          parseInt(tag[1]) !== NaN ? parseInt(tag[1]) : event.created_at;
      }
      if (tag[0] === "client") {
        if (tag.length >= 3 && tag[2].includes("31990")) {
          content.client = tag[2];
        }
        if ((tag.length >= 3 && !tag[2].includes("31990")) || tag.length < 3)
          content.client = tag[1];
      }
      if (tag[0] === "L" && tag[1] === "content-warning")
        content.contentSensitive = true;
      if (
        tag[0] === "a" ||
        tag[0] === "e" ||
        tag[0] === "r" ||
        tag[0] === "t"
      ) {
        content.items.push(tag[1]);
      }
      if (tag[0] === "t") {
        content.tTags.push(tag[1]);
      }
      if (tag[0] === "url") content.vUrl = tag[1];
      if (tag[0] === "imeta") {
        imeta_url = tag.find((_) => _.includes("url"));
      }
    }
    if (imeta_url) content.vUrl = imeta_url.split(" ")[1];
    content.naddr = content.d
      ? (event.encode && event.encode()) ||
        nip19.naddrEncode({
          pubkey: event.pubkey,
          identifier: content.d,
          kind: event.kind,
        })
      : "";
    content.naddrData = {
      pubkey: event.pubkey,
      identifier: content.d,
      kind: event.kind,
    };
    content.aTag = `${event.kind}:${event.pubkey}:${content.d}`;

    if ([22, 21, 20].includes(event.kind))
      content.nEvent = event.encode
        ? event.encode()
        : nip19.neventEncode({
            pubkey: event.pubkey,
            id: event.id,
            kind: event.kind,
          });

    return content;
  } catch (err) {
    console.log(err);
    return false;
  }
};
const getParsedMedia = (event) => {
  try {
    if (!event) return false;
    let imeta_url = "";
    let imeta_img = "";
    let content = {
      id: event.id,
      pubkey: event.pubkey,
      kind: event.kind,
      content: event.content,
      created_at: event.created_at,
      tags: event.tags,
      sig: event.sig,
      title: event.content,
      description: event.content,
      image: "",
      imagePP: getImagePlaceholder(),
      published_at: event.created_at,
      contentSensitive: false,
      d: "",
      client: "",
      items: [],
      tTags: [],
      zapSplit: [],
      seenOn: event.onRelays
        ? [...new Set(event.onRelays.map((relay) => relay.url))]
        : [],
      url: "",
      iMetaFallbacks: [],
      duration: 0,
      plain: true,
    };

    for (let tag of event.tags) {
      if (tag[0] === "title") {
        content.title = tag[1];
      }
      if (["image", "thumbnail", "thumb"].includes(tag[0])) {
        content.image = tag[1];
      }
      if (["description", "excerpt", "summary"].includes(tag[0])) {
        content.description = tag[1];
      }
      if (tag[0] === "d") {
        content.d = encodeURIComponent(tag[1]);
      }
      if (tag[0] === "zap") {
        content.zapSplit.push(tag);
      }
      if (tag[0] === "published_at" && tag[1]) {
        content.published_at =
          parseInt(tag[1]) !== NaN ? parseInt(tag[1]) : event.created_at;
      }
      if (tag[0] === "client") {
        if (tag.length >= 3 && tag[2].includes("31990")) {
          content.client = tag[2];
        }
        if ((tag.length >= 3 && !tag[2].includes("31990")) || tag.length < 3)
          content.client = tag[1];
      }
      if (tag[0] === "duration" && tag[1]) {
        let duration = parseInt(tag[1]);
        content.duration = formatMinutesToMMSS(duration);
      }
      if (tag[0] === "L" && tag[1] === "content-warning")
        content.contentSensitive = true;
      if (
        tag[0] === "a" ||
        tag[0] === "e" ||
        tag[0] === "r" ||
        tag[0] === "t"
      ) {
        content.items.push(tag[1]);
      }
      if (tag[0] === "t") {
        content.tTags.push(tag[1]);
      }
      if (tag[0] === "url") content.url = tag[1];
      if (tag[0] === "imeta") {
        imeta_url = tag.find((_) => _.includes("url "));
        imeta_img = tag.find((_) => _.includes("image "));
        content.iMetaFallbacks = tag
          .filter((_) => _.includes("fallback "))
          .map((_) => _.replace("fallback ", "").trim());
      }
    }
    if (imeta_url)
      content.url = imeta_url.replace("url", "").replaceAll(" ", "");
    if (imeta_img)
      content.image = imeta_img.replace("image", "").replaceAll(" ", "");
    content.naddr = content.d
      ? (event.encode && event.encode()) ||
        nip19.naddrEncode({
          pubkey: event.pubkey,
          identifier: content.d,
          kind: event.kind,
        })
      : "";
    content.naddrData = content.d
      ? {
          pubkey: event.pubkey,
          identifier: content.d,
          kind: event.kind,
        }
      : undefined;
    content.aTag = content.d
      ? `${event.kind}:${event.pubkey}:${content.d}`
      : "";
    let isNotPlain = isVid(content.url);
    if (isNotPlain) {
      content.plain = false;
    }
    if ([22, 21, 20].includes(event.kind))
      content.nEvent = event?.encode ? event.encode() : nEventEncode(event.id);

    return content;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getParsedRelaySet = (event) => {
  if (!event) return false;
  let title = "";
  let description = "";
  let d = "";
  let image = "";
  let relays = [];
  for (let tag of event.tags) {
    if (tag[0] === "d") d = tag[1];
    if (tag[0] === "title") title = tag[1];
    if (tag[0] === "description") description = tag[1];
    if (tag[0] === "image") image = tag[1];
    if (tag[0] === "relay") relays.push(tag[1]);
  }
  if (!title) {
    let allRelays = relays
      .join(", ")
      .replaceAll("wss://", "")
      .replaceAll("ws://", "");
    title =
      allRelays.length > 20
        ? shortenKey(allRelays, 8)
        : allRelays || `Relays set (${relays.length}) relays`;
  }
  return {
    kind: event.kind,
    sig: event.sig,
    pubkey: event.pubkey,
    id: event.id,
    created_at: event.created_at,
    d,
    aTag: `${event.kind}:${event.pubkey}:${d}`,
    title,
    description,
    image,
    relays,
  };
};

const detectDirection = (text) => {
  const rtlCharRegExp =
    /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const ltrCharRegExp = /[a-zA-Z]/;

  let rtlCount = 0;
  let ltrCount = 0;

  for (const char of text) {
    if (rtlCharRegExp.test(char)) {
      rtlCount++;
    } else if (ltrCharRegExp.test(char)) {
      ltrCount++;
    }
  }

  if (rtlCount > ltrCount) {
    return "RTL";
  } else if (ltrCount > rtlCount) {
    return "LTR";
  }
  return "LTR";
};

const enableTranslation = async (text) => {
  try {
    const userLang = getAppLang();
    const userKeys = getKeys();
    let lang = await axiosInstance.post("/api/v1/translate/detect", { text });
    lang = lang.data;
    if (!userKeys) return false;
    if (lang === userLang) return false;
    return true;
  } catch (err) {
    console.log(err);
    return true;
  }
};

const decodeBolt11 = (address) => {
  let decoded = decode(address);
  let amount = decoded.sections.find((item) => item.name === "amount");
  return (amount?.value || 0) / 1000;
};

const getBolt11 = (event) => {
  if (!event) return "";
  for (let tag of event.tags) {
    if (tag[0] === "bolt11") return tag[1];
  }
  return "";
};
const getZapper = (event) => {
  if (!event) return "";
  try {
    let sats = decodeBolt11(getBolt11(event));
    for (let tag of event.tags) {
      if (tag[0] === "description") {
        let tempEvent = JSON.parse(tag[1]);
        return {
          ...tempEvent,
          amount: sats,
          message: event.content || tempEvent.content,
        };
      }
    }
    return "";
  } catch (err) {
    console.log(err);
    return "";
  }
};

const checkForLUDS = (lud06, lud16) => {
  return lud16?.includes("@")
    ? encodeLud06(decodeUrlOrAddress(lud16))
    : lud06?.includes("@")
    ? encodeLud06(decodeUrlOrAddress(lud06))
    : lud06;
};

const convertDate = (toConvert, time = false, t = null) => {
  let timeConfig = time ? { hour: "numeric", minute: "numeric" } : {};
  if (t) {
    return t("A3fEQj5", {
      val: toConvert,
      formatParams: {
        val: { year: "numeric", month: "short", day: "numeric", ...timeConfig },
      },
    });
  }
  // Fallback for when no translation function is provided
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...timeConfig,
  }).format(toConvert);
};

export function timeAgo(date, t = null) {
  const now = new Date();
  const diff = now - date;
  const diffInSeconds = Math.floor(diff / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = now.getFullYear() - date.getFullYear();

  if (t) {
    // Use translations when available
    if (diffInSeconds < 60) {
      return t("ArG9ME2");
    } else if (diffInMinutes < 60) {
      return t("AOPBXtv", {
        val: -diffInMinutes,
        style: "narrow",
        range: "minute",
      });
    } else if (diffInHours < 24) {
      return t("AOPBXtv", {
        val: -diffInHours,
        style: "narrow",
        range: "hour",
      });
    } else if (diffInDays < 7) {
      return t("AOPBXtv", { val: -diffInDays, style: "narrow", range: "day" });
    } else if (diffInWeeks < 5) {
      return t("AOPBXtv", {
        val: -diffInWeeks,
        style: "narrow",
        range: "weeks",
      });
    } else if (diffInMonths < 11 && diffInYears === 0) {
      return t("AOPBXtv", {
        val: -diffInMonths,
        style: "narrow",
        range: "month",
      });
    } else {
      return convertDate(date, false, t);
    }
  } else {
    // Fallback when no translation function is provided
    if (diffInSeconds < 60) {
      return "now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else if (diffInWeeks < 5) {
      return `${diffInWeeks}w`;
    } else if (diffInMonths < 11 && diffInYears === 0) {
      return `${diffInMonths}mo`;
    } else {
      return convertDate(date, false);
    }
  }
}

const removeRelayLastSlash = (relay) => {
  let charToRemove = "/";
  const escapedChar = charToRemove.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^[${escapedChar}]+|[${escapedChar}]+$`, "g");
  return relay.replace(regex, "");
};

const filterRelays = (list_1, list_2) => {
  let tempArray = [...list_1, ...list_2];
  return tempArray.filter((item, index, tempArray) => {
    if (tempArray.findIndex((item_1) => item_1 === item) === index) return item;
  });
};

const removeDuplicants = (list_1, list_2 = []) => {
  let tempArray = [...list_1, ...list_2];
  return tempArray.filter((item, index, tempArray) => {
    if (tempArray.findIndex((item_1) => item_1 === item) === index) return item;
  });
};
const removeDuplicatedRelays = (list_1, list_2 = []) => {
  let tempArray = removeObjDuplicants([...list_1, ...list_2]);
  return tempArray.map((_) => {
    return {
      ..._,
      url: removeRelayLastSlash(_.url),
    };
  });
};
const removeObjDuplicants = (list_1, list_2 = []) => {
  const seen = new Set();
  const result = [];
  for (const item of [...list_1, ...list_2]) {
    const str = JSON.stringify(item);
    if (!seen.has(str)) {
      seen.add(str);
      result.push(item);
    }
  }
  return result;
};
const removeEventsDuplicants = (list_1, list_2 = []) => {
  const seen = new Set();
  const result = [];
  for (const item of [...list_1, ...list_2]) {
    if (item.id && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
};
const sortEvents = (events) => {
  return events.sort((ev_1, ev_2) => ev_2.created_at - ev_1.created_at);
};

const encryptEventData = (data) => {
  let enc = CryptoJS.AES.encrypt(
    data,
    process.env.NEXT_PUBLIC_ENC_SECRET
  ).toString();
  return enc;
};
const decryptEventData = (enc, data) => {
  let dec = CryptoJS.AES.decrypt(enc, process.env.NEXT_PUBLIC_ENC_SECRET);
  return {
    dec: dec.toString(CryptoJS.enc.Utf8),
    status: dec.toString(CryptoJS.enc.Utf8) == data,
  };
};

const getClaimingData = async (pubkey, event_id, kind, t = null) => {
  try {
    let message = {
      pubkey,
      event_id,
      kind,
    };
    if (!window.nostr)
      return {
        status: false,
        message: t ? t("AI6im93") : "Nostr extension not found",
      };
    let walletPubkey = await window.nostr.getPublicKey();
    if (walletPubkey !== pubkey)
      return {
        status: false,
        message: t ? t("AZsINLj") : "Public key mismatch",
      };
    const encrypted = await window.nostr.nip04.encrypt(
      process.env.NEXT_PUBLIC_YAKI_PUBKEY,
      JSON.stringify(message)
    );
    return { status: true, message: encrypted };
  } catch (err) {
    console.log(err);
    return { status: false, message: t ? t("AXd65kJ") : "Encryption failed" };
  }
};

const decrypt04UsingBunker = async (userKeys, otherPartyPubkey, content) => {
  try {
    const bunkerPointer = await parseBunkerInput(userKeys.bunker);
    const bunker = BunkerSigner.fromBunker(
      userKeys.localKeys.sec,
      bunkerPointer,
      {
        onauth: (url) => {
          window.open(
            url,
            "_blank",
            "width=600,height=650,scrollbars=yes,resizable=yes"
          );
        },
      }
    );
    await bunker.connect();
    let data = await bunker.nip04Decrypt(otherPartyPubkey, content);
    return data;
  } catch (err) {
    console.log(err);
    return "";
  }
};

const encrypt04UsingBunker = async (userKeys, otherPartyPubkey, content) => {
  try {
    const bunkerPointer = await parseBunkerInput(userKeys.bunker);
    const bunker = BunkerSigner.fromBunker(
      userKeys.localKeys.sec,
      bunkerPointer,
      {
        onauth: (url) => {
          window.open(
            url,
            "_blank",
            "width=600,height=650,scrollbars=yes,resizable=yes"
          );
        },
      }
    );
    await bunker.connect();

    let data = await bunker.nip04Encrypt(otherPartyPubkey, content);
    return data;
  } catch (err) {
    console.log(err);
    return "";
  }
};

const encrypt44UsingBunker = async (userKeys, otherPartyPubkey, content) => {
  try {
    const bunkerPointer = await parseBunkerInput(userKeys.bunker);
    const bunker = BunkerSigner.fromBunker(
      userKeys.localKeys.sec,
      bunkerPointer,
      {
        onauth: (url) => {
          window.open(
            url,
            "_blank",
            "width=600,height=650,scrollbars=yes,resizable=yes"
          );
        },
      }
    );
    await bunker.connect();

    let data = await bunker.nip44Encrypt(otherPartyPubkey, content);
    return data;
  } catch (err) {
    console.log(err);
    return "";
  }
};

const decrypt44UsingBunker = async (userKeys, otherPartyPubkey, content) => {
  try {
    const bunkerPointer = await parseBunkerInput(userKeys.bunker);
    const bunker = BunkerSigner.fromBunker(
      userKeys.localKeys.sec,
      bunkerPointer,
      {
        onauth: (url) => {
          window.open(
            url,
            "_blank",
            "width=600,height=650,scrollbars=yes,resizable=yes"
          );
        },
      }
    );
    await bunker.connect();

    let data = await bunker.nip44Decrypt(otherPartyPubkey, content);
    return data;
  } catch (err) {
    console.log(err);
    return "";
  }
};

const encrypt44 = async (userKeys, otherPartyPubkey, content) => {
  try {
    let encryptedMessage = "";
    if (userKeys.ext) {
      encryptedMessage = await window.nostr.nip44.encrypt(
        otherPartyPubkey,
        content
      );
    } else if (userKeys.sec) {
      encryptedMessage = nip44.v2.encrypt(
        content,
        nip44.v2.utils.getConversationKey(userKeys.sec, otherPartyPubkey)
      );
    } else {
      encryptedMessage = await encrypt44UsingBunker(
        userKeys,
        otherPartyPubkey,
        content
      );
    }
    return encryptedMessage;
  } catch (err) {
    return false;
  }
};

const decrypt44 = async (userKeys, otherPartyPubkey, content) => {
  try {
    let decryptedMessage = "";
    if (userKeys.ext) {
      decryptedMessage = await window.nostr.nip44.decrypt(
        otherPartyPubkey,
        content
      );
    } else if (userKeys.sec) {
      decryptedMessage = await nip44.v2.decrypt(
        content,
        nip44.v2.utils.getConversationKey(userKeys.sec, otherPartyPubkey)
      );
    } else {
      decryptedMessage = await decrypt44UsingBunker(
        userKeys,
        otherPartyPubkey,
        content
      );
    }
    return decryptedMessage;
  } catch (err) {
    return false;
  }
};

const decrypt04 = async (event, userKeys) => {
  try {
    let pubkey =
      event.pubkey === userKeys.pub
        ? event.tags.find((tag) => tag[0] === "p")[1]
        : event.pubkey;

    let decryptedMessage = "";
    if (userKeys.ext) {
      decryptedMessage = await window.nostr.nip04.decrypt(
        pubkey,
        event.content
      );
    } else if (userKeys.sec) {
      decryptedMessage = await nip04.decrypt(
        userKeys.sec,
        pubkey,
        event.content
      );
    } else {
      decryptedMessage = await decrypt04UsingBunker(
        userKeys,
        pubkey,
        event.content
      );
    }
    return decryptedMessage;
  } catch (err) {
    return false;
  }
};

const encrypt04 = async (userKeys, otherPartyPubkey, content) => {
  try {
    let encryptedMessage = "";
    if (userKeys.ext) {
      encryptedMessage = await window.nostr.nip04.encrypt(
        otherPartyPubkey,
        content
      );
    } else if (userKeys.sec) {
      encryptedMessage = await nip04.encrypt(
        userKeys.sec,
        otherPartyPubkey,
        content
      );
    } else {
      encryptedMessage = await encrypt04UsingBunker(
        userKeys,
        otherPartyPubkey,
        content
      );
    }
    return encryptedMessage;
  } catch (err) {
    return false;
  }
};

const unwrapGiftWrap = async (event, userKeys) => {
  try {
    let decryptedEvent13 = await decrypt44(
      userKeys,
      event.pubkey,
      event.content
    );

    let { pubkey, content } = JSON.parse(decryptedEvent13);

    let decryptedEvent14 = await decrypt44(userKeys, pubkey, content);
    return JSON.parse(decryptedEvent14);
  } catch (err) {
    return false;
  }
};

const encodeBase64URL = (string) => {
  return btoa(string)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const downloadAsFile = (
  text,
  type = "application/json",
  name,
  message = false,
  allowMobile = true
) => {
  let isTouchScreen = window.matchMedia("(pointer: coarse)").matches;
  if (isTouchScreen && !allowMobile) return;

  const jsonString =
    type === "application/json" ? JSON.stringify(text, null, 2) : text;

  const blob = new Blob([jsonString], { type });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = name;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  if (message)
    store.dispatch(
      setToast({
        type: 1,
        desc: message,
      })
    );
};

const getWOTScoreForPubkeyLegacy = (pubkey, enabled, minScore = 3) => {
  try {
    if (!enabled) return { score: 10, status: true };
    const network = store.getState().userWotList;
    const followings = store.getState().userFollowings;
    const userKeys = store.getState().userKeys;

    if (userKeys.pub === pubkey) return { score: 10, status: true };
    if (followings.includes(pubkey) || network.length === 0 || !pubkey) {
      return { score: 10, status: true };
    }
    let totalTrusting = network.filter((_) =>
      _.followings.includes(pubkey)
    ).length;
    let totalMuted = network.filter((_) => _.muted.includes(pubkey)).length;
    let ratio = totalTrusting / network.length;
    let mutesPenalty = (totalMuted / network.length) * 0.5;
    let baseScore = (Math.log(1 + ratio * 100) / Math.log(11)) * 8;
    // let equalizer = totalTrusting === 0 ? 10 : 0;
    let score = Math.max(0, Math.min(8, baseScore - mutesPenalty));
    // let score =
    //   equalizer ||
    //   Math.floor(
    //     (Math.max(0, totalTrusting - totalMuted) * 10) / network.length
    //   );

    return { score, status: score >= minScore };
  } catch (err) {
    console.log(err);
    return [];
  }
};

const precomputeTrustingCounts = (network) => {
  const counts = new Map();
  for (const item of network) {
    if (item.followings) {
      for (const pubkey of item.followings) {
        counts.set(pubkey, (counts.get(pubkey) || 0) + 1);
      }
    }
  }
  return counts;
};

const getWOTScoreForPubkey = (network, pubkey, minScore = 3, counts) => {
  try {
    if (!network?.length || !pubkey) return { score: 0, status: false };
    const totalTrusting = counts.get(pubkey) || 0;
    const score =
      totalTrusting === 0
        ? 5
        : Math.floor((totalTrusting * 10) / network.length);

    return { score, status: score >= minScore };
  } catch (err) {
    console.error(err);
    return { score: 0, status: false };
  }
};

const getWOTList = () => {
  try {
    let userKeys = localStorage_.getItem("_nostruserkeys");
    let userPubkey = userKeys ? JSON.parse(userKeys)?.pub : false;
    let prevData = localStorage_.getItem(`network_${userPubkey}`);
    prevData = prevData ? JSON.parse(prevData) : { network: [] };

    if (!(prevData && userPubkey)) {
      return [];
    }
    let network = prevData.wotPubkeys;
    if (!network || network?.length === 0) {
      return [];
    }

    return network;
  } catch (err) {
    console.log(err);
    return [];
  }
};
const getBackupWOTList = () => {
  try {
    let prevData = localStorage_.getItem(`backup_wot`);
    prevData = prevData ? JSON.parse(prevData) : { network: [] };

    let network = prevData.wotPubkeys;
    if (!network || network?.length === 0) {
      return [];
    }

    return network;
  } catch (err) {
    console.log(err);
    return [];
  }
};

// const getWOTScoreForPubkey = (pubkey, minScore = 3) => {
//   try {
//     let userKeys = localStorage_.getItem("_nostruserkeys");
//     let userPubkey = userKeys ? JSON.parse(userKeys)?.pub : false;
//     let prevData = localStorage_.getItem(`network_${userPubkey}`);
//     prevData = prevData ? JSON.parse(prevData) : { network: [] };

//     if (!(prevData && userPubkey)) {
//       return {
//         score: 10,
//         status: true,
//       };
//     }
//     let network = prevData.network;
//     if (network.length === 0) {
//       return {
//         score: 10,
//         status: true,
//       };
//     }

//     let totalTrusting = network.filter((_) =>
//       _.followings.includes(pubkey)
//     ).length;
//     let totalMuted = network.filter((_) => _.muted.includes(pubkey)).length;
//     let equalizer = totalTrusting === 0 && totalMuted === 0 ? 5 : 0;
//     let score = equalizer || Math.floor(
//       (Math.max(0, totalTrusting - totalMuted) * 10) /
//         network.length
//     );

//     return { score, status: score >= minScore };
//   } catch (err) {
//     console.log(err);
//     return {
//       score: 10,
//       status: true,
//     };
//   }
// };

const filterContent = (selectedFilter, list) => {
  const matchWords = (longString, wordArray) => {
    if (!longString) return false;
    const stringWords = Array.isArray(longString)
      ? longString.map((_) => _.toLowerCase())
      : longString.toLowerCase().match(/\b\w+\b/g) || [];

    const lowerCaseWordArray = wordArray.map((word) => word.toLowerCase());

    let status = stringWords.some((word) => lowerCaseWordArray.includes(word));
    return status;
  };
  const hasImageLinks = (string) => {
    const imageExtensions =
      /\.(jpg|jpeg|png|gif|bmp|webp|mp4|mp3|mov|mpeg)(?:\?[^'"]*)?(?=['"]|\s|$)/i;
    const urlRegex = /(https?:\/\/[^\s]+)\b/i;
    const urls = string.match(urlRegex) || [];
    return urls.some((url) => imageExtensions.test(url));
  };
  const hasCurType = (kind, curType) => {
    if (curType === "videos" && kind === 30005) return true;
    if (curType === "articles" && kind === 30004) return true;
    return true;
  };

  const testForMixedContent = (_) => {
    let thumbnail = selectedFilter?.thumbnail ? _.image : true;
    let excluded_words = selectedFilter.excluded_words.length
      ? !(
          matchWords(_.title, selectedFilter.excluded_words) ||
          matchWords(_.description, selectedFilter.excluded_words) ||
          matchWords(_.content, selectedFilter.excluded_words) ||
          matchWords(_.items, selectedFilter.excluded_words)
        )
      : true;
    let included_words = selectedFilter.included_words.length
      ? matchWords(_.title, selectedFilter.included_words) ||
        matchWords(_.description, selectedFilter.included_words) ||
        matchWords(_.content, selectedFilter.included_words) ||
        matchWords(_.items, selectedFilter.included_words)
      : true;
    let hide_sensitive = selectedFilter.hide_sensitive
      ? !_.contentSensitive
      : true;
    let posted_by = selectedFilter.posted_by.length
      ? selectedFilter.posted_by.includes(_.pubkey)
      : true;
    let a_min_words =
      _.kind === 30023
        ? _.content.split(" ").length > selectedFilter.for_articles.min_words
        : true;
    let n_media_only =
      _.kind === 1
        ? !selectedFilter.media_only
          ? true
          : hasImageLinks(_.content)
          ? true
          : false
        : true;
    let a_media_only =
      _.kind === 30023
        ? !selectedFilter.for_articles.media_only
          ? true
          : hasImageLinks(_.content)
          ? true
          : false
        : true;
    let c_type = [30004, 30005].includes(_.kind)
      ? hasCurType(_.kind, selectedFilter.for_curations.type)
      : true;
    let c_min_items = [30004, 30005].includes(_.kind)
      ? _.items.length > selectedFilter.for_curations.min_items
      : true;
    // let v_source = [34235, 34236, 21, 22].includes(_.kind)
    //   ? sameOrigin(selectedFilter.for_videos.source, _.vUrl)
    //   : true;

    if (
      thumbnail &&
      excluded_words &&
      included_words &&
      hide_sensitive &&
      posted_by &&
      n_media_only &&
      a_min_words &&
      a_media_only &&
      c_type &&
      c_min_items
      // v_source
    )
      return true;
    return false;
  };

  const testForNotes = (_) => {
    try {
      if (!selectedFilter) return true;
      let tags = _.tags.filter((tag) => tag[0] === "t").map((tag) => tag[1]);
      let excluded_words = selectedFilter.excluded_words.length
        ? !(
            matchWords(_.content, selectedFilter.excluded_words) ||
            matchWords(tags, selectedFilter.excluded_words)
          )
        : true;
      let included_words = selectedFilter.included_words.length
        ? matchWords(_.content, selectedFilter.included_words) ||
          matchWords(tags, selectedFilter.included_words)
        : true;

      let posted_by = selectedFilter.posted_by.length
        ? selectedFilter.posted_by.includes(_.pubkey)
        : true;

      let n_media_only =
        _.kind === 1
          ? !selectedFilter.media_only
            ? true
            : hasImageLinks(_.content)
            ? true
            : false
          : true;

      if (excluded_words && included_words && posted_by && n_media_only)
        return true;
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  return list.filter((_) => {
    let status = [1, 6].includes(_.kind)
      ? testForNotes(_.kind === 1 ? _ : _.relatedEvent)
      : testForMixedContent(_);
    if (status) return _;
  });
};

/**
 * Extract amount and description from a bolt11 invoice
 * @param {string} bolt11 - Lightning invoice string
 * @returns {Object} Object containing amount (in sats) and description (memo)
 */
const getInvoiceDetails = (bolt11) => {
  try {
    const decoded = decode(bolt11);

    // Extract amount
    const amountSection = decoded.sections.find((_) => _.name === "amount");
    const amount = amountSection
      ? Math.floor(parseInt(amountSection.value) / 1000)
      : null;

    // Extract description/memo
    const descriptionSection = decoded.sections.find(
      (_) => _.name === "description"
    );
    const description = descriptionSection?.value || null;

    return {
      amount,
      description,
    };
  } catch (err) {
    console.error("Failed to decode invoice:", err);
    return {
      amount: null,
      description: null,
    };
  }
};

export {
  getBech32,
  shortenKey,
  getParsedAuthor,
  getEmptyuserMetadata,
  getEmptyEventStats,
  minimizeKey,
  decodeUrlOrAddress,
  encodeLud06,
  getBolt11,
  decodeBolt11,
  getZapper,
  checkForLUDS,
  convertDate,
  filterRelays,
  removeRelayLastSlash,
  removeDuplicants,
  removeObjDuplicants,
  removeDuplicatedRelays,
  removeEventsDuplicants,
  getParsedRepEvent,
  getParsedRelaySet,
  encryptEventData,
  decryptEventData,
  getClaimingData,
  bytesTohex,
  decrypt04,
  encrypt04,
  encrypt44,
  decrypt44,
  unwrapGiftWrap,
  encodeBase64URL,
  getuserMetadata,
  getParsedSW,
  getParsedMedia,
  sortEvents,
  detectDirection,
  enableTranslation,
  downloadAsFile,
  getWOTScoreForPubkey,
  getWOTList,
  filterContent,
  precomputeTrustingCounts,
  getBackupWOTList,
  getWOTScoreForPubkeyLegacy,
  getEmptyRelaysStats,
  getInvoiceDetails,
};
