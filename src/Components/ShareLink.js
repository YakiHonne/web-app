import React, { useMemo, useState, useRef, useEffect } from "react";
import { copyText } from "@/Helpers/Helpers";
import UserProfilePic from "@/Components/UserProfilePic";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getUser } from "@/Helpers/Controlers";
import Slider from "./Slider";
import { sendMessage } from "@/Helpers/DMHelpers";
import LoadingDots from "./LoadingDots";
import useSearchUsers from "@/Hooks/useSearchUsers";
import useUserProfile from "@/Hooks/useUsersProfile";
import { customHistory } from "@/Helpers/History";
import QRCodeStyling from "qr-code-styling";
import { saveUsers } from "@/Helpers/DB";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick50(arr) {
  let shuffled = shuffleArray(arr).slice(0, 50);
  saveUsers(shuffled);
  return shuffled;
}

const allColors = [
  "#000000",
  "#007AFF",
  "#FF5A5F",
  "#00C853",
  "#FF9500",
  "#9B51E0",
  "#00B8D9",
  "#FF2D55",
  "#F5A623",
];

const YakiLogo = (color) => {
  const svgFile = `
    <svg width="26" height="27" viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5322 6.74562L15.2735 2.32422L13.5322 8.32223V10.5843L8.69393 13.6633L9.36673 24.3455L6.54688 9.06487L13.5322 6.74562Z" fill="${color}"/>
      <path d="M13.8068 10.9376L15.2909 2.32324L14.4994 13.0626L11.7884 15.5532L9.43359 24.693L10.7099 17.1241L10.5714 12.8626L13.8068 10.9376Z" fill="${color}"/>
      <path d="M12.4313 17.8579L9.75 24.0215L13.0744 17.3152L15.0928 15.4073V13.2822L12.4313 15.4929V17.8579Z" fill="${color}"/>
      <path d="M18.3224 9.20068L15.6016 11.1029V14.0848L18.1938 11.5714L18.3224 9.20068Z" fill="${color}"/>
      <path d="M16.8178 7.49919L15.3633 2.36377L17.4708 7.12219L18.7273 6.39671L18.6383 8.44746L16.7287 9.91553L16.8178 7.49919Z" fill="${color}"/>
      <path d="M17.7869 5.1005L15.4023 2.30713L17.9848 4.31218L19.4986 3.79234L19.3403 5.666L17.7869 6.56288V5.1005Z" fill="${color}"/>
    </svg>
  `;

  const base64 = btoa(unescape(encodeURIComponent(svgFile)));
  return `data:image/svg+xml;base64,${base64}`;
};

