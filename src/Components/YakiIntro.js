import React, { useEffect, useState } from "react";
import Link from "next/link";
import { setToast } from "@/Store/Slides/Publishers";
import { useDispatch } from "react-redux";
import DonationBoxSuggestionCards from "./SuggestionsCards/DonationBoxSuggestionCards";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";
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

export const updatesList = [
  "Added highlights, rendered everywhere with reactions, reposts, comments and zaps.",
  "Highlight any text in a note or an article and share it in a note.",
  "Highlights are now in the home feed, relay feeds and profiles, with a dedicated tab in the content source.",
  "Added reposting for articles and highlights.",
  "Added a potential spam filter in comments, toggle it in the content moderation settings.",
  "Hashtags are now always published in lowercase.",
  "Grouped images placeholder now has a loading highlight.",
  "Fixed a new line being added before the text when hitting enter in the note editor.",
  "Fixed text rendering before an image link with no new line between them.",
  "General bug fix and improvements.",
];

export const proUpdatesVersion = "1.0.2";

export const proUpdatesList = [
  "Fixed issues related to publishing premium content.",
  "Added BLOSSOM servers managements in settings.",
  "Added more filters on content page for notes and articles.",
  "General bug fixes.",
];

export default function YakiIntro() {
  return null;
}

export function YakiIntroBanner() {
  const [swipe, setSwipe] = useState(false);
  return (
    <>
      {swipe && <Banner exit={() => setSwipe(false)} />}
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
      }),
    );
  };
  return (
    <Overlay exit={exit} width={350}>
      <div
        className="fx-centered fx-col box-pad-h box-pad-v"
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
          <Icon name="link" size={24} />
          <p className="p-one-line">{`https://yakihonne.com/yakihonne-mobile-app-links`}</p>
          <Icon name="copy" size={24} />
        </div>
      </div>
    </Overlay>
  );
};

export const ChangelogBanner = ({ exit }) => {
  return <Banner exit={exit} />;
};

const Banner = ({ exit }) => {
  return (
    <Overlay exit={exit} width={400}>
      <div
        className="fx-scattered box-pad-v-s"
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
        className="bg-img cover-bg fx-centered fx-start-v "
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
    </Overlay>
  );
};
