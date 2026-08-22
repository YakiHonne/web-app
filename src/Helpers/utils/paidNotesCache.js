const MAX_SEEN_COUNT = 5;

const cache = {
  pool: [],
  rotation: [],
  assignedByIndex: new Map(),
  seenCounts: {},
};

const buildRotation = (notes) => {
  return notes
    .map((note, originalIndex) => ({
      note,
      originalIndex,
      seenCount: cache.seenCounts[note.id] || 0,
    }))
    .filter((entry) => entry.seenCount < MAX_SEEN_COUNT)
    .sort((a, b) => a.seenCount - b.seenCount || a.originalIndex - b.originalIndex)
    .map((entry) => entry.note);
};

export function getPaidNotesRotation() {
  return cache.rotation;
}

export function setPaidNotesPool(notes, seenCounts) {
  cache.seenCounts = seenCounts;
  cache.pool = notes;
  cache.rotation = buildRotation(notes);
  cache.assignedByIndex = new Map();
  return cache.rotation;
}

export function getAssignedPaidNote(index) {
  return cache.assignedByIndex.has(index)
    ? cache.assignedByIndex.get(index)
    : undefined;
}

export function assignNextPaidNote(index) {
  if (cache.rotation.length === 0) {
    cache.rotation = buildRotation(cache.pool);
  }

  if (cache.rotation.length === 0) {
    cache.assignedByIndex.set(index, null);
    return null;
  }

  const note = cache.rotation.shift();
  cache.seenCounts[note.id] = (cache.seenCounts[note.id] || 0) + 1;
  cache.assignedByIndex.set(index, note);
  return note;
}
