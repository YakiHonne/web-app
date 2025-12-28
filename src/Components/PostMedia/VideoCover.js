import React, { useEffect, useState } from "react";
import LoadingDots from "../LoadingDots";
import VideoCoverControler from "./VideoCoverControler";
import { useTranslation } from "react-i18next";

export default function VideoCover({
  videoTimeframes,
  isVideoFramesLoading,
  setVideoCover,
}) {
  const { t } = useTranslation();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [fromDevice, setFromDevice] = useState(null);

  useEffect(() => {
    if (isVideoFramesLoading) return;
    if (fromDevice) {
      setVideoCover(fromDevice);
    } else {
      setVideoCover(videoTimeframes[currentImgIndex]);
    }
  }, [isVideoFramesLoading, fromDevice, currentImgIndex]);

  const handlePickFromDevice = (e) => {
    let file = e.target.files[0];
    if (!file) return;
    setCurrentImgIndex(-1);
    setFromDevice(URL.createObjectURL(file));
  };

  const removeFromDevice = () => {
    setFromDevice(null);
    setCurrentImgIndex(0);
  };

  return (
    <div className="fit-container fx-centered fx-col fx-start-h fx-start-v">
      <div className="fit-container fx-scattered">
        <p className="gray-c">{t("Ak99ecE")}</p>
        {!fromDevice && (
          <label
            htmlFor="video-cover-input pointer"
            style={{ position: "relative" }}
          >
            <span
              className="btn-text-gray c1-c pointer"
              style={{ color: "var(--c1)" }}
            >
              {t("AgG9rzS")}
            </span>
            <input
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0,
                zIndex: 1,
                width: "100%",
                height: "100%",
              }}
              type="file"
              id="video-cover-input"
              accept="image/*"
              className="pointer"
              onChange={handlePickFromDevice}
            />
          </label>
        )}
        {fromDevice && (
          <span
            onClick={removeFromDevice}
            className="btn-text-gray c1-c pointer"
            style={{ color: "var(--red-main)" }}
          >
            {t("AzkTxuy")} &#10005;
          </span>
        )}
      </div>
      <div className="fit-container fx-centered">
        <div>
          <div
            className="bg-img cover-bg sc-s-18"
            style={{
              aspectRatio: "9/16",
              height: "100px",
              backgroundImage: `url(${
                fromDevice || videoTimeframes[currentImgIndex]
              })`,
            }}
          ></div>
        </div>
        <span>|</span>
        <div
          className="fit-container sc-s-18 fx-centered"
          style={{
            gap: 0,
            position: "relative",
            cursor: fromDevice ? "not-allowed" : "",
            opacity: fromDevice ? 0.2 : 1,
          }}
        >
          {videoTimeframes.map((src, index) => (
            <div
              key={index}
              alt={`frame-${index}`}
              className="bg-img cover-bg"
              style={{
                flex: 1,
                height: "100px",
                backgroundImage: `url(${src})`,
              }}
            ></div>
          ))}
          {!isVideoFramesLoading && (
            <VideoCoverControler
              count={videoTimeframes.length}
              index={currentImgIndex}
              onChange={(index) => setCurrentImgIndex(index)}
            />
          )}
          {isVideoFramesLoading && (
            <div
              style={{ width: "100%", height: "100px" }}
              className="fx-centered"
            >
              <LoadingDots />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
