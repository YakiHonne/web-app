const proUserStateCache = new Map();

export function getProUserState(pubkey) {
  return proUserStateCache.get(pubkey);
}

export function setProUserState(pubkey, data) {
  proUserStateCache.set(pubkey, data);
}
