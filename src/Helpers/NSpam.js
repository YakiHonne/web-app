import { getSubData } from "./Controlers";
import { getKeys } from "./ClientHelpers";
import { localStorage_ } from "./utils/clientLocalStorage";

const MODEL_URL = "/nspam/model-v1.bin";
const SPAM_THRESHOLD = 0.7;
const MIN_NOTES = 3;
const MAX_NOTES = 10;
const MAX_AUTHORS = 200;
const CACHE_TIMEOUT = 50;
export const NSPAM_UPDATED = "nspam-updated";

let worker = null;
let ready = null;
let nextRequestId = 0;
const pending = new Map();
const scores = new Map();

const request = (message) => {
  return new Promise((resolve) => {
    const requestId = ++nextRequestId;
    pending.set(requestId, resolve);
    worker.postMessage({ ...message, requestId });
  });
};

const rejectPending = () => {
  for (const resolve of pending.values()) resolve({ error: true });
  pending.clear();
};

export const initNSpam = () => {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (ready) return ready;
  ready = new Promise((resolve) => {
    try {
      worker = new Worker(new URL("../workers/nspamWorker.js", import.meta.url), {
        type: "module",
      });
      worker.onmessage = (e) => {
        const resolve_ = pending.get(e.data?.requestId);
        if (!resolve_) return;
        pending.delete(e.data.requestId);
        resolve_(e.data);
      };
      worker.onerror = () => {
        rejectPending();
        resolve(false);
      };
      request({
        type: "init",
        modelUrl: new URL(MODEL_URL, window.location.origin).href,
      }).then((res) => resolve(!res.error));
    } catch (err) {
      console.log(err);
      resolve(false);
    }
  });
  return ready;
};

const getStorageKey = (name) => {
  let userKeys = getKeys();
  return `${userKeys?.pub || ""}-nspam-${name}`;
};

const notifyUpdate = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NSPAM_UPDATED));
};

export const isSpamFilterEnabled = () => {
  return !localStorage_.getItem(getStorageKey("disabled"));
};

export const toggleSpamFilter = () => {
  let isEnabled = isSpamFilterEnabled();
  if (isEnabled) localStorage_.setItem(getStorageKey("disabled"), `${Date.now()}`);
  else localStorage_.removeItem(getStorageKey("disabled"));
  notifyUpdate();
  return !isEnabled;
};

const getList = (name) => {
  try {
    let list = JSON.parse(localStorage_.getItem(getStorageKey(name)));
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
};

const moveToList = (pubkey, from, to) => {
  let fromList = getList(from).filter((pubkey_) => pubkey_ !== pubkey);
  let toList = [...new Set([...getList(to), pubkey])];
  localStorage_.setItem(getStorageKey(from), JSON.stringify(fromList));
  localStorage_.setItem(getStorageKey(to), JSON.stringify(toList));
  notifyUpdate();
};

export const getSpamSafelist = () => getList("safelist");

export const getSpamMarkedList = () => getList("marked");

export const addToSpamSafelist = (pubkey) => {
  moveToList(pubkey, "marked", "safelist");
};

export const markAsSpam = (pubkey) => {
  moveToList(pubkey, "safelist", "marked");
};

const getAuthorsNotes = async (pubkeys, events) => {
  const cached = await getSubData(
    [{ kinds: [1], authors: pubkeys, limit: MAX_NOTES }],
    CACHE_TIMEOUT,
    [],
    undefined,
    pubkeys.length * MAX_NOTES,
    true,
    "ONLY_CACHE",
  );
  const authors = new Set(pubkeys);
  const notesByAuthor = {};
  const seen = new Set();
  for (const event of [...cached.data, ...events]) {
    if (!event?.id || event.kind !== 1 || seen.has(event.id)) continue;
    if (!authors.has(event.pubkey)) continue;
    seen.add(event.id);
    if (!notesByAuthor[event.pubkey]) notesByAuthor[event.pubkey] = [];
    notesByAuthor[event.pubkey].push({
      content: event.content || "",
      tags: Array.isArray(event.tags) ? event.tags : [],
      createdAt: event.created_at || 0,
    });
  }
  for (const pubkey of Object.keys(notesByAuthor)) {
    notesByAuthor[pubkey] = notesByAuthor[pubkey]
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, MAX_NOTES);
  }
  return notesByAuthor;
};

export const getSpamAuthors = async (pubkeys, events = []) => {
  try {
    if (!Array.isArray(pubkeys) || pubkeys.length === 0) return [];
    const isReady = await initNSpam();
    if (!isReady) return [];
    const authors = pubkeys.slice(0, MAX_AUTHORS);
    const notesByAuthor = await getAuthorsNotes(authors, events);
    const signatures = {};
    const toScore = {};
    for (const pubkey of authors) {
      const notes = notesByAuthor[pubkey] || [];
      if (notes.length < MIN_NOTES) continue;
      signatures[pubkey] = `${notes.length}-${notes[0].createdAt}`;
      if (scores.get(pubkey)?.signature === signatures[pubkey]) continue;
      toScore[pubkey] = notes;
    }
    if (Object.keys(toScore).length > 0) {
      const res = await request({ type: "score", notesByAuthor: toScore });
      for (const [pubkey, score] of Object.entries(res.scores || {})) {
        scores.set(pubkey, { signature: signatures[pubkey], score });
      }
    }
    return authors.filter(
      (pubkey) =>
        signatures[pubkey] &&
        scores.get(pubkey)?.signature === signatures[pubkey] &&
        scores.get(pubkey).score >= SPAM_THRESHOLD,
    );
  } catch (err) {
    console.log(err);
    return [];
  }
};
