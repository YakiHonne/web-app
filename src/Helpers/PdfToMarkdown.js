let pdfjsLib = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  pdfjsLib = lib;
  return lib;
}

const BULLET_RE = /^[•◦▪‣·\-*]\s+/;
const NUMBERED_RE = /^(\d+[.)]|[a-zA-Z][.)])\s+/;

function groupItemsIntoLines(items, viewportHeight) {
  const lines = [];
  let current = null;

  for (const item of items) {
    if (!item.str) continue;
    const fontSize = Math.hypot(item.transform[2], item.transform[3]) || 1;
    const x = item.transform[4];
    const y = viewportHeight - item.transform[5];
    const width = item.width ?? 0;

    if (current && Math.abs(y - current.y) <= fontSize * 0.4) {
      current.words.push({ str: item.str, x, width, fontSize });
      current.fontSize = Math.max(current.fontSize, fontSize);
      current.maxX = Math.max(current.maxX, x + width);
    } else {
      if (current) lines.push(current);
      current = {
        y,
        x,
        maxX: x + width,
        fontSize,
        words: [{ str: item.str, x, width, fontSize }],
      };
    }
  }
  if (current) lines.push(current);

  for (const line of lines) {
    line.text = line.words.map((w) => w.str).join("").replace(/\s+/g, " ").trim();
  }
  return lines.filter((l) => l.text.length > 0);
}

function bodyFontSize(lines) {
  const counts = new Map();
  for (const l of lines) {
    const bucket = Math.round(l.fontSize);
    counts.set(bucket, (counts.get(bucket) || 0) + l.text.length);
  }
  let best = null;
  let bestScore = -1;
  for (const [size, score] of counts) {
    if (score > bestScore) {
      best = size;
      bestScore = score;
    }
  }
  return best || 12;
}

function headingLevel(fontSize, base) {
  const ratio = fontSize / base;
  if (ratio >= 1.8) return 1;
  if (ratio >= 1.5) return 2;
  if (ratio >= 1.2) return 3;
  return 0;
}

function detectColumnBands(lines) {
  const xs = [];
  for (const l of lines) xs.push(l.x, ...l.words.slice(1).map((w) => w.x));

  const sorted = [...xs].sort((a, b) => a - b);
  const bands = [];
  for (const x of sorted) {
    const band = bands.find((b) => Math.abs(b.center - x) < 8);
    if (band) {
      band.count++;
      band.center = (band.center * (band.count - 1) + x) / band.count;
    } else {
      bands.push({ center: x, count: 1 });
    }
  }
  return bands
    .filter((b) => b.count >= Math.max(2, lines.length * 0.5))
    .sort((a, b) => a.center - b.center)
    .map((b) => b.center);
}

function lineToColumns(line, bands) {
  const cols = bands.map(() => []);
  for (const w of line.words) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < bands.length; i++) {
      const d = Math.abs(w.x - bands[i]);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    cols[best].push(w.str);
  }
  return cols.map((c) => c.join(" ").trim());
}

function tableToMarkdown(tableLines, bands) {
  const rows = tableLines.map((l) => lineToColumns(l, bands));
  if (rows.length === 0) return "";

  const colCount = bands.length;
  const header = rows[0];
  const body = rows.slice(1);

  const pad = (cells) => {
    const padded = [...cells];
    while (padded.length < colCount) padded.push("");
    return padded;
  };

  const rowToMd = (cells) => `| ${pad(cells).join(" | ")} |`;
  const sep = `| ${Array(colCount).fill("---").join(" | ")} |`;

  return [rowToMd(header), sep, ...body.map(rowToMd)].join("\n");
}

function applyLinks(text, line, linkAnnotations, viewportHeight) {
  if (!linkAnnotations.length) return text;

  const lineTop = line.y - line.fontSize;
  const lineBottom = line.y + line.fontSize * 0.3;

  for (const ann of linkAnnotations) {
    if (!ann.url) continue;
    const [x1, y1pdf, x2, y2pdf] = ann.rect;
    const ay1 = viewportHeight - y2pdf;
    const ay2 = viewportHeight - y1pdf;
    const overlapsY = ay2 >= lineTop && ay1 <= lineBottom;
    const overlapsX = x2 >= line.x && x1 <= line.maxX;
    if (overlapsY && overlapsX) {
      return `[${text}](${ann.url})`;
    }
  }
  return text;
}

