const yakiUsernameCache = new Map();

const HIT_TTL = 30 * 60 * 1000;
const MISS_TTL = 60 * 1000;

const isFresh = (entry) => {
  if (!entry) return false;
  const ttl = entry.username ? HIT_TTL : MISS_TTL;
  return Date.now() - entry.at < ttl;
};

export function getYakiUsername(pubkey) {
  const entry = yakiUsernameCache.get(pubkey);
  if (!isFresh(entry)) return undefined;
  return entry.username;
}

export function setYakiUsername(pubkey, username) {
  yakiUsernameCache.set(pubkey, { username: username || "", at: Date.now() });
}

export function hasYakiUsername(pubkey) {
  const entry = yakiUsernameCache.get(pubkey);
  if (!isFresh(entry)) {
    if (entry) yakiUsernameCache.delete(pubkey);
    return false;
  }
  return true;
}
