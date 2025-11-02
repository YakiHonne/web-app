import useToBlurMedia from "@/Hooks/useToBlurMedia";
import React, { useRef, useEffect, useState } from "react";
import BlurredContentDesc from "./BlurredContentDesc";

const VideoLoader = ({ src, pubkey, isCommonPlatform = false }) => {
  const videoRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  // const { toBlur, setIsOpened } = useToBlurMedia({ pubkey });
const toBlur = false;
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
        } else {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.25 }
    );
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleVideoClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // setIsOpened(true);
  };
  if (isCommonPlatform === "yt") {
    return (
      <div
        className="blur-box fit-container"
        style={{ minWidth: "100%", margin: ".5rem auto" }}
        onClick={handleVideoClick}
      >
        <iframe
          loading="lazy"
          style={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "var(--border-r-18)",
            pointerEvents: toBlur ? "none" : "auto",
          }}
          src={`https://www.youtube.com/embed/${src}`}
          className={`sc-s-18 ${toBlur ? "blurred" : ""}`}
          allowFullScreen
        ></iframe>
         <BlurredContentDesc toBlur={toBlur} />
      </div>
    );
  }
  if (isCommonPlatform === "vm") {
    return (
      <div
        className="blur-box fit-container"
        style={{ minWidth: "100%", margin: ".5rem auto" }}
        onClick={handleVideoClick}
      >
        <iframe
          loading="lazy"
          style={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "var(--border-r-18)",
            pointerEvents: toBlur ? "none" : "auto",
          }}
          src={`https://player.vimeo.com/video/${src}`}
          className={`sc-s-18 ${toBlur ? "blurred" : ""}`}
          allowFullScreen
        ></iframe>
              <BlurredContentDesc toBlur={toBlur} />

      </div>
    );
  }
  return (
    <div
      className="blur-box fit-container"
      style={{ margin: ".5rem auto", minWidth: "100%" }}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        controls={true}
        autoPlay={false}
        poster={""}
        preload={isLoaded ? "auto" : "none"}
        name="media"
        width={"100%"}
        className={`sc-s-18 ${toBlur ? "blurred" : ""}`}
        style={{
          aspectRatio: "16/9",
          pointerEvents: toBlur ? "none" : "auto",
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <BlurredContentDesc toBlur={toBlur} />
    </div>
  );
};

export default VideoLoader;