async function extractPageImages(page) {
  const ops = await page.getOperatorList();
  const pdfjs = pdfjsLib;
  const images = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] !== pdfjs.OPS.paintImageXObject) continue;
    const objId = ops.argsArray[i][0];
    try {
      const img = await new Promise((resolve, reject) => {
        page.objs.get(objId, (data) => {
          if (data) resolve(data);
          else reject(new Error("no image data"));
        });
      });
      if (!img?.width || !img?.height || !img?.data) continue;

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(img.width, img.height);

      if (img.kind === pdfjs.ImageKind.RGBA_32BPP) {
        imageData.data.set(img.data);
      } else if (img.kind === pdfjs.ImageKind.RGB_24BPP) {
        for (let p = 0, q = 0; p < img.data.length; p += 3, q += 4) {
          imageData.data[q] = img.data[p];
          imageData.data[q + 1] = img.data[p + 1];
          imageData.data[q + 2] = img.data[p + 2];
          imageData.data[q + 3] = 255;
        }
      } else {
        continue;
      }

      ctx.putImageData(imageData, 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) images.push(blob);
    } catch {
    }
  }
  return images;
}

function classifyLines(lines, base, linkAnnotations, viewportHeight) {
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const level = headingLevel(line.fontSize, base);
    if (level > 0) {
      blocks.push({ type: "heading", level, text: line.text });
      i++;
      continue;
    }

    if (BULLET_RE.test(line.text) || NUMBERED_RE.test(line.text)) {
      const items = [];
      while (i < lines.length && (BULLET_RE.test(lines[i].text) || NUMBERED_RE.test(lines[i].text))) {
        const ordered = NUMBERED_RE.test(lines[i].text);
        const stripped = lines[i].text.replace(BULLET_RE, "").replace(NUMBERED_RE, "");
        items.push({ ordered, text: stripped });
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const lookahead = lines.slice(i, i + 12);
    const bands = detectColumnBands(lookahead);
    if (bands.length >= 2) {
      let end = i;
      while (end < lines.length) {
        const cols = lineToColumns(lines[end], bands).filter(Boolean);
        if (cols.length < 2) break;
        end++;
      }
      if (end - i >= 3) {
        blocks.push({ type: "table", markdown: tableToMarkdown(lines.slice(i, end), bands) });
        i = end;
        continue;
      }
    }

    const linked = applyLinks(line.text, line, linkAnnotations, viewportHeight);
    blocks.push({ type: "paragraph", text: linked });
    i++;
  }

  return blocks;
}

function blocksToMarkdown(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.type === "heading") out.push(`${"#".repeat(b.level)} ${b.text}`);
    else if (b.type === "paragraph") out.push(b.text);
    else if (b.type === "table") out.push(b.markdown);
    else if (b.type === "list") {
      out.push(b.items.map((it, idx) => (it.ordered ? `${idx + 1}. ${it.text}` : `- ${it.text}`)).join("\n"));
    }
  }
  return out.join("\n\n");
}

export async function pdfFileToMarkdown(file) {
  const pdfjs = await getPdfjs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  const pageMarkdowns = [];
  const allImages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const [content, annotations, images] = await Promise.all([
      page.getTextContent(),
      page.getAnnotations(),
      extractPageImages(page),
    ]);

    const linkAnnotations = annotations
      .filter((a) => a.subtype === "Link" && (a.url || a.unsafeUrl))
      .map((a) => ({ rect: a.rect, url: a.url || a.unsafeUrl }));

    const lines = groupItemsIntoLines(content.items, viewport.height);
    const base = bodyFontSize(lines);
    const blocks = classifyLines(lines, base, linkAnnotations, viewport.height);

    pageMarkdowns.push(blocksToMarkdown(blocks));
    allImages.push(...images);
  }

  return {
    markdown: pageMarkdowns.join("\n\n---\n\n"),
    images: allImages,
  };
}
