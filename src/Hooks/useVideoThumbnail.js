import { useEffect, useState } from "react";
import { getVideoThumbnailFromCache, setVideoThumbnailFromCache } from "@/Helpers/utils/videoThumbnailCache";

export function useVideoThumbnail(url, time = .5, width = 300, image) {
  const [dataUrl, setDataUrl] = useState(getVideoThumbnailFromCache(url));
  useEffect(() => {
    if(image) {
      setDataUrl(image)
      return
    }
    if(dataUrl) return
    let mounted = true;
    const v = document.createElement("video");
    v.crossOrigin = "anonymous"; // needs remote server CORS
    v.preload = "metadata";
    v.src = url;

    const onLoadedMeta = () => {
      v.currentTime = Math.min(time, v.duration || time);
    };
    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = width / v.videoWidth;
        canvas.width = width;
        canvas.height = Math.floor(v.videoHeight * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const d = canvas.toDataURL("image/jpeg", 0.5);
        if (mounted) {
            setDataUrl(d);
            setVideoThumbnailFromCache(url, d);
        }
        v.pause();
        v.src = "";
      } catch (err) {
        console.log(err)
      }
    };

    v.addEventListener("loadedmetadata", onLoadedMeta);
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("error", () => {});
    // try load
    v.load();

    return () => {
      mounted = false;
      v.removeEventListener("loadedmetadata", onLoadedMeta);
      v.removeEventListener("seeked", onSeeked);
      v.src = "";
    };

  }, [url, time, width]);

  return dataUrl;
}
