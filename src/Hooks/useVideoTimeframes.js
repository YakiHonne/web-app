import { useEffect, useState } from "react";

export default function useVideoTimeframes({ frameCount = 8, videoUrl }) {
  const [isVideoFramesLoading, setIsVideoFramesLoading] = useState(false);
  const [videoTimeframes, setVideoTimeframes] = useState([]);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    if (!videoUrl) return;
    setIsVideoFramesLoading(true);
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.load();

    video.addEventListener("loadedmetadata", async () => {
      const duration = video.duration;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const frames = [];
      const step = duration / frameCount;

      for (let i = 0; i < frameCount; i++) {
        video.currentTime = step * i;
        await new Promise((resolve) => {
          video.addEventListener("seeked", resolve, { once: true });
        });

        canvas.width = video.videoWidth / 4;
        canvas.height = video.videoHeight / 4;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.7));
      }

      setVideoTimeframes(frames);
      setIsVideoFramesLoading(false);
      setVideoDuration(Math.floor(duration));
    });
  }, [videoUrl, frameCount]);

  return { videoTimeframes, isVideoFramesLoading, videoDuration };
}
