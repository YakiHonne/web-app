import Link from "next/link";
import React, { useState } from "react";

let s2 = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/s2-yma.png";
let s1 = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/s1-yma.png";
let s3 = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/s3-yma.png";
let s4 = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/s4-yma.png";
let s5 = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/s5-yma.png";
let s6 = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/s6-yma.png";
let s7 = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/s7-yma.png";
let s8 = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/s8-yma.png";
let s8e =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/s8-e-yma.png";
export default function YakiMobileApp() {
  const [showTuto, setShowTuto] = useState(false);

  return (
    <div
      className="fit-container fx-centered box-pad-h box-pad-v fx-start-v"
      style={{ backgroundColor: "black", minHeight: "100vh" }}
    >
      {showTuto && (
        <div
          className="fixed-container fx-centered fx-col box-pad-h"
          style={{ background: "rgba(0, 0, 0, 0.75)" }}
        >
          <iframe
            style={{
              aspectRatio: "16/9",
              width: "min(100%, 800px)",
            }}
            src="https://www.youtube.com/embed/w5yCsULjwxw"
            title="YakiHonne mobile app demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
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
        style={{
          position: "fixed",
          right: "32px",
          bottom: "48px",
          minWidth: "64px",
          aspectRatio: "1/1",
          borderRadius: "var(--border-r-50)",
          backgroundColor: "#202020",
          zIndex: 1000,
        }}
        data-tooltip="Watch tutorial"
        className="pointer fx-centered plus-btn round-icon-tooltip"
        onClick={() => setShowTuto(true)}
      >
        <div
          className="play-b-24"
          style={{ filter: "brightness(0) invert()" }}
        ></div>
      </div>
      <div
        style={{ width: "min(100%,1200px)", rowGap: "24px", columnGap: "24px" }}
        className="fx-centered fx-col"
      >
        <div
          className="box-pad-h-s box-pad-v-s sc-s-18 fit-container fx-scattered"
          style={{
            backgroundColor: "#202020",
            position: "sticky",
            border: "none",
            top: "1rem",
            zIndex: 100,
          }}
        >
          <Link href={"/"} className="fx-centered">
            <div
              className="yakihonne-logo"
              style={{
                filter: "brightness(0) invert()",
                width: "128px",
                height: "48px",
              }}
            ></div>
          </Link>
          <h5 className="gray-c">Mobile App Preview</h5>
          <div className="fx-centered">
            {/* <button className="btn btn-gst fx-centered">
              <div
                className="arrow"
                style={{ transform: "rotate(90deg)" }}
              ></div>
              <span>Home</span>
            </button> */}
            <Link href={"/yakihonne-mobile-app-links"} target={"_blank"}>
              <button
                className="btn btn-normal fx-centered"
                style={{ padding: "1rem", height: "32px" }}
              >
                <div
                  className="mobile"
                  style={{ filter: "brightness(0) invert()" }}
                ></div>
                <span className="p-medium">Get the app</span>
              </button>
            </Link>
          </div>
        </div>
        <video
          autoPlay="autoplay"
          loop="loop"
          muted
          playsInline
          onContextMenu={() => {
            return false;
          }}
          preload="auto"
          id="myVideo"
          // controls={false}

          // autoPlay muted loop id="myVideo"
          style={{
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
            src="https://yakihonne.s3.ap-east-1.amazonaws.com/videos/yakihonne-mobile-app-promo.mp4"
            type="video/mp4"
          />{" "}
          Your browser does not support HTML5 video.
        </video>
        <div
          className="fit-container fx-centered fx-stretch fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          <div
            className="fx-scattered fx-col  fx-stretch"
            style={{
              borderRadius: "var(--border-r-18)",
              backgroundColor: "#202020",
              flex: "1 1 400px",
            }}
          >
            <div className="box-pad-h box-pad-v fx-scattered fx-col fx-start-v">
              <div>
                <h2 className="  gray-c" style={{ color: "white" }}>
                  Elevate Your <span className="p-bold">Insights</span>
                </h2>
                <h2 className="  gray-c" style={{ color: "white" }}>
                  Where <span className="c1-c">writing</span> Shines Bright!
                </h2>
              </div>
              {/* <img
                style={{ width: "50%", objectFit: "contain" }}
                src={s1}
                className="fit-container"
              /> */}
            </div>
            <img
              style={{ objectFit: "contain" }}
              src={s1}
              className="fit-container"
            />
            {/* <div
              style={{ backgroundImage: `url(${s1})`, width: "70%" }}
              className="fit-container bg-img contained-bg"
            ></div> */}
          </div>
          <div
            className="fx-scattered fx-col  fx-stretch"
            style={{
              borderRadius: "var(--border-r-18)",
              backgroundColor: "#202020",
              flex: "1 1 400px",
            }}
          >
            <div className="box-pad-h box-pad-v fx-centered fx-start-h fx-start-v">
              <h2 className=" " style={{ color: "white" }}>
                Limitless <span className="p-bold">content</span> for you to{" "}
                <span className="c1-c">engage.</span>
              </h2>
            </div>
            <div className="fit-container box-pad-h box-pad-v fx-centered">
              <img
                style={{ width: "70%", objectFit: "contain" }}
                src={s2}
                className="fit-container"
              />
            </div>
            {/* <div
              style={{ backgroundImage: `url(${s2})`, height: "300px" }}
              className="fit-container bg-img contained-bg"
            ></div> */}
          </div>
        </div>
        <div
          className="fit-container fx-centered fx-stretch fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          <div
            className="fx-scattered fx-col fx fx-stretch"
            style={{
              borderRadius: "var(--border-r-18)",
              backgroundColor: "var(--c1)",
            }}
          >
            <div className="box-pad-h box-pad-v fx-scattered fx-col fx-start-v">
              <div>
                <h2 className=" " style={{ color: "white" }}>
                  Discover <span className="white-c">curations.</span>
                </h2>
                <h2 className=" " style={{ color: "white" }}>
                  Craft your <span className="white-c">collections.</span>
                </h2>
                <h2 className=" " style={{ color: "white" }}>
                  Captivate your <span className="white-c">audience.</span>
                </h2>
              </div>
              {/* <img
                style={{ width: "50%", objectFit: "contain" }}
                src={s1}
                className="fit-container"
              /> */}
            </div>
            <img
              style={{ objectFit: "contain" }}
              src={s3}
              className="fit-container"
            />
            {/* <div
              style={{ backgroundImage: `url(${s1})`, width: "70%" }}
              className="fit-container bg-img contained-bg"
            ></div> */}
          </div>
        </div>
        <div
          className="fit-container fx-centered fx-stretch fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          <div
            className="fx-scattered fx fx-stretch"
            style={{
              borderRadius: "var(--border-r-18)",
              backgroundColor: "#202020",
            }}
          >
            <div className="box-pad-h box-pad-v fx-scattered fx-col fx-start-v">
              <div>
                <h2 className=" " style={{ color: "white" }}>
                  Stay connected with your{" "}
                  <span className="c1-c">followers, followings.</span>
                </h2>
              </div>
              {/* <img
                style={{ width: "50%", objectFit: "contain" }}
                src={s1}
                className="fit-container"
              /> */}
            </div>
            <img style={{ width: "50%", objectFit: "contain" }} src={s4} />
            {/* <div
              style={{ backgroundImage: `url(${s1})`, width: "70%" }}
              className="fit-container bg-img contained-bg"
            ></div> */}
          </div>
        </div>
        <div
          className="fit-container fx-centered fx-stretch fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          <div
            className="fx-scattered fx-col  fx-stretch"
            style={{
              borderRadius: "var(--border-r-18)",
              backgroundColor: "#202020",
              flex: "1 1 400px",
            }}
          >
            <div className="box-pad-h box-pad-v fx-scattered fx-col fx-start-v">
              <div>
                <h2 className=" " style={{ color: "white" }}>
                  <span className="c1-c">Write</span> your content.
                </h2>
                <h2 className=" " style={{ color: "white" }}>
                  <span className="c1-c">Refine</span> it effortlessly.
                </h2>
                <h2 className=" " style={{ color: "white" }}>
                  <span className="c1-c">Preview</span> it to perfection.
                </h2>
              </div>
            </div>
            <img
              style={{ objectFit: "contain" }}
              src={s5}
              className="fit-container"
            />
          </div>
          <div
            className="fx-scattered fx-col  fx-stretch"
            style={{
              borderRadius: "var(--border-r-18)",
              backgroundColor: "var(--c3)",
              flex: "1 1 400px",
            }}
          >
            <div className="box-pad-h box-pad-v fx-centered fx-col fx-start-h fx-start-v">
              <h2 className=" " style={{ color: "white" }}>
                Dive into <span className="c1-c">discussions.</span>
              </h2>
              <h2 className=" " style={{ color: "white" }}>
                Share your <span className="c1-c">voice.</span>
              </h2>
              <h2 className=" " style={{ color: "white" }}>
                Show your support with <span className="c1-c">votes.</span>
              </h2>
            </div>

            <img
              style={{ objectFit: "contain" }}
              src={s6}
              className="fit-container"
            />

            {/* <div
              style={{ backgroundImage: `url(${s2})`, height: "300px" }}
              className="fit-container bg-img contained-bg"
            ></div> */}
          </div>
        </div>
        <div
          className="fit-container fx-centered fx-stretch fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          <div
            className="fx-scattered fx-col fx fx-stretch"
            style={{
              borderRadius: "var(--border-r-18)",
              backgroundColor: "var(--gray)",
            }}
          >
            <div className="box-pad-h box-pad-v fx-scattered fx-col fx-start-v">
              <div className="fx-centered fit-container fx-wrap">
                <h2
                  className="   p-centered"
                  style={{ flex: "1 1 300px", color: "white" }}
                >
                  Boundless <span className="c3-c">freedom.</span>
                </h2>
                <h2
                  className="   p-centered"
                  style={{ flex: "1 1 300px", color: "white" }}
                >
                  Experience <span className="c3-c">NOSTR.</span>
                </h2>
                <h2
                  className="   p-centered"
                  style={{ flex: "1 1 300px", color: "white" }}
                >
                  Your own <span className="c3-c">control.</span>
                </h2>
              </div>
              {/* <img
                style={{ width: "50%", objectFit: "contain" }}
                src={s1}
                className="fit-container"
              /> */}
            </div>
            <img
              style={{ objectFit: "contain" }}
              src={s7}
              className="fit-container"
            />
            {/* <div
              style={{ backgroundImage: `url(${s1})`, width: "70%" }}
              className="fit-container bg-img contained-bg"
            ></div> */}
          </div>
        </div>
        <div
          className="fit-container fx-centered fx-stretch fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          <div
            className="fx-scattered fx fx-stretch fx-wrap"
            style={{
              borderRadius: "var(--border-r-18)",
              backgroundColor: "#202020",
            }}
          >
            <img
              style={{ width: "50%", objectFit: "contain", flex: "1 1 500px" }}
              src={s8}
              className="fit-container"
            />
            <div
              className="box-pad-h box-pad-v fx-centered fx-col "
              style={{ flex: "1 1 500px" }}
            >
              <h2 className="  p-centered" style={{ color: "white" }}>
                <span className="c1-c">Seamless account access</span> anytime,
                anywhere in <span className="c1-c">blink!</span>
              </h2>
              <Link href={"/yakihonne-mobile-app-links"} target={"_blank"}>
                <div className="fit-container fx-centered box-pad-v-m">
                  <img
                    style={{ width: "80%", objectFit: "contain" }}
                    src={s8e}
                    className="fit-container"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
