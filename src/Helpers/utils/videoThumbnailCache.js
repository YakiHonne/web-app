const videosThumbnailCache = new Map();

export function getVideoThumbnailFromCache(id) {
    let metadata = videosThumbnailCache.get(id);
    if (metadata) {
      setVideoThumbnailFromCache(id, metadata.metadata);
      return metadata.metadata;
    }
    return null;
  }
  
  export function setVideoThumbnailFromCache(id, metadata) {
    videosThumbnailCache.set(id, { metadata, seen: Date.now() });
  
    if (videosThumbnailCache.size > 300) {
      const sorted = [...videosThumbnailCache.entries()].sort(
        (a, b) => b[1].seen - a[1].seen
      );
      const top300 = sorted.slice(0, 300);
      videosThumbnailCache.clear();
      for (const [k, v] of top300) {
        videosThumbnailCache.set(k, v);
      }
    }
  }
  