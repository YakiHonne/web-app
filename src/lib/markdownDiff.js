function splitBlocks(md) {
  const lines = md.split("\n");
  const blocks = [];
  let current = [];
  let inFence = false;

  for (const line of lines) {
    if (line.startsWith("```")) inFence = !inFence;

    if (!inFence && line.trim() === "" && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current.join("\n"));
  return blocks.filter((b) => b.trim() !== "");
}

function lcs(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const pairs = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      pairs.push([i - 1, j - 1]);
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return pairs.reverse();
}

export function diffMarkdownBlocks(originalMd, proposedMd) {
  const orig = splitBlocks(originalMd);
  const prop = splitBlocks(proposedMd);

  const common = lcs(orig, prop);
  const hunks = [];
  let oi = 0, pi = 0, hunkIdx = 0;

  for (const [ai, bi] of common) {
    const removedSlice = orig.slice(oi, ai);
    const addedSlice = prop.slice(pi, bi);

    const maxLen = Math.max(removedSlice.length, addedSlice.length);
    for (let k = 0; k < maxLen; k++) {
      const o = removedSlice[k];
      const p = addedSlice[k];
      if (o !== undefined && p !== undefined) {
        hunks.push({ type: "changed", original: o, proposed: p, id: `hunk_${hunkIdx++}` });
      } else if (o !== undefined) {
        hunks.push({ type: "removed", original: o, proposed: "", id: `hunk_${hunkIdx++}` });
      } else {
        hunks.push({ type: "added", original: "", proposed: p, id: `hunk_${hunkIdx++}` });
      }
    }

    hunks.push({ type: "unchanged", original: orig[ai], proposed: prop[bi], id: `hunk_${hunkIdx++}` });
    oi = ai + 1;
    pi = bi + 1;
  }

  const remOrig = orig.slice(oi);
  const remProp = prop.slice(pi);
  const maxRem = Math.max(remOrig.length, remProp.length);
  for (let k = 0; k < maxRem; k++) {
    const o = remOrig[k];
    const p = remProp[k];
    if (o !== undefined && p !== undefined) {
      hunks.push({ type: "changed", original: o, proposed: p, id: `hunk_${hunkIdx++}` });
    } else if (o !== undefined) {
      hunks.push({ type: "removed", original: o, proposed: "", id: `hunk_${hunkIdx++}` });
    } else {
      hunks.push({ type: "added", original: "", proposed: p, id: `hunk_${hunkIdx++}` });
    }
  }

  return hunks;
}
