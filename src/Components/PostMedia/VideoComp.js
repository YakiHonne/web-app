import React, { useEffect, useRef, useState, useMemo } from "react";

export default function VideoComp({ fileLocalUrl, range }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);

  const originalUrl = useMemo(() => fileLocalUrl, [fileLocalUrl]);

  const startTime = useMemo(
    () => (range.start / 100) * duration,
    [range, duration]
  );
  const endTime = useMemo(
    () => (range.end / 100) * duration,
    [range, duration]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || duration === 0 || startTime >= endTime) return;

    const onTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        video.play();
      }
    };

    video.currentTime = startTime;
    video.play();
    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [startTime, endTime, duration]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <video
        ref={videoRef}
        src={originalUrl}
        autoPlay
        muted
        loop={false}
        controls={false}
        style={{ width: "100%", display: "block", border: "none" }}
        className="sc-s-18"
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
      />
    </div>
  );
}