export default function ShareLink({
  label = false,
  path = "",
  title = "",
  description = "",
}) {
  const { t } = useTranslation();
  const [showSharing, setShowSharing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
  if (isMobile) {
    handleSharingInMobile();
    return;
  }
  return (
    <>
      {showSharing && (
        <SharingWindow
          path={path}
          title={title}
          description={description}
          exit={() => setShowSharing(false)}
        />
      )}
      <div
        className={
          label ? "fx-centered fx-start-h fit-container" : "round-icon-tooltip"
        }
        data-tooltip={t("AGB5vpj")}
        onClick={handleSharing}
      >
        <Icon name="share-v2" size={24} />
        {label && <p>{label}</p>}
      </div>
    </>
  );
}

export const SharingWindow = ({ path, title, description, exit }) => {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const userFollowings = useSelector((state) => state.userFollowings);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [successfulSendingTo, setSuccessfullSendingTo] = useState([]);
  const [toSearch, setToSearch] = useState("");
  const { users, isSearchLoading } = useSearchUsers(toSearch);
  const [isLoading, setIsLoading] = useState(false);

  const batch = useMemo(() => {
    return pick50(userFollowings);
  }, [userFollowings]);
  const contact = useMemo(() => {
    return batch.map((_) => {
      return getUser(_);
    });
  }, [nostrAuthors, batch]);

  const handleSelectedUsers = (metadata) => {
    if (isLoading) return;
    let isThere = selectedUsers.find((_) => _.pubkey === metadata.pubkey);
    if (isThere) {
      setSelectedUsers(
        selectedUsers.filter((_) => _.pubkey !== metadata.pubkey)
      );
    } else {
      setSelectedUsers([metadata, ...selectedUsers]);
    }
  };

  return (
    <>
      <Overlay exit={exit} width={550} allowOverFlow={true}>
        <div
          className=" fx-centered fx-col "
          style={{
            gap: 0,
          }}
        >
          <div className="close" onClick={exit}>
            <div></div>
          </div>
          <h3 className="box-pad-v">{t("A6enIP3")}</h3>
          {userKeys && (
            <>
              <div
                className="fit-container box-pad-h"
                style={{ position: "relative" }}
              >
                <div className="fit-container fx-centered box-pad-h-m box-pad-v-s fx-start-h sc-s-18 bg-sp">
                  <Icon name="search_magnifying_glass" v={2} size={24} />
                  <input
                    type="text"
                    placeholder={t("AowMF91")}
                    className="if if-no-border ifs-full"
                    style={{ padding: 0, height: "40px" }}
                    value={toSearch}
                    onChange={(e) => setToSearch(e.target.value)}
                  />
                </div>
                {isSearchLoading && (
                  <div
                    className="fit-container sc-s-18"
                    style={{
                      width: "100%",
                      position: "absolute",
                      left: 0,
                      top: "110%",
                      overflow: "hidden",
                      zIndex: 211,
                      height: "20px",
                      border: "none",
                      backgroundColor: "transparent",
                    }}
                  >
                    <div
                      style={{ height: "4px", backgroundColor: "var(--c1)" }}
                      className="v-bounce"
                    ></div>
                  </div>
                )}
              </div>
              <div
                className="fit-container fx-centered fx-start-h fx-start-v fx-wrap box-pad-h-m box-pad-v-m"
                style={{ height: "400px", overflowY: "scroll" }}
              >
                {[...(toSearch ? (users ? users : []) : contact)].map((_) => {
                  return (
                    <UserShowCard
                      metadata={_}
                      onClick={() => handleSelectedUsers(_)}
                      key={_.pubkey}
                    />
                  );
                })}
                <div style={{ flex: "1 1 80px" }}></div>
                <div style={{ flex: "1 1 80px" }}></div>
                <div style={{ flex: "1 1 80px" }}></div>
                <div style={{ flex: "1 1 80px" }}></div>
                {!toSearch && contact.length === 0 && (
                  <div
                    className="fit-container fx-centered fx-col"
                    style={{ height: "300px" }}
                  >
                    <Icon name="user" size={60} />
                    <p
                      className="gray-c p-centered box-pad-h"
                      style={{ width: "350px" }}
                    >
                      {t("Afhjw7K")}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          {!userKeys && (
            <div
              className="fit-container fx-centered fx-col"
              style={{ height: "300px" }}
            >
              <Icon name="user" size={60} />
              <p
                className="gray-c p-centered box-pad-h"
                style={{ width: "350px" }}
              >
                {t("Afhjw7K")}
              </p>
              <button
                className="btn btn-normal"
                onClick={() => customHistory("/login")}
              >
                {t("AmOtzoL")}
              </button>
            </div>
          )}
          {selectedUsers.length > 0 && (
            <div
              className="fit-container fx-centered fx-col fx-start-h fx-start-v box-pad-v-s box-pad-h-m"
              style={{
                borderBottom: "1px solid var(--very-dim-gray)",
                borderTop: "1px solid var(--very-dim-gray)",
              }}
            >
              <p className="gray-c">{t("ACSIT4p")}</p>
              <Slider
                slideBy={100}
                items={selectedUsers.map((_) => {
                  let status = successfulSendingTo.includes(_.pubkey)
                    ? true
                    : false;
                  return (
                    <div
                      className="fx-centered fx-col box-pad-v-s option pointer"
                      style={{
                        width: "80px",
                        borderRadius: "10px",
                        position: "relative",
                      }}
                      onClick={() => (status ? null : handleSelectedUsers(_))}
                    >
                      {status ? (
                        <div
                          className="sc-s"
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            zIndex: 1,
                            backgroundColor: "var(--green-main)",
                          }}
                        >
                          <Icon name="check" size={24} />
                        </div>
                      ) : isLoading ? (
                        <div
                          className="sc-s fx-centered flash"
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            minWidth: "26px",
                            minHeight: "26px",
                            zIndex: 1,
                          }}
                        ></div>
                      ) : (
                        <div
                          className="close"
                          style={{ top: "5px", right: "5px" }}
                        >
                          <div></div>
                        </div>
                      )}
                      <UserProfilePic
                        user_id={_.pubkey}
                        img={_.picture}
                        size={45}
                        allowClick={false}
                        allowPropagation={true}
                      />
                      <p className="gray-c p-medium p-one-line">
                        {_.display_name || _.name}
                      </p>
                    </div>
                  );
                })}
              />
            </div>
          )}
          {selectedUsers.length === 0 ? (
            <ShareOnOptions
              path={path}
              title={title}
              description={description}
            />
          ) : (
            <ShareWith
              selectedUsers={selectedUsers}
              path={path}
              successfulSendingTo={successfulSendingTo}
              setSuccessfullSendingTo={setSuccessfullSendingTo}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              exit={exit}
            />
          )}
        </div>
      </Overlay>
    </>
  );
};

const UserShowCard = ({ metadata, onClick }) => {
  const { isNip05Verified } = useUserProfile(metadata.pubkey);
  return (
    <div
      className="fx-centered fx-col box-pad-h-s box-pad-v-s option pointer"
      style={{ flex: "1 1 80px", borderRadius: "10px" }}
      onClick={onClick}
    >
      <UserProfilePic
        user_id={metadata.pubkey}
        img={metadata.picture}
        size={65}
        allowClick={false}
        allowPropagation={true}
      />
      <div className="fx-centered" style={{ gap: "3px" }}>
        <p className="gray-c p-medium p-one-line">
          {metadata.display_name || metadata.name}
        </p>
        {isNip05Verified && <Icon name="checkmark-c1" isColored />}
      </div>
    </div>
  );
};

const ShareWith = ({
  selectedUsers,
  successfulSendingTo,
  setSuccessfullSendingTo,
  isLoading,
  setIsLoading,
  path,
  exit,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (successfulSendingTo.length === selectedUsers.length) {
      exit();
    }
  }, [successfulSendingTo]);

  const handleShare = async () => {
    let fullMessage = message
      ? `${message}\n\nhttps://yakihonne.com${path}`
      : `https://yakihonne.com${path}`;
    let pubkeys = selectedUsers
      .filter((_) => !successfulSendingTo.includes(_.pubkey))
      .map((_) => _.pubkey);
    setIsLoading(true);
    await Promise.all(
      pubkeys.map(async (_) => {
        let isSent = await sendMessage(_, fullMessage);
        if (isSent) {
          setSuccessfullSendingTo((prev) => [...prev, _]);
        }
      })
    );
    setIsLoading(false);
  };

  return (
    <div className="box-pad-h box-pad-v-m fit-container fx-scattered fx-col slide-up">
      <input
        type="text"
        placeholder={t("A7a54es")}
        className="if if-no-border ifs-full"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
      />
      <button
        className="btn btn-normal btn-full"
        onClick={handleShare}
        disabled={isLoading}
      >
        {isLoading ? (
          <LoadingDots />
        ) : successfulSendingTo.length < selectedUsers.length &&
          successfulSendingTo.length > 0 ? (
          t("AhOnn0t")
        ) : (
          t("A14LwWS")
        )}
      </button>
    </div>
  );
};

