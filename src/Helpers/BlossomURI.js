import { getSubData } from "./Controlers";

const BLOSSOM_URI_REGEX = /^blossom:([0-9a-f]{64})\.([a-z0-9]+)(\?[^\s]*)?$/i;
const FALLBACK_SERVERS = [
  "https://blossom.primal.net",
  "https://cdn.satellite.earth",
  "https://blossom.band",
  "https://nostr.download",
];
const CHECK_TIMEOUT = 5000;
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg", "bmp", "heic"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "mkv", "ogv"];
const AUDIO_EXTENSIONS = ["mp3", "ogg", "wav", "m4a", "aac", "flac", "opus"];
const resolved = new Map();
const resolvedUrls = new Map();

export const isBlossomURI = (value) =>
  typeof value === "string" && value.toLowerCase().startsWith("blossom:");

export const parseBlossomURI = (value) => {
  if (!isBlossomURI(value)) return null;
  const match = value.trim().match(BLOSSOM_URI_REGEX);
  if (!match) return null;
  const params = new URLSearchParams(match[3] ? match[3].slice(1) : "");
  const size = parseInt(params.get("sz"), 10);
  return {
    uri: value.trim(),
    sha256: match[1].toLowerCase(),
    ext: match[2].toLowerCase(),
    servers: params.getAll("xs").filter(Boolean),
    authors: params.getAll("as").filter((pubkey) => /^[0-9a-f]{64}$/i.test(pubkey)),
    size: Number.isFinite(size) && size > 0 ? size : null,
  };
};

export const getBlossomMediaType = (ext) => {
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  return "file";
};

const toServerBase = (server) => {
  const value = server.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};

const getBlobUrl = (server, parsed) =>
  `${toServerBase(server)}/${parsed.sha256}.${parsed.ext}`;

const isBlobAvailable = async (url, size) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT);
  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    if (!res.ok) return false;
    const length = parseInt(res.headers.get("content-length"), 10);
    if (size && Number.isFinite(length) && length !== size) return false;
    return true;
  } catch (err) {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

const getAuthorsServers = async (authors) => {
  if (authors.length === 0) return [];
  const data = await getSubData([{ kinds: [10063], authors }], 1500);
  const latest = {};
  for (const event of data.data) {
    if (!latest[event.pubkey] || event.created_at > latest[event.pubkey].created_at)
      latest[event.pubkey] = event;
  }
  return authors.flatMap((pubkey) =>
    (latest[pubkey]?.tags || [])
      .filter((tag) => tag[0] === "server" && tag[1])
      .map((tag) => tag[1]),
  );
};

const findFirstAvailable = async (servers, parsed, tried) => {
  for (const server of servers) {
    const url = getBlobUrl(server, parsed);
    if (tried.has(url)) continue;
    tried.add(url);
    if (await isBlobAvailable(url, parsed.size)) return url;
  }
  return null;
};

export const resolveBlossomURI = (parsed) => {
  if (resolved.has(parsed.uri)) return resolved.get(parsed.uri);
  const promise = (async () => {
    const tried = new Set();
    const fromHints = await findFirstAvailable(parsed.servers, parsed, tried);
    if (fromHints) return fromHints;
    const authorsServers = await getAuthorsServers(parsed.authors);
    const fromAuthors = await findFirstAvailable(authorsServers, parsed, tried);
    if (fromAuthors) return fromAuthors;
    return findFirstAvailable(FALLBACK_SERVERS, parsed, tried);
  })();
  resolved.set(parsed.uri, promise);
  promise.then((url) => {
    if (url) resolvedUrls.set(parsed.uri, url);
  });
  return promise;
};

export const getBlossomUrl = (parsed) => {
  if (resolvedUrls.has(parsed.uri)) return resolvedUrls.get(parsed.uri);
  if (parsed.servers.length === 0) return null;
  resolveBlossomURI(parsed);
  return getBlobUrl(parsed.servers[0], parsed);
};

export const replaceBlossomURI = (token) => {
  if (!isBlossomURI(token)) return token;
  const parsed = parseBlossomURI(token.replace(/[,|']+$/, ""));
  if (!parsed) return token;
  return getBlossomUrl(parsed) || token;
};
