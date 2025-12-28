const urlsMetadataCache = new Map();

export function getURLFromCache(id) {
    let metadata = urlsMetadataCache.get(id);
    if (metadata) {
      setURLFromCache(id, metadata.metadata);
      return metadata.metadata;
    }
    return null;
  }
  
  export function setURLFromCache(id, metadata) {
    urlsMetadataCache.set(id, { metadata, seen: Date.now() });
  
    if (urlsMetadataCache.size > 300) {
      const sorted = [...urlsMetadataCache.entries()].sort(
        (a, b) => b[1].seen - a[1].seen
      );
      const top300 = sorted.slice(0, 300);
      urlsMetadataCache.clear();
      for (const [k, v] of top300) {
        urlsMetadataCache.set(k, v);
      }
    }
  }