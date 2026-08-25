const HEX_64 = /^[0-9a-f]{64}$/i;

export function isHex64(value) {
  return typeof value === "string" && HEX_64.test(value);
}

export function getRefType(value, fallback = "e") {
  if (isHex64(value)) return "e";
  if (typeof value === "string" && value.split(":").length >= 3) return "a";
  return fallback;
}

export function getNip22Refs(event) {
  if (!event || event.kind !== 1111) return null;
  let root, rootKind, parentKind;
  let lowerTags = [];
  for (let tag of event.tags) {
    if (!root && ["A", "E", "I"].includes(tag[0]) && tag[1]) root = tag;
    if (["a", "e", "i"].includes(tag[0]) && tag[1]) lowerTags.push(tag);
    if (!rootKind && tag[0] === "K" && tag[1]) rootKind = tag[1];
    if (!parentKind && tag[0] === "k" && tag[1]) parentKind = tag[1];
  }
  if (!root) return null;
  let rootType = root[0] === "A" ? "a" : root[0] === "E" ? "e" : "i";
  let sameTypeAsRoot = lowerTags.find((tag) => tag[0] === rootType);
  let parent =
    sameTypeAsRoot ||
    lowerTags.find((tag) => tag[1] !== root[1]) ||
    lowerTags[0];
  if (parentKind === "1111")
    parent =
      lowerTags.find((tag) => tag[0] === "e" && tag[1] !== root[1]) || parent;
  let parentValue = parent ? parent[1] : root[1];
  return {
    rootType,
    rootValue: root[1],
    rootKind,
    parentType: parent ? parent[0] : rootType,
    parentValue,
    parentKind: parentKind || rootKind,
    isTopLevel: parentValue === root[1],
  };
}

export function getThreadRefs(event) {
  if (!event || !Array.isArray(event.tags)) return null;
  if (event.kind === 1111) {
    const refs = getNip22Refs(event);
    if (!refs) return null;
    return {
      root: { type: refs.rootType, value: refs.rootValue },
      parent: { type: refs.parentType, value: refs.parentValue },
      marked: true,
    };
  }
  if (event.kind !== 1) return null;
  let rootTag;
  let replyTag;
  const positional = [];
  for (const tag of event.tags) {
    if (!["e", "a"].includes(tag[0]) || !tag[1]) continue;
    const marker = tag[3];
    if (marker === "root") {
      if (!rootTag) rootTag = tag;
      continue;
    }
    if (marker === "reply") {
      if (!replyTag) replyTag = tag;
      continue;
    }
    if (marker === "mention") continue;
    if (!marker && tag[0] === "e") positional.push(tag);
  }
  if (rootTag || replyTag) {
    const root = rootTag || replyTag;
    const parent = replyTag || rootTag;
    return {
      root: { type: root[0], value: root[1] },
      parent: { type: parent[0], value: parent[1] },
      marked: true,
    };
  }
  if (positional.length === 0) return null;
  const root = positional[0];
  const parent = positional[positional.length - 1];
  return {
    root: { type: "e", value: root[1] },
    parent: { type: "e", value: parent[1] },
    marked: false,
  };
}

const newestFirst = (a, b) => b.created_at - a.created_at;

export function buildCommentsTree(events, rootId, sort = newestFirst) {
  const byId = new Map();
  for (const event of events || []) {
    if (event?.id && !byId.has(event.id)) byId.set(event.id, event);
  }
  const children = new Map();
  for (const event of byId.values()) {
    const refs = getThreadRefs(event);
    const parentId = refs?.parent?.value;
    if (!parentId || parentId === event.id) continue;
    if (!children.has(parentId)) children.set(parentId, []);
    children.get(parentId).push(event);
  }
  const visited = new Set([rootId]);
  const build = (parentId) =>
    (children.get(parentId) || [])
      .filter((event) => !visited.has(event.id) && visited.add(event.id))
      .sort(sort)
      .map((event) => ({ event, replies: build(event.id) }));
  return build(rootId);
}

export function flattenCommentsTree(tree) {
  const out = [];
  const walk = (nodes) => {
    for (const node of nodes || []) {
      out.push(node.event);
      walk(node.replies);
    }
  };
  walk(tree);
  return out;
}

const referencesThread = (event, refs, rootId) => {
  if (refs.root.value === rootId) return true;
  return event.tags.some(
    (tag) =>
      ["e", "E", "a", "A"].includes(tag[0]) &&
      tag[1] === rootId &&
      tag[3] !== "mention",
  );
};

const isRelayUrl = (value) =>
  typeof value === "string" && /^wss?:\/\/\S+$/i.test(value);

export function getMissingParents(events, rootId) {
  const ids = new Set();
  for (const event of events || []) if (event?.id) ids.add(event.id);
  const missing = new Map();
  for (const event of events || []) {
    const refs = getThreadRefs(event);
    if (!refs) continue;
    const parentId = refs.parent.value;
    if (parentId === rootId || ids.has(parentId)) continue;
    if (refs.parent.type !== "e" || !isHex64(parentId)) continue;
    if (!referencesThread(event, refs, rootId)) continue;
    if (!missing.has(parentId)) missing.set(parentId, new Set());
    for (const tag of event.tags) {
      if (tag[0] === "e" && tag[1] === parentId && isRelayUrl(tag[2]))
        missing.get(parentId).add(tag[2]);
    }
  }
  return [...missing.entries()].map(([id, relays]) => ({
    id,
    relays: [...relays],
  }));
}
