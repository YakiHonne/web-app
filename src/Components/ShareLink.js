import React, { useEffect, useState } from "react";
import { nip19 } from "nostr-tools";
import { getAuthPubkeyFromNip05 } from "@/Helpers/Helpers";
import QRCode from "react-qr-code";
import UserProfilePic from "@/Components/UserProfilePic";
import { useToPng } from "@hugocxl/react-to-image";
import axios from "axios";
import { getBech32 } from "@/Helpers/Encryptions";
import Date_ from "@/Components/Date_";
import UN from "@/Components/UN";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";

const getNostrLink = async (path) => {
  let pathSplit = path.split("/");
  let type = pathSplit[1];
  let kind = 0;
  switch (type) {
    case "curations":
      kind = 30004;
      break;
    case "article":
      kind = 30023;
      break;
    case "videos":
      kind = 34235;
      break;
    case "smart-widget":
      kind = 30033;
      break;
  }
  if (kind !== 0) {
    let naddr = pathSplit[2];
    if (pathSplit.length === 4) {
      let pubkey = await getAuthPubkeyFromNip05(pathSplit[2]);
      if (!pubkey) return "nostr:";
      naddr = nip19.naddrEncode({
        identifier: pathSplit[3],
        kind,
        pubkey,
      });
      return `nostr:${naddr}`;
    }
    return `nostr:${naddr}`;
  }

  let naddr = pathSplit[2] || pathSplit[1];
  return `nostr:${naddr}`;
};

let kind1BG = {
  fn: "linear-gradient(45deg, #6a3093, #a044ff)",
  un: "linear-gradient(45deg, #DA4453, #89216B)",
  bf: "linear-gradient(45deg, #a8c0ff, #3f2b96)",
  nt: "linear-gradient(45deg, #3a3400, #a8ccaf)",
};

