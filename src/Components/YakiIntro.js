import React, { useEffect, useState } from "react";
import Link from "next/link";
import { setToast } from "@/Store/Slides/Publishers";
import { useDispatch } from "react-redux";
import DonationBoxSuggestionCards from "./SuggestionsCards/DonationBoxSuggestionCards";
let ymaQR =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/yma-qr.png";

const content = [
  {
    url: "/yakihonne-smart-widgets",
    thumbnail:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-thumbnails/update-smart-widget.png",
    tag: "Smart widgets",
    new: true,
  },
  {
    url: "/points-system",
    thumbnail:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-thumbnails/update-points-system.png",
    tag: "Points system",
    new: false,
  },
  {
    url: "/yakihonne-paid-notes",
    thumbnail:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-thumbnails/update-flash-news.png",
    tag: "Paid note",
    new: false,
  },
  {
    url: "/yakihonne-mobile-app",
    thumbnail:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-thumbnails/update-mobile-app.png",
    tag: "Mobile app",
    new: false,
  },
];

const updatesList = [
  "Ability to choose a primary color for the interface.",
  "Muting note threads now prevents all unwanted replies, reposts, and notifications from that thread.",
  "Arrow-key navigation added for selecting tagged users in the mentions list.",
  "Cmd/Ctrl + Enter support for quick publishing in the editor.",
  "Added NIP-50 search support for enhanced discovery.",
  "Added Search Relays set.",
  "Added a hard-refresh mechanism to ensure notifications always stay up-to-date.",
  "Bookmark improvements: redesigned cards, added covers, added tags/URLs display and filtering, fixed missing notes in filters, and resolved floating message overlay issues.",
  "Toggle link previews on or off as needed.",
  "Redesigned the muting list in settings.",
  "NIP-71 videos now fall back to secondary URLs if the main source fails.",
  "Removed the warning box that appeared when selecting text outside the comment field.",
  "Videos are now parsed correctly from URLs inside articles.",
  "Optimized the relay list picker for smoother interaction.",
  "Improved the emoji picker with a faster and larger window.",
  "Page titles now set correctly in SSR for better SEO and link previews.",
  "Fixed comment sections not closing after posting in articles, curations, and videos.",
  "Fixed draft articles not publishing when using “publish with deletion.”",
  "Fixed reply previews when the main post is an article, curation, or video.",
  "Fixed Relay Orbit becoming stuck when no data is returned.",
  "General improvements",
];

export default function YakiIntro() {
  const [swipe, setSwipe] = useState(false);
  const [up, setUp] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      let el = document.querySelector(".main-page-nostr-container");
      if (!el) return;
      if (el.scrollTop >= 600) setUp(true);
      else setUp(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {swipe && <Banner exit={() => setSwipe(false)} />}
      <div
        style={{
          position: "fixed",
          right: "38px",
          bottom: up ? "94px" : "16px",
          transition: ".2s ease-in-out",
          zIndex: "1000000",
        }}
        className="fx-centered fx-end-h"
      >
        {!swipe && (
          <div className="slide-right" onClick={() => setSwipe(!swipe)}>
            <div className="info-24"></div>
          </div>
        )}
      </div>
    </>
  );
}

const MobileAppQR = ({ exit }) => {
  const dispatch = useDispatch();
  const copyKey = (keyType, key) => {
    navigator.clipboard.writeText(key);
    dispatch(
      setToast({
        type: 1,
        desc: `${keyType} was copied! 👏`,
      })
    );
  };
  return (
    <div className="fixed-container fx-centered box-pad-h">
      <div
        style={{ width: "min(100%, 350px)", position: "relative" }}
        className="fx-centered fx-col box-pad-h box-pad-v sc-s-18 bg-sp"
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <h4>Get the mobile app</h4>
        <p className="gray-c p-centered" style={{ maxWidth: "250px" }}>
          Download the YakiHonne app for Android or iOS
        </p>
        <div className="fit-container ">
          <img
            className="sc-s-18 fit-container"
            src={ymaQR}
            style={{ aspectRatio: "1/1" }}
          />
        </div>
        <div
          className={"fx-scattered if pointer fit-container dashed-onH"}
          style={{ borderStyle: "dashed" }}
          onClick={() =>
            copyKey("Link", `https://yakihonne.com/yakihonne-mobile-app-links`)
          }
        >
          <div className="link-24"></div>
          <p className="p-one-line">{`https://yakihonne.com/yakihonne-mobile-app-links`}</p>
          <div className="copy-24"></div>
        </div>
      </div>
    </div>
  );
};

const Banner = ({ exit }) => {
  return (
    <div
      style={{
        position: "fixed",
        right: "0",
        top: 0,
        transition: ".2s ease-in-out",
        width: "100vw",
        height: "100vh",
        zIndex: "100000000",
      }}
      className="fixed-container fx-centered fx-col fx-end-v  box-pad-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="fx-scattered box-pad-v-s"
        style={{ width: "min(100%, 400px)" }}
      >
        <h4>Updates news</h4>
        <div className="close" style={{ position: "static" }} onClick={exit}>
          <div></div>
        </div>
      </div>
      <div
        style={{
          height: "90%",
          width: "min(100%, 400px)",
          position: "relative",
          backgroundColor: "transparent",
          border: "none",
        }}
        className="sc-s-18 bg-img cover-bg fx-centered fx-start-v "
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className="fit-container fit-height fx-centered fx-col fx-start-h fx-start-v box-pad-h-s box-pad-v-s"
          style={{ overflow: "scroll" }}
        >
          <div
            className="box-pad-h-m box-pad-v-m fit-container sc-s-18 fx-shrink"
            style={{
              position: "relative",
            }}
          >
            <div className="fit-container fx-scattered">
              <div>
                <p>Updates</p>
                <p className="gray-c p-italic p-medium">
                  (Updated: {process.env.NEXT_PUBLIC_UPDATE_DATE})
                </p>
              </div>
              <p className="orange-c p-medium">
                v{process.env.NEXT_PUBLIC_APP_VERSION}
              </p>
            </div>
            <div className="box-pad-v-s"></div>

            <ul>
              {updatesList.map((update, index) => {
                return <li key={index}>{update}</li>;
              })}
            </ul>
          </div>
          {content.map((card, index) => {
            return (
              <Link
                href={card.url}
                target="_blank"
                className="box-pad-h box-pad-v fit-container sc-s-18 pointer option fx-shrink bg-img cover-bg"
                style={{
                  aspectRatio: "16/9",
                  position: "relative",
                  borderColor: card.new ? "var(--orange-main)" : "",
                  backgroundImage: `url(${card.thumbnail})`,
                }}
                key={index}
              >
                <div
                  className="sticker sticker-normal "
                  style={{
                    position: "absolute",
                    left: card.new ? "50px" : 0,
                    paddingLeft: card.new ? "25px" : "",
                    top: 0,
                    color: "white",
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    backgroundColor: "#555555",
                  }}
                >
                  <p className="p-medium p-italic ">{card.tag}</p>
                </div>
                {card.new && (
                  <div
                    className="sticker sticker-normal "
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      color: card.new ? "white" : "var(--gray)",
                      borderTopRightRadius: 0,
                      borderBottomLeftRadius: 0,
                      backgroundColor: card.new
                        ? "var(--orange-main)"
                        : "var(--dim-gray)",
                    }}
                  >
                    <p className="p-medium p-italic ">New</p>
                  </div>
                )}
              </Link>
            );
          })}
          <DonationBoxSuggestionCards padding={false} />
        </div>
      </div>
    </div>
  );
};
