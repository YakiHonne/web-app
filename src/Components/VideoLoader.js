import React, { useRef, useEffect, useState } from "react";
import BlurredContentDesc from "./BlurredContentDesc";
import useVideoVolume from "@/Hooks/useVideoVolume";
import LoadingBar from "./LoadingBar";
import OptionsDropdown from "./OptionsDropdown";
import { useTranslation } from "react-i18next";
import { copyText } from "@/Helpers/Helpers";

const VideoLoader = ({ src, pubkey, isCommonPlatform = false }) => {
  const videoRef = useRef();
  const [isFullScreen, setIsFullScreen] = useState(false);
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
      { threshold: 0.25 },
    );
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleVideoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullScreen]);

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

  const handleFullScreen = () => {
    let dm = document.getElementById("floating-dms");
    let info = document.getElementById("floating-info");
    if (!isFullScreen) {
      dm.style.zIndex = -1;
      info.style.zIndex = -1;
    } else {
      dm.style.zIndex = 10001;
      info.style.zIndex = 10001;
    }

    setIsFullScreen(!isFullScreen);
  };

  return (
    <>
      <div
        className="blur-box fit-container sc-s-18"
        style={{
          margin: ".5rem auto",
          minWidth: "100%",
          position: isFullScreen ? "fixed" : "relative",
          top: isFullScreen ? 0 : "auto",
          left: isFullScreen ? 0 : "auto",
          width: isFullScreen ? "100vw" : "100%",
          height: isFullScreen ? "100vh" : "auto",
          zIndex: isFullScreen ? 100000 : "auto",
          backgroundColor: isFullScreen ? "black" : "transparent",
        }}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          controlsList="nofullscreen"
          controls={false}
          autoPlay={false}
          slot="media"
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
        {videoRef.current && (
          <CustomVideoControls
            videoRef={videoRef.current}
            setIsFullScreen={handleFullScreen}
            src={src}
          />
        )}
        <BlurredContentDesc toBlur={toBlur} />
      </div>
    </>
  );
};

const CustomVideoControls = ({ videoRef, src, setIsFullScreen }) => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    const video = videoRef;
    if (!video) return;

    const handleTimeUpdate = () => {
      let c = video.currentTime;
      let d = video.duration;
      if (c >= d) setIsPaused(true);
      setCurrentTime(c);
    };
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [videoRef]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const paddedSecs = secs.toString().padStart(2, "0");
    return `${mins}:${paddedSecs}`;
  };

  const handlePlayPause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      videoRef.play();
    } else {
      videoRef.pause();
    }
  };

  const downloadVideo = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = src;
    a.download = src;
    a.rel = "noopener";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div
      className={`fit-container fx-centered fx-col fx-end-h box-pad-h-m box-pad-v-m ${isPaused ? "" : "video-controler-container"}`}
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        height: "100%",
        background:
          "linear-gradient(0deg,rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.45) 35%, rgba(0, 0, 0, 0) 50%)",
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handlePlayPause();
      }}
      onDoubleClick={() => setIsFullScreen()}
    >
      <div
        className="fit-container fx-scattered"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="fx-centered">
          <div
            onClick={handlePlayPause}
            className="pointer round-icon-small"
            style={{ border: "none" }}
          >
            {isPaused && <div className="video-play-24"></div>}
            {!isPaused && <div className="video-pause-24"></div>}
            {/* {isPaused && <p>▶</p>}
            {!isPaused && <p>⏸</p>} */}
          </div>
          <VideoVolume videoRef={videoRef} />
        </div>
        <div className="fx-centered">
          <p>
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
          <p
            className="pointer round-icon-small"
            style={{ border: "none" }}
            onClick={setIsFullScreen}
          >
            ⛶
          </p>
          <OptionsDropdown
            displayAbove={true}
            tooltip={false}
            vertical={false}
            options={[
              <div className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale">
                <p onClick={downloadVideo}>{t("ATkpwV4")}</p>
              </div>,
              <div className="pointer fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s option-no-scale">
                <p
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyText(src, t("AxBmdge"));
                  }}
                >
                  {t("ApPw14o", { item: "URL" })}
                </p>
              </div>,
            ]}
          />
        </div>
      </div>
      <div
        className="fit-container fx-centered"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <LoadingBar
          total={duration || 1}
          current={currentTime || 0}
          full={true}
          onClick={(time) => {
            console.log(time);
            if (videoRef) videoRef.currentTime = time;
          }}
        />
      </div>
    </div>
  );
};

const VideoVolume = ({ videoRef }) => {
  const { videoVolume, handleMutedVideos } = useVideoVolume();
  const [isMuted, setIsMuted] = useState(videoVolume);
  const [volume, setVolume] = useState(
    videoVolume ? 0 : videoRef.volume || 0.3,
  );
  useEffect(() => {
    videoRef.muted = isMuted;
  }, [isMuted]);

  const handleRange = (e) => {
    let value = parseFloat(e.target.value);
    if (value === 0) {
      setIsMuted(true);
      handleMutedVideos(undefined, true);
    } else {
      setIsMuted(false);
      handleMutedVideos(undefined, false);
    }
    videoRef.volume = value;
    setVolume(value);
  };

  const handleMuteUnmute = () => {
    let v = isMuted ? 0.4 : 0;
    setIsMuted(!isMuted);
    setVolume(v);
    handleMutedVideos(undefined, !isMuted);
  };

  return (
    <div className="fx-centered sc-s video-volume box-pad-h-s box-pad-v-s">
      <div onClick={handleMuteUnmute}>
        {!isMuted && <div className="volume-normal-24"></div>}
        {isMuted && (
          <div className="volume-muted-24" style={{ opacity: ".5" }}></div>
        )}
      </div>
      <div className="video-volume-range slide-left">
        <input
          value={volume}
          type="range"
          min="0"
          max="1"
          step="0.01"
          onChange={handleRange}
        />
      </div>
    </div>
  );
};

export default VideoLoader;
