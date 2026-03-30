const colorCache = new Map();

export function getColorFromCache(imgUrl) {
  let data = colorCache.get(imgUrl);
  if (data) {
    setColorToCache(imgUrl, data.color);
    return data.color;
  }
  return null;
}

export function setColorToCache(imgUrl, color) {
  colorCache.set(imgUrl, { color, seen: Date.now() });

  if (colorCache.size > 200) {
    const sorted = [...colorCache.entries()].sort(
      (a, b) => b[1].seen - a[1].seen
    );
    const top200 = sorted.slice(0, 200);
    colorCache.clear();
    for (const [k, v] of top200) {
      colorCache.set(k, v);
    }
  }
}
