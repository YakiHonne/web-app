
export const localStorage_ = {
  getItem(key) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  setItem(key, value) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  removeItem(key) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

// notesCache.js
const cache = new Map();

export function setNotesCache(key, data) {
  cache.set(key, data);
}

export function getNotesCache(key) {
  return cache.get(key);
}

export function clearNotesCache(key) {
  cache.delete(key);
}
