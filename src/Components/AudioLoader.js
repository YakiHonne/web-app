'use client';
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import PlayPauseButton from "@/Components/PlayPauseButton/PlayPauseButton";

export default function AudioLoader({ audioSrc }) {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingRate, setLoadingRate] = useState(0);
  const [remaining, setRemaining] = useState("--:--");
 
  useEffect(() => {
    const handlePlay = () => {
      wsRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#999999",
        progressColor: "#ee7700",
        cursorColor: "none",
        height: 80,
        barRadius: 18,
        barWidth: 4,
        barGap: 3,
        dragToSeek: true,
        url: `https://api.yakihonne.com/proxy-audio?url=${audioSrc}`,
      });
      wsRef.current.on("redraw", () => {
        setRemaining(formatTime(wsRef.current.getDuration()));
        setIsLoading(false);
      });
      wsRef.current.on("loading", (rate) => {
        setLoadingRate(rate);
      });

      wsRef.current.on("timeupdate", (currentTime) => {
        if (wsRef.current.getDuration() === currentTime) {
          setIsPlaying(false);
        }
        setRemaining(
          formatTime(
            wsRef.current.getDuration() - currentTime,
            wsRef.current.getDuration()
          )
        );
      });
    };
    let isMounted = false;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isMounted) {
          handlePlay();
          isMounted = true;
        } else {
          if (wsRef.current?.isPlaying()) {
            setIsPlaying(false);
            wsRef.current.playPause();
          }
        }
      },
      { threshold: 0.25 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      wsRef.current?.destroy();
    };
  }, [containerRef.current]);

  const formatTime = (secs, totalSecs) => {
    secs = Math.max(0, Math.floor(secs));
    totalSecs = totalSecs !== undefined ? totalSecs : secs;
    if (totalSecs >= 3600) {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}:${
        s < 10 ? "0" : ""
      }${s}`;
    } else {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
  };

  const handleIsPlaying = () => {
    setIsPlaying(!isPlaying);
    wsRef.current.playPause();
  };

  return (
    <div
      className="fx-scattered fit-container sc-s-18  box-pad-h-m "
      style={{
        pointerEvents: isLoading ? "none" : "auto",
        borderRadius: "16px",
        border: "none",
        height: "80px",
        marginTop: ".5rem"
      }}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      <PlayPauseButton
        isPlaying={isPlaying}
        onClick={handleIsPlaying}
        loading={isLoading}
      />
      <p className="" onClick={() => wsRef.current.playPause()}></p>
      <div
        ref={containerRef}
        className="fit-container pointer"
        style={{ position: "relative" }}
      >
        {isLoading && (
          <>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                transform: "translateY(-50%)",
                width: "100%",
                height: "2px",
                backgroundColor: "var(--pale-gray)",
                borderRadius: "30px",
                zIndex: 1,
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                transform: "translateY(-50%)",
                width: `${loadingRate}%`,
                height: "2px",
                backgroundColor: "var(--black)",
                borderRadius: "30px",
                zIndex: 2,
              }}
            ></div>
          </>
        )}
      </div>
      <div style={{ minWidth: "50px" }} className="fx-centered">
        <p className="p-medium gray-c p-centered">{remaining}</p>
      </div>
    </div>
  );
}