export default function ShareLink({
  label = false,
  path = "",
  title = "",
  description = "",
  shareImgData = false,
  kind = false,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showSharing, setShowSharing] = useState(false);
  const [showCopyURL, setShowCopyURL] = useState(false);
  const [showShareSocial, setShowShareSocial] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nostrURL, setNostURL] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [_, convert, ref] = useToPng({
    selector: "#to-print",
    quality: 0.8,
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.download = "shared-from-YAKIHONNE.jpeg";
      link.href = data;
      link.click();
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      let url = await getNostrLink(path);
      setNostURL(url);
    };
    fetchData();
  }, []);

  const copyLink = (toCopy) => {
    navigator.clipboard.writeText(toCopy);
    dispatch(
      setToast({
        type: 1,
        desc: `${t("AxBmdge")} 👏`,
      })
    );
  };
  const handleSharing = async (e) => {
    e.stopPropagation();
    let isTouchScreen = window.matchMedia("(pointer: coarse)").matches;
    if (navigator.share && isTouchScreen) {
      setIsMobile(true);
      setShowSharing(true);
    } else {
      setShowSharing(true);
      console.log(
        "Web share is currently not supported on this browser. Please provide a callback"
      );
    }
  };

  const handleSharingInMobile = async () => {
    if (navigator.share) {
      try {
        let shareDetails = {
          url: `${window.location.protocol}//${window.location.hostname}${path}`,
          title: title,
          text: description,
        };
        await navigator.share(shareDetails).then(() => console.log("shared"));
      } catch (error) {
        console.log(`Oops! I couldn't share to the world because: ${error}`);
      }
    } else {
      setShowSharing(true);
    }
  };
  if (!shareImgData && isMobile) {
    handleSharingInMobile();
    return;
  }
  return (
    <>
      {showSharing && (
        <div
          className="fixed-container fx-centered box-pad-h"
          onClick={(e) => {
            e.stopPropagation();
            setShowSharing(false);
          }}
        >
          <div
            className="box-pad-v-m box-pad-h-m fx-centered fx-col sc-s-18"
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "400px", gap: 0 }}
          >
            <div className="close" onClick={() => setShowSharing(false)}>
              <div></div>
            </div>
            <h4 className="box-marg-s">{t("AGB5vpj")}</h4>
            {shareImgData && !showCopyURL && !showShareSocial && (
              <ShareImg
                data={shareImgData}
                kind={kind}
                path={`${window.location.protocol}//${window.location.hostname}${path}`}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            {!(showCopyURL || showShareSocial) && (
              <div
                className="fit-container fx-centered fx-col"
                style={{ columnGap: "30px" }}
              >
                <div className="fx-centered fit-container">
                  {!isMobile && (
                    <button
                      className="btn btn-normal btn-full fx-centered"
                      onClick={() => setShowShareSocial(true)}
                    >
                      {t("AFnYfjs")}
                    </button>
                  )}
                  <button
                    className="btn btn-normal btn-full fx-centered"
                    onClick={() =>
                      isMobile ? handleSharingInMobile() : setShowCopyURL(true)
                    }
                  >
                    {t("AahCFK4")}
                  </button>
                </div>
                {shareImgData && (
                  <button
                    className={`btn btn-gray btn-full ${
                      isLoading ? "flash" : "round-icon-tooltip"
                    } fx-centered`}
                    onClick={() => (isLoading ? null : convert())}
                  >
                    <div className="download-file"></div> {t("AxyxzkE")}
                  </button>
                )}
              </div>
            )}
            {showCopyURL && (
              <div
                className="fit-container fx-centered fx-col fx-start-v  slide-up"
                style={{ maxWidth: "400px" }}
              >
                <p className="c1-c p-left fit-container">{t("Aw5f61f")}</p>
                <div
                  className={`fx-scattered if pointer fit-container dashed-onH`}
                  style={{ borderStyle: "dashed" }}
                  onClick={() =>
                    copyLink(
                      `${window.location.protocol}//${window.location.hostname}${path}`
                    )
                  }
                >
                  <p className="p-one-line">{`${window.location.protocol}//${window.location.hostname}${path}`}</p>
                  <div className="copy-24"></div>
                </div>
                <p className="c1-c p-left fit-container">{t("AezhEDd")}</p>
                <div
                  className="fx-scattered if pointer dashed-onH fit-container"
                  style={{ borderStyle: "dashed" }}
                  onClick={() => copyLink(nostrURL)}
                >
                  <p className="p-one-line">{nostrURL}</p>
                  <div className="copy-24"></div>
                </div>
                <button
                  className="btn btn-normal btn-full fx-centered"
                  onClick={() => setShowCopyURL(false)}
                >
                  <div className="arrow" style={{ rotate: "90deg" }}></div>
                  {t("ATB2h6T")}
                </button>
              </div>
            )}
            {showShareSocial && (
              <div
                className="fit-container fx-centered fx-col fx-start-v  slide-up"
                style={{ maxWidth: "400px" }}
              >
                <a
                  className="twitter-share-button btn-gray btn btn-full fx-centered"
                  href={`https://twitter.com/intent/tweet?text=${`${window.location.protocol}//${window.location.hostname}${path}`}`}
                  target="_blank"
                >
                  <div className="twitter-logo-24"></div> {t("AroZoen")}
                </a>
                <a
                  href={`whatsapp://send?text=${`${window.location.protocol}//${window.location.hostname}${path}`}`}
                  data-action="share/whatsapp/share"
                  target="_blank"
                  className="twitter-share-button fit-container"
                >
                  <button className="btn btn-gray btn-full fx-centered">
                    <div className="whatsapp-icon-24"></div> WhatsApp
                  </button>
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${`${
                    window.location.protocol
                  }//${"yakihonne.com"}${path}`}&title=${title}&summary=${description}&source=${"https://yakihonne.com"}`}
                  data-action="share/whatsapp/share"
                  target="_blank"
                  className="twitter-share-button fit-container"
                >
                  <button className="btn btn-gray btn-full fx-centered">
                    <div className="in-icon-24"></div> LinkedIn
                  </button>
                </a>
                <button
                  className="btn btn-normal btn-full fx-centered"
                  onClick={() => setShowShareSocial(false)}
                >
                  <div className="arrow" style={{ rotate: "90deg" }}></div>
                  {t("ATB2h6T")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        className={label ? "fx-scattered fit-container" : "round-icon-tooltip"}
        data-tooltip={t("AGB5vpj")}
        onClick={handleSharing}
      >
        {label && <p>{label}</p>}
        <div className="share-v2-24"></div>
      </div>
    </>
  );
}

const ShareImg = ({ data, kind, path, setIsLoading }) => {
  const { t } = useTranslation();
  const followersCountSL = useSelector((state) => state.followersCountSL);
  const [ppBase64, setPpBase64] = useState(data.author.picture || "");
  const [thumbnailBase64, setThumbnailBase64] = useState(data.post.image || "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let [_pp, _thumbnail] = await Promise.all([
          axios.post("/api/v1/url-to-base64", {
            images: [data.author.picture],
          }),
          axios.post("/api/v1/url-to-base64", {
            images: [data.post.image],
          }),
        ]);
        setIsLoading(false);
        setThumbnailBase64(_thumbnail.data[0] || data.post.image);
        setPpBase64(_pp.data[0] || data.author.picture);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBG = () => {
    if (data.label.toLowerCase() === "flash news") return kind1BG.fn;
    if (data.label.toLowerCase() === "uncensored note") return kind1BG.un;
    if (data.label.toLowerCase() === "buzz feed") return kind1BG.bf;
    if (data.label.toLowerCase() === "note") return kind1BG.nt;
  };

  if (kind === 1)
    return (
      <div
        className="box-pad-h box-pad-v fx-centered fx-col "
        id="to-print"
        style={{ width: "380px", maxHeight: "600px", minHeight: "400px" }}
      >
        <div
          className="fit-container fx-centered fx-col sc-s-18"
          style={{
            border: "none",
            height: "100%",
            position: "relative",
            rowGap: 0,
            background: getBG(),
          }}
        >
          <div>
            <div
              className="yakihonne-logo"
              style={{
                width: "128px",
                height: "60px",
                filter: "brightness(0) invert()",
              }}
            ></div>
          </div>
          <div style={{ backgroundColor: "white" }} className="fit-container">
            <div className="fit-container box-pad-h-m box-pad-v-m ">
              <p
                style={{
                  color: "black",
                  maxHeight: "250px",
                  overflow: "hidden",
                }}
                className=" p-medium gray-c"
              >
                {data.post.content}
              </p>
              <p style={{ color: "black" }}>...</p>
              {data.post.description && (
                <p className="p-three-lines p-medium gray-c">
                  {data.post.description}
                </p>
              )}
              {thumbnailBase64 && (
                <div
                  className="fit-container bg-img cover-bg sc-s-18"
                  style={{
                    aspectRatio: "16/9",
                    margin: ".5rem auto",
                    backgroundImage: `url(${thumbnailBase64})`,
                  }}
                ></div>
              )}
              {data.extra && data.extra.is_sealed && (
                <div style={{ marginTop: ".5rem" }} className="fit-container">
                  <UN
                    data={JSON.parse(data.extra.content)}
                    state="sealed"
                    scaled={true}
                    setTimestamp={() => null}
                    flashNewsAuthor={data.author.pubkey}
                    sealedCauses={data.extra.tags
                      .filter((tag) => tag[0] === "cause")
                      .map((cause) => cause[1])}
                  />
                </div>
              )}
              {data.extra && !data.extra.is_sealed && (
                <div style={{ marginTop: ".5rem" }} className="fit-container">
                  <div
                    className="fit-container sc-s-18 fx-centered fx-col"
                    style={{ rowGap: 0, overflow: "visible" }}
                  >
                    <div className="fit-container  box-pad-h-m box-pad-v-s">
                      <div className="fit-container fx-scattered">
                        <div className="fx-centered fit-container ">
                          <p className="p-bold p-medium green-c">
                            {t("ABgVYCn")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div
                      className="fit-container fx-centered box-pad-h-m box-pad-v-s"
                      style={{ rowGap: "0px" }}
                    >
                      <p className="p-medium p-centered">{t("ASm8U6V")}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ height: "50px" }}></div>
            <div className="fx-centered fx-start-h box-pad-h-m box-pad-v-s ">
              <UserProfilePic
                mainAccountUser={false}
                size={24}
                img={ppBase64}
                allowClick={false}
              />
              <div>
                <p className="p-small" style={{ color: "black" }}>
                  {t("AsXpL4b", {
                    name:
                      data.author.display_name ||
                      data.author.name ||
                      getBech32("npub", data.author.pubkey).substring(0, 10),
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="fit-container box-pad-h-m box-pad-v-s">
            <p className="p-bold" style={{ color: "white" }}>
              {data.label}
            </p>
            <p style={{ color: "white" }} className="p-medium">
              <Date_
                toConvert={new Date(data.post.created_at * 1000)}
                time={true}
              />
            </p>
          </div>
          <div
            className="fx-centered"
            style={{ position: "absolute", right: "8px", bottom: "8px" }}
          >
            <div
              className="fx-centered fx-col box-pad-h-s box-pad-v-s sc-s-18"
              style={{ background: "white", border: "none" }}
            >
              <QRCode value={path} size={100} />
            </div>
          </div>
        </div>
      </div>
    );
  if (kind === 0)
    return (
      <div className="box-pad-h box-pad-v fx-centered fx-col" id="to-print">
        <div
          className="fx-centered fx-col fx-end-h fx-end-h sc-s-18"
          style={{
            width: "380px",
            height: "600px",
            border: "none",
            position: "relative",
          }}
        >
          <div
            className="fx-centered sc-s-18 bg-img cover-bg fit-container"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 0,
              height: "100%",
              border: "none",
              backgroundImage: `url(${thumbnailBase64})`,
              filter: "blur(10px) brightness(70%)",
            }}
          ></div>
          <div
            className="sc-s-18 fx-scattered fx-col"
            style={{
              backgroundColor: "white",
              width: "90%",
              // height: "80%",
              aspectRatio: "1/1",
              position: "relative",
              overflow: "visible",
              zIndex: 1,
              rowGap: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "-49px",
                transform: "translateX(-50%)",
              }}
            >
              <UserProfilePic
                mainAccountUser={false}
                size={98}
                img={ppBase64}
                allowClick={false}
              />
            </div>
            <div
              className="fit-container fx-centered fx-col box-pad-h-m "
              style={{ padding: "4.5rem 1rem 1rem" }}
            >
              <h4 className="p-one-line" style={{ color: "black" }}>
                {data.author.display_name || data.author.name}
              </h4>
              <p className="gray-c p-three-lines p-medium p-centered box-pad-h-m">
                {data.author.about}
              </p>
              {data.author.nip05 && (
                <div className="fx-centered  box-pad-h-m">
                  <p className="orange-c p-medium p-centered">
                    {data.author.nip05}
                  </p>
                  <div className="checkmark-c1"></div>
                </div>
              )}
            </div>
            <hr style={{ margin: 0 }} />
            <div className="fit-container fx-centered  box-pad-h-m box-pad-v-s">
              <div className="fx-centered">
                <p style={{ color: "black" }}>{data.followings}</p>
                <p className="p-medium gray-c">{t("A9TqNxQ")}</p>
              </div>
              <div className="fx-centered">
                <p style={{ color: "black" }}>{followersCountSL.length}</p>
                <p className="p-medium gray-c">{t("A6huCnT")}</p>
              </div>
            </div>
            <hr />
            <div
              className="fx-scattered fx-stretch fit-container"
              style={{ columnGap: 0, marginTop: "1rem" }}
            >
              <div style={{ width: "100%" }} className="fx-centered fx-col">
                <QRCode value={path} size={160} />
              </div>
            </div>

            <div
              className="fit-container fx-centered box-pad-h-m "
              style={{ height: "50px" }}
            >
              <div>
                <div
                  className="yakihonne-logo"
                  style={{ width: "70px", filter: "brightness(0)" }}
                ></div>
              </div>
            </div>
          </div>
          <div className="box-marg-s"></div>
        </div>
      </div>
    );
  if ([30023, 34235, 30004].includes(kind))
    return (
      <div
        className="box-pad-h box-pad-v fx-centered fx-col"
        id="to-print"
        style={{ maxHeight: "70dvh" }}
      >
        <div
          className="fx-centered sc-s-18"
          style={{
            width: "380px",
            height: "600px",
            border: "none",
            position: "relative",
          }}
        >
          <div
            className="fx-centered sc-s-18 bg-img cover-bg fit-container"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 0,
              height: "100%",
              border: "none",
              backgroundImage: `url(${thumbnailBase64})`,
              filter: "blur(10px) brightness(70%)",
            }}
          ></div>
          <div
            className="sc-s-18 fx-scattered fx-col"
            style={{
              backgroundColor: "white",
              width: "90%",
              // height: "80%",
              aspectRatio: "1/1",
              position: "relative",
              zIndex: 1,
              rowGap: 0,
            }}
          >
            <div
              className="fit-container fx-scattered box-pad-h-m "
              style={{ height: "40px" }}
            >
              {kind === 30023 && (
                <div className="fx-centered">
                  <div
                    className="posts"
                    style={{ filter: "brightness(0)" }}
                  ></div>
                  <p className="p-medium" style={{ color: "black" }}>
                    Article
                  </p>
                </div>
              )}
              {kind === 30004 && (
                <div className="fx-centered">
                  <div
                    className="curation"
                    style={{ filter: "brightness(0)" }}
                  ></div>
                  <p className="p-medium" style={{ color: "black" }}>
                    {t("Ac6UnVb")}
                  </p>
                </div>
              )}
              {kind === 34235 && (
                <div className="fx-centered">
                  <div
                    className="video"
                    style={{ filter: "brightness(0)" }}
                  ></div>
                  <p className="p-medium" style={{ color: "black" }}>
                    {t("AVdmifm")}
                  </p>
                </div>
              )}
              <div className="fx-centered">
                <div className="fx-centered">
                  <p className="p-medium" style={{ color: "black" }}>
                    {data.likes}
                  </p>
                  <div
                    className="heart"
                    style={{ filter: "brightness(0)" }}
                  ></div>
                  <div
                    className="like"
                    style={{ filter: "brightness(0)", rotate: "-180deg" }}
                  ></div>
                  {kind === 34235 && (
                    <p className="p-medium" style={{ color: "black" }}>
                      {t("AginxGR", { count: data.views })}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <hr style={{ margin: 0 }} />
            <div
              className="fx-scattered fx-stretch fit-container"
              style={{ height: "260px", columnGap: 0 }}
            >
              <div style={{ width: "100%" }} className="fx-centered fx-col">
                <p
                  style={{ color: "black" }}
                  className="p-medium p-centered box-pad-h-m p-three-lines"
                >
                  {data.post.title}
                </p>

                <p className="p-medium p-centered box-pad-h-m p-two-lines">
                  {data.post.description}
                </p>
                <QRCode value={path} size={100} />
                {data.author.nip05 && (
                  <p className="c1-c p-medium p-centered box-pad-h-m">
                    yakihonne.com/profile/{data.author.nip05}
                  </p>
                )}
              </div>
            </div>
            <hr style={{ margin: 0 }} />
            <div
              className="fit-container fx-scattered box-pad-h-m "
              style={{ height: "50px" }}
            >
              <div className="fx-centered">
                <UserProfilePic
                  mainAccountUser={false}
                  size={24}
                  img={ppBase64}
                  allowClick={false}
                />
                <div>
                  <p className="p-small" style={{ color: "black" }}>
                    {t("AsXpL4b", {
                      name:
                        data.author.display_name ||
                        data.author.name ||
                        getBech32("npub", data.post.author_pubkey).substring(
                          0,
                          10
                        ),
                    })}
                  </p>
                </div>
              </div>
              <div>
                <div
                  className="yakihonne-logo"
                  style={{ width: "70px", filter: "brightness(0)" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};
