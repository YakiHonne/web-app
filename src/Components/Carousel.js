import React, { useState, useEffect } from "react";
import ProgressBar from "@/Components/ProgressBar";
import Icon from "@/Components/Icon";
import VideoLoader from "@/Components/VideoLoader";
import { createPortal } from "react-dom";

// imgs can be an array of strings (image URLs) or {url, type} objects
export default function Carousel({ imgs, selectedImage, back }) {
  const [currentImg, setCurrentImg] = useState(selectedImage);
  const [mounted, setMounted] = useState(false);
  const normalizedImgs = imgs.map((item) =>
    typeof item === "string" ? { url: item, type: "image" } : item,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentImg(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setCurrentImg((prev) =>
          prev + 1 < normalizedImgs.length ? prev + 1 : 0,
        );
      }

      if (e.key === "ArrowLeft") {
        setCurrentImg((prev) =>
          prev > 0 ? prev - 1 : normalizedImgs.length - 1,
        );
      }

      if (e.key === "Escape") {
        back(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [normalizedImgs.length, back]);

  const content = (
    <div
      className="fixed-container fx-centered box-pad-h-s fx-col slide-up"
      onClick={back}
      style={{ zIndex: 99999999 }}
    >
      <div className="close">
        <div></div>
      </div>
      <div className="fit-container fx-centered">
        {normalizedImgs.length > 1 && (
          <div
            className="pointer"
            style={{
              position: "fixed",
              left: "10px",
              top: "45%",
              zIndex: 100,
              border: "none",
              filter: "drop-shadow(0px 0px 2px rgba(0,0,0,1))",
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              currentImg > 0
                ? setCurrentImg(currentImg - 1)
                : setCurrentImg(normalizedImgs.length - 1);
            }}
          >
            <Icon name="arrow" size={38} transform="rotate(90deg)" />
          </div>
        )}
        <div className="fit-height fit-container slide-up">
          <div
            className="fit-container fit-height"
            style={{ overflow: "hidden" }}
          >
            <div
              className="fit-container fit-height fx-scattered fx-start-h"
              style={{
                transform: `translateX(-${currentImg * 100}%)`,
                transition: ".3s ease-in-out",
                zIndex: 0,
                position: "relative",
                columnGap: 0,
              }}
            >
              {normalizedImgs.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="fit-container fx-centered fx-shrink"
                    style={{ height: "100vh" }}
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    {item.type === "video" ? (
                      <div
                        style={{ width: "min(100%, 720px)", maxHeight: "100vh" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <VideoLoader src={item.url} />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        style={{ objectFit: "contain" }}
                        className="fit-container fit-height"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {normalizedImgs.length > 1 && (
          <div
            className="pointer "
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              currentImg + 1 < normalizedImgs.length
                ? setCurrentImg(currentImg + 1)
                : setCurrentImg(0);
            }}
            style={{
              position: "fixed",
              right: "10px",
              top: "45%",
              border: "none",
              filter: "drop-shadow(0px 0px 2px rgba(0,0,0,1))",
            }}
          >
            <Icon name="arrow" size={38} transform="rotate(-90deg)" />
          </div>
        )}
      </div>
      {normalizedImgs.length > 1 && (
        <div
          className="fit-container fx-centered box-pad-v-s slide-down"
          style={{ position: "fixed", left: 0, bottom: 0 }}
        >
          <div
            style={{
              width: "min(100%, 400px)",
              // backgroundColor: "var(--white-transparent)",
              border: "none",
            }}
            className="fx-centered box-pad-h-m box-pad-v-s bg-dropdown"
          >
            <p style={{ minWidth: "max-content" }}>
              {currentImg + 1} /{" "}
              <span className="gray-c">{normalizedImgs.length}</span>
            </p>
            <ProgressBar
              current={currentImg + 1}
              total={normalizedImgs.length}
              full={true}
            />
          </div>
        </div>
      )}
    </div>
  );

  return mounted
    ? createPortal(
      content,
      document.getElementById("portal-root") || document.body,
    )
    : null;
}
