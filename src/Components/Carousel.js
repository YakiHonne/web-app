import React, { useState } from 'react'
import ProgressBar from '@/Components/ProgressBar';

export default function Carousel({ imgs, selectedImage, back }) {
  const [currentImg, setCurrentImg] = useState(selectedImage);

  return (
    <div
      className="fixed-container fx-centered box-pad-h-s fx-col slide-up"
      onClick={back}
      style={{ zIndex: 99999999 }}
    >
      <div className="close">
        <div></div>
      </div>
      <div className="fit-container fx-centered">
        {imgs.length > 1 && (
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
              currentImg > 0 && setCurrentImg(currentImg - 1);
            }}
          >
            <div
              className="arrow-24"
              style={{
                transform: "rotate(90deg)",
                minHeight: "38px",
                minWidth: "38px",
              }}
            ></div>
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
              {imgs.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="fit-container fx-centered fx-shrink bg-img contained-bg"
                    style={{
                      height: "100vh",
                    }}
                  >
                    <img
                      src={item}
                      style={{ objectFit: "contain" }}
                      className="fit-container fit-height"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {imgs.length > 1 && (
          <div
            className="pointer "
            onClick={(e) => {
              e.stopPropagation();
              currentImg + 1 < imgs.length && setCurrentImg(currentImg + 1);
            }}
            style={{
              position: "fixed",
              right: "10px",
              top: "45%",
              border: "none",
              filter: "drop-shadow(0px 0px 2px rgba(0,0,0,1))",
            }}
          >
            <div
              className="arrow-24"
              style={{
                transform: "rotate(-90deg)",
                minHeight: "38px",
                minWidth: "38px",
              }}
            ></div>
          </div>
        )}
      </div>
      {imgs.length > 1 && (
        <div
          className="fit-container fx-centered box-pad-v-s slide-down"
          style={{ position: "fixed", left: 0, bottom: 0 }}
        >
          <div
            style={{
              width: "min(100%, 400px)",
              backgroundColor: "var(--white-transparent)",
              border: "none",
            }}
            className="fx-centered box-pad-h-m box-pad-v-s sc-s"
          >
            <p style={{ minWidth: "max-content" }}>
              {currentImg + 1} / <span className="gray-c">{imgs.length}</span>
            </p>
            <ProgressBar
              current={currentImg + 1}
              total={imgs.length}
              full={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
