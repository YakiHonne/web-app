let mintCache = [];
let mintCustom = [];

export function getMintFromCache() {
  return mintCache;
}

export function setMintFromCache(list) {
  mintCache = list;
}

export function getMintCustom() {
  return mintCustom;
}

export function setMintCustom(list) {
  mintCustom = list;
}
