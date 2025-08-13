import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
let ymaQR = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/yma-qr.png";

export default function YakiMobileappSidebar() {
  const [showDemo, setShowDemo] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      {showDemo && <MobileDemo exit={() => setShowDemo(false)} />}
      <div
        className="fit-container fx-centered fx-col fx-end-v"
        style={{
          position: "relative",
        }}
        onClick={() => setShowDemo(true)}
      >
        <div
          className={`pointer fit-container fx-scattered box-pad-h-s box-pad-v-s inactive-link`}
        >
          <div className="fx-centered">
            <div className={"mobile-24"}></div>
            <div className="link-label">{t("A70sntU")}</div>
          </div>
        </div>
      </div>
    </>
  );
}

const MobileDemo = ({ exit }) => {
  const { t } = useTranslation();
  return (
    <div
      className="fixed-container fx-centered fx-col box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        style={{ width: "min(100%, 800px)", position: "relative", gap: "16px" }}
        className="sc-s-18 box-pad-h-s box-pad-v-s bg-sp fx-centered fx-col fx-start-v"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <video
          autoPlay="autoplay"
          loop="loop"
          playsInline
          preload="auto"
          id="myVideo"
          controls={true}
          style={{
            position: "relative",
            border: "none",
            zIndex: "0",
            borderRadius: "var(--border-r-18)",
          }}
          className="fit-container"
        >
          <source
            src="https://yakihonne.s3.ap-east-1.amazonaws.com/videos/yakihonne-mobile-app-promo-2.mp4"
            type="video/mp4"
          />{" "}
          Your browser does not support HTML5 video.
        </video>
      </div>
      <div
        style={{ position: "relative", gap: "16px", maxWidth: "fit-content" }}
        className="sc-s-18 box-pad-h box-pad-v bg-sp fx-centered fx-col fx-start-v slide-up"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="fx-wrap fx-centered" style={{ gap: "20px" }}>
          <div style={{ width: "150px" }}>
            <img
              className="sc-s-18 fit-container"
              src={ymaQR}
              style={{ aspectRatio: "1/1" }}
            />
          </div>
          <div className="fx-centered fx-col" style={{ gap: "10px" }}>
            <div className="fx-centered fx-col">
              <h4>{t("AQgPFMM")}</h4>
              <p className="gray-c p-centered">{t("A2GbLaw")}</p>
            </div>
            <div className="fx-centered fx-co fx-start-v">
              <a
                href="https://apps.apple.com/mo/app/yakihonne/id6472556189?l=en-GB"
                target="_blank"
              >
                <button className="btn btn-gray fx-centered">
                  <div className="apple"></div> {t("AGpzpu6")}
                </button>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.yakihonne.yakihonne&hl=en&gl=US&pli=1"
                target="_blank"
              >
                <button className="btn btn-gray fx-centered">
                  <div className="google"></div> {t("ArHaw72")}
                </button>
              </a>
            </div>
            <div className="fit-container fx-centered">
              <Link
                href={"/yakihonne-mobile-app"}
                className="fit-container"
                target="_blank"
              >
                <button className="btn btn-normal btn-full">
                  {t("AArGqN7")}
                </button>
              </Link>{" "}
              <a
                href="https://github.com/orgs/YakiHonne/repositories"
                target="_blank"
              >
                <button
                  className="btn btn-gray fx-centered"
                  style={{ aspectRatio: "1/1", padding: "0" }}
                >
                  <div className="github-logo"></div>
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
