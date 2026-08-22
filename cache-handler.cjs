const crypto = require("crypto");
const FileSystemCache =
  require("next/dist/server/lib/incremental-cache/file-system-cache").default;

const MAX_KEY_LENGTH = 200;
const HASH_LENGTH = 32;

const shortenKey = (key) => {
  if (typeof key !== "string" || key.length <= MAX_KEY_LENGTH) return key;
  const digest = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex")
    .slice(0, HASH_LENGTH);
  const head = key.slice(0, MAX_KEY_LENGTH - HASH_LENGTH - 1);
  return `${head}-${digest}`;
};

module.exports = class YakiCacheHandler extends FileSystemCache {
  get(key, ...rest) {
    return super.get(shortenKey(key), ...rest);
  }

  set(key, data, ctx) {
    return super.set(shortenKey(key), data, ctx);
  }
};
