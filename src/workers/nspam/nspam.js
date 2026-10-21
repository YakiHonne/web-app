import { EMOJI_RANGES } from "./emojiRanges";

const CHAR_FEATURE_COUNT = 131072;
const WORD_FEATURE_COUNT = 131072;
const STRUCTURAL_FEATURE_COUNT = 17;
const GROUP_FEATURE_COUNT = 6;
const FEATURE_COUNT =
  CHAR_FEATURE_COUNT + WORD_FEATURE_COUNT + STRUCTURAL_FEATURE_COUNT + GROUP_FEATURE_COUNT;

const INVISIBLE_CODE_POINTS = new Set([
  0x180e, 0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x202a, 0x202b, 0x202c,
  0x202d, 0x202e, 0x2060, 0x2061, 0x2062, 0x2063, 0x2064, 0x2066, 0x2067,
  0x2068, 0x2069, 0xfeff,
]);

const WORD_PATTERN = /[\p{L}\p{N}_]{2,}/gu;
const WHITESPACE_PATTERN = /\s+/gu;
const URL_PATTERN = /https?:\/\/([^\s/]+)/giu;
const URL_NORMALIZE_PATTERN = /https?:\/\/([^\s/]+)(\/\S*)?/giu;
const MENTION_PATTERN = /\b(?:nostr:)?(?:npub1|note1|nprofile1|nevent1|naddr1)[0-9a-z]+/giu;
const HASHTAG_PATTERN = /#[\p{L}\p{M}\p{N}_]+/gu;
const NON_WHITESPACE_PATTERN = /\S+/gu;
const DIGIT_PATTERN = /\p{N}/gu;
const PUNCTUATION_PATTERN = /\p{P}/gu;
const TOKENIZE_PATTERN = /\p{L}[\p{L}\p{M}\p{N}_]*|\p{N}+|https?:\/\/\S+|[@#][\p{L}\p{M}\p{N}_]+/giu;

const encoder = new TextEncoder();

function allMatches(pattern, text) {
  return Array.from(text.matchAll(pattern));
}

function stripInvisible(text) {
  return Array.from(text)
    .filter((character) => !INVISIBLE_CODE_POINTS.has(character.codePointAt(0)))
    .join("");
}

function preprocess(input) {
  const nfkc = input.normalize("NFKC");
  let stripped = stripInvisible(nfkc);
  stripped = stripped.replace(
    URL_NORMALIZE_PATTERN,
    (_match, host) => `http://${host.toLowerCase()}`,
  );
  return {
    text: stripped.toLowerCase().replace(WHITESPACE_PATTERN, " ").trim(),
    rawText: nfkc,
  };
}

function bodyKey(raw) {
  return Array.from(stripInvisible(raw).trim().toLowerCase()).slice(0, 200).join("");
}

function ratio(numerator, denominator) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function isEmojiCodePoint(codePoint) {
  let lower = 0;
  let upper = EMOJI_RANGES.length;
  while (lower < upper) {
    const middle = (lower + upper) >>> 1;
    const [rangeStart, rangeEnd] = EMOJI_RANGES[middle];
    if (codePoint < rangeStart) {
      upper = middle;
    } else if (codePoint > rangeEnd) {
      lower = middle + 1;
    } else {
      return true;
    }
  }
  return false;
}

function extractStructural(raw, tags) {
  const urls = allMatches(URL_PATTERN, raw);
  const uniqueDomains = new Set(urls.map((match) => match[1].toLowerCase())).size;
  let tagP = 0;
  let tagE = 0;
  let tagT = 0;
  let tagOther = 0;
  for (const tag of tags) {
    if (tag.length === 0) continue;
    switch (tag[0]) {
      case "p": tagP++; break;
      case "e": tagE++; break;
      case "t": tagT++; break;
      default: tagOther++;
    }
  }

  let alphabeticCount = 0;
  let uppercaseCount = 0;
  for (const character of raw) {
    const lowercase = character.toLowerCase();
    const uppercase = character.toUpperCase();
    if (lowercase !== uppercase) {
      alphabeticCount++;
      if (character === uppercase) uppercaseCount++;
    }
  }

  let emojiCount = 0;
  let zeroWidthCount = 0;
  for (const character of raw) {
    const codePoint = character.codePointAt(0);
    if (isEmojiCodePoint(codePoint)) emojiCount++;
    if (INVISIBLE_CODE_POINTS.has(codePoint)) zeroWidthCount++;
  }

  const digitCount = allMatches(DIGIT_PATTERN, raw).length;
  const punctuationCount = allMatches(PUNCTUATION_PATTERN, raw).length;
  const rawLength = raw.length;

  return Float32Array.from([
    rawLength,
    allMatches(NON_WHITESPACE_PATTERN, raw).length,
    urls.length,
    uniqueDomains,
    allMatches(MENTION_PATTERN, raw).length,
    allMatches(HASHTAG_PATTERN, raw).length,
    tagP,
    tagE,
    tagT,
    tagOther,
    emojiCount,
    ratio(emojiCount, rawLength),
    zeroWidthCount,
    ratio(uppercaseCount, alphabeticCount),
    ratio(digitCount, rawLength),
    ratio(punctuationCount, rawLength),
    0,
  ]);
}

function rotateLeft(value, count) {
  return ((value << count) | (value >>> (32 - count))) >>> 0;
}

function murmurHash3(bytes) {
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const fmix1 = 0x85ebca6b;
  const fmix2 = 0xc2b2ae35;
  let hash = 0;
  const blockCount = Math.floor(bytes.length / 4);

  for (let block = 0; block < blockCount; block++) {
    const offset = block * 4;
    let key = bytes[offset]
      | (bytes[offset + 1] << 8)
      | (bytes[offset + 2] << 16)
      | (bytes[offset + 3] << 24);
    key = Math.imul(key, c1) >>> 0;
    key = rotateLeft(key, 15);
    key = Math.imul(key, c2) >>> 0;
    hash = (hash ^ key) >>> 0;
    hash = rotateLeft(hash, 13);
    hash = (Math.imul(hash, 5) + 0xe6546b64) >>> 0;
  }

  const tailOffset = blockCount * 4;
  const remaining = bytes.length & 3;
  let tail = 0;
  if (remaining === 3) tail ^= bytes[tailOffset + 2] << 16;
  if (remaining >= 2) tail ^= bytes[tailOffset + 1] << 8;
  if (remaining >= 1) {
    tail ^= bytes[tailOffset];
    tail = Math.imul(tail, c1) >>> 0;
    tail = rotateLeft(tail, 15);
    tail = Math.imul(tail, c2) >>> 0;
    hash = (hash ^ tail) >>> 0;
  }

  hash = (hash ^ bytes.length) >>> 0;
  hash = (hash ^ (hash >>> 16)) >>> 0;
  hash = Math.imul(hash, fmix1) >>> 0;
  hash = (hash ^ (hash >>> 13)) >>> 0;
  hash = Math.imul(hash, fmix2) >>> 0;
  hash = (hash ^ (hash >>> 16)) >>> 0;
  return hash >= 0x80000000 ? hash - 0x100000000 : hash;
}

function hashInto(token, features, offset, bucketCount) {
  const hash = murmurHash3(encoder.encode(token));
  const index = Math.abs(hash) % bucketCount;
  features[offset + index] += hash >= 0 ? 1 : -1;
}

function hashCharNgrams(text, features) {
  const normalized = text.replace(WHITESPACE_PATTERN, " ");
  for (const word of normalized.split(" ")) {
    if (word.length === 0) continue;
    const padded = ` ${word} `;
    for (let size = 3; size <= 5; size++) {
      for (let start = 0; start <= padded.length - size; start++) {
        hashInto(padded.substring(start, start + size), features, 0, CHAR_FEATURE_COUNT);
      }
    }
  }
}

function hashWordNgrams(text, features) {
  const tokens = allMatches(WORD_PATTERN, text).map((match) => match[0]);
  for (const token of tokens) {
    hashInto(token, features, CHAR_FEATURE_COUNT, WORD_FEATURE_COUNT);
  }
  for (let index = 0; index < tokens.length - 1; index++) {
    hashInto(
      `${tokens[index]} ${tokens[index + 1]}`,
      features,
      CHAR_FEATURE_COUNT,
      WORD_FEATURE_COUNT,
    );
  }
}

function populationStdDev(values) {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce(
    (sum, value) => sum + (value - mean) ** 2,
    0,
  ) / values.length;
  return Math.sqrt(variance);
}

export function extractFeatures(notes) {
  const features = new Float32Array(FEATURE_COUNT);
  if (notes.length === 0) return features;

  const prepared = notes.map((note) => preprocess(note.content));
  hashCharNgrams(prepared.map((item) => item.rawText).join(" "), features);
  hashWordNgrams(prepared.map((item) => item.text).join(" "), features);

  const structuralSums = new Float32Array(STRUCTURAL_FEATURE_COUNT);
  const bodyKeys = [];
  const rawTexts = [];
  const charLengths = [];
  for (const note of notes) {
    rawTexts.push(note.content);
    bodyKeys.push(bodyKey(note.content));
    charLengths.push(note.content.length);
    const structural = extractStructural(note.content, note.tags ?? []);
    for (let index = 0; index < structural.length; index++) {
      structuralSums[index] += structural[index];
    }
  }

  const structuralOffset = CHAR_FEATURE_COUNT + WORD_FEATURE_COUNT;
  for (let index = 0; index < STRUCTURAL_FEATURE_COUNT; index++) {
    features[structuralOffset + index] = structuralSums[index] / notes.length;
  }

  const groupOffset = structuralOffset + STRUCTURAL_FEATURE_COUNT;
  features[groupOffset] = notes.length;
  if (notes.length > 1) {
    const timestamps = notes.map((note) => note.createdAt);
    features[groupOffset + 1] = (Math.max(...timestamps) - Math.min(...timestamps)) / 3600;
  }
  features[groupOffset + 2] = new Set(bodyKeys.filter((key) => key.length > 0)).size;

  if (notes.length > 1) {
    features[groupOffset + 3] = populationStdDev(charLengths);
    const tokenLists = rawTexts.map((raw) =>
      allMatches(TOKENIZE_PATTERN, raw.toLowerCase()).map((match) => match[0]),
    );
    const firstTokens = tokenLists
      .map((tokens) => tokens[0] ?? null)
      .filter((token) => token !== null);
    if (firstTokens.length > 0) {
      const counts = new Map();
      for (const token of firstTokens) counts.set(token, (counts.get(token) ?? 0) + 1);
      features[groupOffset + 4] = Math.max(...counts.values()) / notes.length;
    }

    const tokenSets = tokenLists.map((tokens) => new Set(tokens));
    let jaccardSum = 0;
    let jaccardCount = 0;
    for (let leftIndex = 0; leftIndex < tokenSets.length; leftIndex++) {
      for (let rightIndex = leftIndex + 1; rightIndex < tokenSets.length; rightIndex++) {
        const left = tokenSets[leftIndex];
        const right = tokenSets[rightIndex];
        const union = new Set([...left, ...right]);
        if (union.size > 0) {
          let intersectionCount = 0;
          for (const token of left) if (right.has(token)) intersectionCount++;
          jaccardSum += intersectionCount / union.size;
        }
        jaccardCount++;
      }
    }
    if (jaccardCount > 0) features[groupOffset + 5] = jaccardSum / jaccardCount;
  }

  return features;
}

export class NSpamModel {
  constructor(model) {
    this.model = model;
  }

  static parse(buffer) {
    const [treeCount, nodeCount, leafCount, calibrationCount] = new Uint32Array(
      buffer,
      0,
      4,
    );
    if (treeCount === 0) throw new Error("The nspam model contains no trees.");
    let offset = 16;
    const read = (TypedArray, length) => {
      const values = new TypedArray(buffer, offset, length);
      offset += length * TypedArray.BYTES_PER_ELEMENT;
      return values;
    };
    const treeNodes = read(Uint32Array, treeCount);
    const treeLeaves = read(Uint32Array, treeCount);
    const splitFeature = read(Int32Array, nodeCount);
    const threshold = read(Float32Array, nodeCount);
    const leafValue = read(Float32Array, leafCount);
    const calibrationX = read(Float32Array, calibrationCount);
    const calibrationY = read(Float32Array, calibrationCount);
    const leftChild = read(Int16Array, nodeCount);
    const rightChild = read(Int16Array, nodeCount);
    const nodeOffset = new Uint32Array(treeCount);
    const leafOffset = new Uint32Array(treeCount);
    for (let tree = 1; tree < treeCount; tree++) {
      nodeOffset[tree] = nodeOffset[tree - 1] + treeNodes[tree - 1];
      leafOffset[tree] = leafOffset[tree - 1] + treeLeaves[tree - 1];
    }
    return new NSpamModel({
      treeCount,
      treeNodes,
      nodeOffset,
      leafOffset,
      splitFeature,
      threshold,
      leftChild,
      rightChild,
      leafValue,
      calibrationX,
      calibrationY,
    });
  }

  static async load(modelUrl) {
    const response = await fetch(modelUrl);
    if (!response.ok) throw new Error("Unable to load the nspam model.");
    return NSpamModel.parse(await response.arrayBuffer());
  }

  score(notes) {
    if (notes.length === 0) return 0;
    const cappedNotes =
      notes.length > 10
        ? [...notes]
            .sort((left, right) => right.createdAt - left.createdAt)
            .slice(0, 10)
        : notes;
    const margin = this.rawMargin(extractFeatures(cappedNotes));
    const probability =
      margin >= 0
        ? 1 / (1 + Math.exp(-margin))
        : Math.exp(margin) / (1 + Math.exp(margin));
    return this.calibrate(probability);
  }

  rawMargin(features) {
    const {
      treeCount,
      treeNodes,
      nodeOffset,
      leafOffset,
      splitFeature,
      threshold,
      leftChild,
      rightChild,
      leafValue,
    } = this.model;
    let sum = 0;
    for (let tree = 0; tree < treeCount; tree++) {
      const nodes = nodeOffset[tree];
      let node = treeNodes[tree] === 0 ? -1 : 0;
      while (node >= 0) {
        const featureIndex = splitFeature[nodes + node];
        const featureValue =
          featureIndex < features.length ? features[featureIndex] : 0;
        node =
          featureValue <= threshold[nodes + node]
            ? leftChild[nodes + node]
            : rightChild[nodes + node];
      }
      sum += leafValue[leafOffset[tree] - node - 1];
    }
    return sum;
  }

  calibrate(probability) {
    const x = this.model.calibrationX;
    const y = this.model.calibrationY;
    if (x.length === 0 || y.length === 0) return probability;
    if (probability <= x[0]) return y[0];
    if (probability >= x[x.length - 1]) return y[y.length - 1];
    for (let index = 0; index < x.length - 1; index++) {
      if (probability >= x[index] && probability < x[index + 1]) {
        const portion = (probability - x[index]) / (x[index + 1] - x[index]);
        return y[index] + portion * (y[index + 1] - y[index]);
      }
    }
    return y[y.length - 1];
  }
}
