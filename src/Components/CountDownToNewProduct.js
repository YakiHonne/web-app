import React, { useEffect, useState } from "react";

let targetTimestamp = 1723813200;

export default function CountDownToNewProduct() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetTimestamp));
  const [showTuto, setShowTuto] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTimestamp));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  
  function calculateTimeLeft(targetTimestamp) {
    const difference = targetTimestamp * 1000 - Date.now();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: addZeroIndent(Math.floor(difference / (1000 * 60 * 60 * 24))),
        hours: addZeroIndent(Math.floor((difference / (1000 * 60 * 60)) % 24)),
        minutes: addZeroIndent(Math.floor((difference / 1000 / 60) % 60)),
        seconds: addZeroIndent(Math.floor((difference / 1000) % 60)),
      };
    } else {
      timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return timeLeft;
  }

  function addZeroIndent(number) {
    if (number >= 10) return number;
    return `0${number}`;
  }

  return (
    <>
      {showTuto && (
        <div
          className="fixed-container fx-centered fx-col box-pad-h"
          style={{ background: "rgba(0, 0, 0, 0.75)" }}
          onClick={(e) => {
            e.stopPropagation();
            setShowTuto(false);
          }}
        >
          <video
            controls={true}
            autoPlay="autoplay"
            loop="loop"
            playsInline
            onClick={(e) => e.stopPropagation()}
            onContextMenu={() => {
              return false;
            }}
            preload="auto"
            id="myVideo"
            // controls={false}

            // autoPlay muted loop id="myVideo"
            style={{
              width: "min(100%, 700px)",
              aspectRatio: "16/9",
              position: "relative",
              border: "none",
              zIndex: "0",
              borderRadius: "var(--border-r-18)",
            }}
            className="fit-container"
            // src={
            //   "https://yakihonne.s3.ap-east-1.amazonaws.com/video/yakihonne-mobile-app-promo.mp4"
            // }
          >
            <source
              src="https://yakihonne.s3.ap-east-1.amazonaws.com/sw-videos/smart-widget-teaser.mp4"
              type="video/mp4"
            />{" "}
            Your browser does not support HTML5 video.
          </video>
          <div
            className="close box-pad-v"
            style={{ position: "static" }}
            onClick={() => setShowTuto(false)}
          >
            <div></div>
          </div>
        </div>
      )}

      <div
        className="fit-container fx-centered fx-col fx-start-h teaser-hover pointer"
        //   className="fit-container sc-s-18 box-pad-h box-pad-v fx-centered fx-col fx-start-v"
        style={{
          // backgroundColor: "var(--c1-side)",
          rowGap: "10px",
          border: "none",
        }}
      >
        <h4>COMING SOON</h4>
        <div className="fx-scattered box-pad-h box-pad-v-m fit-container gradient-border">
          <div className="fx-centered fx-col" style={{ gap: 0 }}>
            <h3 className={`${timeLeft.days === "00" ? "gray-c" : "orange-c"}`}>
              {timeLeft.days}
            </h3>{" "}
            <p className="p-medium gray-c">Days</p>
          </div>
          <div>
            <p className="gray-c">:</p>
          </div>
          <div className="fx-centered fx-col" style={{ gap: 0 }}>
            <h3
              className={`${
                timeLeft.days === "00" && timeLeft.hours === "00"
                  ? "gray-c"
                  : "orange-c"
              }`}
            >
              {timeLeft.hours}
            </h3>{" "}
            <p className="p-medium gray-c">Hours</p>
          </div>
          <div>
            <p className="gray-c">:</p>
          </div>
          <div className="fx-centered fx-col" style={{ gap: 0 }}>
            <h3
              className={`${
                timeLeft.days === "00" &&
                timeLeft.hours === "00" &&
                timeLeft.minutes === "00"
                  ? "gray-c"
                  : "orange-c"
              }`}
            >
              {timeLeft.minutes}
            </h3>{" "}
            <p className="p-medium gray-c">Min</p>
          </div>
          <div>
            <p className="gray-c">:</p>
          </div>
          <div className="fx-centered fx-col" style={{ gap: 0 }}>
            <h3
              className={`${
                timeLeft.days === "00" &&
                timeLeft.hours === "00" &&
                timeLeft.minutes === "00" &&
                timeLeft.seconds === "00"
                  ? "gray-c"
                  : "orange-c"
              }`}
            >
              {timeLeft.seconds}
            </h3>{" "}
            <p className="p-medium gray-c">Sec</p>
          </div>
        </div>
        <div className="fx-centered fit-container pointer ">
          <button
            className="btn btn-gst slide-left fx-centered"
            style={{ borderColor: "var(--dim-gray)" }}
            onClick={() => setShowTuto(true)}
          >
            <div
              className="play-b-24"
              style={{ filter: "brightness(0) invert()" }}
            ></div>
            <span className="slide-left">Watch the teaser</span>
          </button>
        </div>
        {/* <div>
        <span className={`p-big p-bold ${timeLeft.days === "00" ? "gray-c" : "orange-c"}`}>
          {timeLeft.days}
        </span>{" "}
        d{" "}
        <span
          className={`p-big p-bold ${
            timeLeft.days === "00" && timeLeft.hours === "00"
              ? "gray-c"
              : "orange-c"
          }`}
        >
          {timeLeft.hours}
        </span>{" "}
        h{" "}
        <span
          className={`p-big p-bold ${
            timeLeft.days === "00" &&
            timeLeft.hours === "00" &&
            timeLeft.minutes === "00"
              ? "gray-c"
              : "orange-c"
          }`}
        >
          {timeLeft.minutes}
        </span>{" "}
        m{" "}
        <span
          className={`p-big p-bold ${
            timeLeft.days === "00" &&
            timeLeft.hours === "00" &&
            timeLeft.minutes === "00" &&
            timeLeft.seconds === "00"
              ? "gray-c"
              : "orange-c"
          }`}
        >
          {timeLeft.seconds}
        </span>{" "}
        s
      </div> */}
      </div>
    </>
  );
}
