import React, { useMemo } from "react";
import useVideoTimeframes from "@/Hooks/useVideoTimeframes";
import VideoTrim from "./VideoTrim";
import VideoCover from "./VideoCover";

export default function VideoEditor({ fileLocalUrl, setRange, range, setVideoCover }) {
  const { videoTimeframes, isVideoFramesLoading, videoDuration } =
    useVideoTimeframes({
      videoUrl: fileLocalUrl,
      frameCount: 10,
    });
  const timeCheckpoints = useMemo(() => {
    if (videoDuration === 0) return [];
    const checkpoints = [];
    const step = videoDuration / 4;
    for (let i = 0; i < 4; i++) {
      checkpoints.push(step * i);
    }
    checkpoints.push(videoDuration);
    return checkpoints;
  }, [videoDuration]);

  return (
    <>
      <VideoCover
        videoTimeframes={videoTimeframes}
        isVideoFramesLoading={isVideoFramesLoading}
        setVideoCover={setVideoCover}
      />
      <VideoTrim
        videoTimeframes={videoTimeframes}
        isVideoFramesLoading={isVideoFramesLoading}
        videoDuration={videoDuration}
        setRange={setRange}
        range={range}
        timeCheckpoints={timeCheckpoints}
      />
    </>
  );
}