const ShareOnOptions = ({ path, title, description }) => {
  const { t } = useTranslation();
  const [showQRCode, setShowQRCode] = useState(false);
  let fullURL = `${window.location.protocol}//${window.location.hostname}${path}`;

  return (
    <>
      {showQRCode && (
        <ShareQRCode path={path} exit={() => setShowQRCode(false)} />
      )}

      <div className="box-pad-h box-pad-v-m fit-container fx-scattered">
        <a
          className="twitter-share-button  fx-centered fx-col"
          href={`https://twitter.com/intent/tweet?text=${`${fullURL}`}`}
          target="_blank"
          style={{ opacity: 1 }}
        >
          <div className="round-icon">
            <Icon name="twitter-logo" size={24} />
          </div>
          <p className="gray-c p-medium">{t("AroZoen")}</p>
        </a>
        <a
          href={`whatsapp://send?text=${`${fullURL}`}`}
          data-action="share/whatsapp/share"
          target="_blank"
          className="twitter-share-button fx-centered fx-col"
          style={{ opacity: 1 }}
        >
          <div className="round-icon">
            <Icon name="whatsapp-icon" size={24} />
          </div>
          <p className="gray-c p-medium">WhatsApp</p>
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${`${fullURL}`}&title=${title}&summary=${description}&source=${"https://yakihonne.com"}`}
          data-action="share/whatsapp/share"
          target="_blank"
          className="twitter-share-button fx-centered fx-col"
          style={{ opacity: 1 }}
        >
          <div className="round-icon">
            <Icon name="in-icon" size={24} />
          </div>
          <p className="gray-c p-medium">LinkedIn</p>
        </a>
        <a
          href={`mailto:?subject=A%20Post%20From%20YakiHonne&body=${fullURL}`}
          style={{ opacity: 1 }}
        >
          <div className="fx-centered fx-col">
            <div className="round-icon">
              <Icon name="env" size={24} />
            </div>
            <p className="gray-c p-medium">Email</p>
          </div>
        </a>

        <div
          style={{
            borderLeft: "1px solid var(--dim-gray)",
            height: "40px",
            width: "1px",
          }}
        ></div>
        <div
          className="fx-centered fx-col"
          onClick={() => copyText(fullURL, t("AfnTOQk"))}
        >
          <div className="round-icon">
            <Icon name="link" size={24} />
          </div>
          <p className="gray-c p-medium">{t("AahCFK4")}</p>
        </div>
        <div className="fx-centered fx-col" onClick={() => setShowQRCode(true)}>
          <div className="round-icon">
            <Icon name="qrcode" size={24} />
          </div>
          <p className="gray-c p-medium">QR</p>
        </div>
      </div>
    </>
  );
};

export const ShareQRCode = ({ path, exit }) => {
  let fullURL = `${window.location.protocol}//${window.location.hostname}${path}`;
  const { t } = useTranslation();
  const [selectedFgColor, setSelectedFgColor] = useState("#000000");
  const containerRef = useRef(null);
  const qrRef = useRef(null);
  const qrCodeRef = useRef(
    new QRCodeStyling({
      type: "canvas",
      shape: "square",
      width: 300,
      height: 300,
      data: fullURL,
      margin: 0,
      qrOptions: { typeNumber: "0", mode: "Byte", errorCorrectionLevel: "Q" },
      imageOptions: {
        saveAsBlob: true,
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 0,
      },
      dotsOptions: {
        type: "rounded",
        color: "#000000",
        roundSize: true,
      },
      backgroundOptions: { round: 0, color: "#ffffff" },
      image: YakiLogo("#000000"),
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#000000",
      },
      cornersDotOptions: { type: "dot", color: "#000000" },
    })
  );

  useEffect(() => {
    qrCodeRef.current.append(qrRef.current);
  }, []);

  const changeQRColor = (color) => {
    setSelectedFgColor(color);
    let image = YakiLogo(color);

    qrCodeRef.current.update({
      image,
      dotsOptions: {
        color,
      },
      cornersSquareOptions: {
        color,
      },
      cornersDotOptions: {
        color,
      },
    });
  };

  const onDownloadClick = () => {
    qrCodeRef.current.download({
      extension: "png",
    });
  };

  return (
    <Overlay exit={exit}>
      <div
        className="box-pad-h-m fx-centered fx-col box-pad-h box-pad-v slide-up"
      >
        <div
          className="box-pad-h-m box-pad-v-m fx-centered fx-col"
          style={{
            borderRadius: "18px",
            backgroundColor: "white",
            gap: "20px",
          }}
          ref={containerRef}
        >
          <div ref={qrRef} />
        </div>
        <div className="fit-container sc-s bg-sp fx-even box-pad-v-s box-pad-h-s">
          {allColors.map((_) => {
            return (
              <div
                key={_}
                onClick={() => changeQRColor(_)}
                style={{
                  backgroundColor: _,
                  minWidth: "20px",
                  minHeight: "20px",
                  borderRadius: "50%",
                  outline:
                    selectedFgColor === _
                      ? "1px solid var(--black)"
                      : "1px solid var(--pale-gray)",
                }}
                className="pointer"
              ></div>
            );
          })}
        </div>
        <button
          className="btn btn-gray btn-full fx-centered"
          onClick={onDownloadClick}
        >
          <Icon name="download-file" />
          {t("AxyxzkE")}
        </button>
        <button className="btn btn-normal btn-full" onClick={exit}>
          {t("Acglhzb")}
        </button>
      </div>
    </Overlay>
  );
};
