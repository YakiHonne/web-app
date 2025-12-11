import { useEffect, useRef, useState } from "react";

export default function VideoWithFallback({ sources = [], ...props }) {
  const videoRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || sources.length === 0) return;

    const handleError = () => {
      if (currentIndex < sources.length - 1) {
        console.warn(`Video failed: ${sources[currentIndex]}, trying next...`);
        setCurrentIndex(prev => prev + 1);
      } else {
        console.error("All video sources failed.");
      }
    };

    video.addEventListener("error", handleError);
    return () => video.removeEventListener("error", handleError);
  }, [currentIndex, sources]);

  return (
    <video
      ref={videoRef}
      src={sources[currentIndex]}
      controls
      onCanPlayThrough={() => console.log("Loaded:", sources[currentIndex])}
      {...props}
    />
  );
}
