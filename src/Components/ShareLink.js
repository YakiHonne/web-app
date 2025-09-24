import React, { useMemo, useState, useRef, useEffect } from "react";
import { nip19 } from "nostr-tools";
import { copyText, getAuthPubkeyFromNip05 } from "@/Helpers/Helpers";
import QRCode from "react-qr-code";
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

  // safer encoding for UTF-8
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
        <div className="share-v2"></div>
        {label && <p>{label}</p>}
      </div>
    </>
  );
}

const SharingWindow = ({ path, title, description, exit }) => {
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const userFollowings = useSelector((state) => state.userFollowings);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [successfulSendingTo, setSuccessfullSendingTo] = useState([]);
  const [toSearch, setToSearch] = useState("");
  const { users, isSearchLoading } = useSearchUsers(toSearch);
  const [isLoading, setIsLoading] = useState(false);

  const contact = useMemo(() => {
    return userFollowings.map((_) => {
      return getUser(_);
    });
  }, [userFollowings]);

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
      <div className="fixed-container fx-centered box-pad-h">
        <div
          className=" fx-centered fx-col sc-s bg-sp "
          style={{
            position: "relative",
            width: "min(100%, 550px)",
            gap: 0,
            overflow: "visible",
          }}
          onClick={(e) => e.stopPropagation()}
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
                  {/* <UserSearchBar full={true} /> */}
                  <div className="search-24"></div>
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
                    <div
                      className="user"
                      style={{ minHeight: "60px", minWidth: "60px" }}
                    ></div>
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
              <div
                className="user"
                style={{ minHeight: "60px", minWidth: "60px" }}
              ></div>
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
                          <div className="check-24"></div>
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
      </div>
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
        {isNip05Verified && <div className="checkmark-c1"></div>}
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
            <div className="twitter-logo-24"></div>
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
            <div className="whatsapp-icon-24"></div>
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
            <div className="in-icon-24"></div>
          </div>
          <p className="gray-c p-medium">LinkedIn</p>
        </a>
        <a
          href={`mailto:?subject=A%20Post%20From%20YakiHonne&body=${fullURL}`}
          style={{ opacity: 1 }}
        >
          <div className="fx-centered fx-col">
            <div className="round-icon">
              <div className="env-24"></div>
            </div>
            <p className="gray-c p-medium">Email</p>
          </div>
        </a>
       
        <div style={{borderLeft: "1px solid var(--dim-gray)", height: "40px", width: "1px"}}></div>
        <div
          className="fx-centered fx-col"
          onClick={() => copyText(fullURL, t("AfnTOQk"))}
        >
          <div className="round-icon">
            <div className="link-24"></div>
          </div>
          <p className="gray-c p-medium">{t("AahCFK4")}</p>
        </div>
        <div className="fx-centered fx-col" onClick={() => setShowQRCode(true)}>
          <div className="round-icon">
            <div className="qrcode-24"></div>
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
    <div
      className="fixed-container fx-centered box-pad-h box-pad-v"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
      style={{ zIndex: 100000 }}
    >
      <div
        className="box-pad-h-m fx-centered fx-col sc-s box-pad-h box-pad-v bg-sp slide-up"
        onClick={(e) => e.stopPropagation()}
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
          <div className="download-file"></div>
          {t("AxyxzkE")}
        </button>
        <button className="btn btn-normal btn-full" onClick={exit}>
          {t("Acglhzb")}
        </button>
      </div>
    </div>
  );
};

// export const ShareQRCode = ({ path, exit }) => {
//   let fullURL = `${window.location.protocol}//${window.location.hostname}${path}`;
//   const { t } = useTranslation();
//   const [selectedFgColor, setSelectedFgColor] = useState("#000000");
//   const containerRef = useRef(null);
//   const allColors = [
//     "#000000",
//     "#007AFF",
//     "#FF5A5F",
//     "#00C853",
//     "#FF9500",
//     "#9B51E0",
//     "#00B8D9",
//     "#FF2D55",
//     "#F5A623",
//   ];

//   return (
//     <div
//       className="fixed-container fx-centered box-pad-h box-pad-v"
//       onClick={(e) => {
//         e.stopPropagation();
//         exit();
//       }}
//       style={{ zIndex: 100000 }}
//     >
//       <div
//         className="box-pad-h-m fx-centered fx-col sc-s box-pad-h box-pad-v bg-sp slide-up"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           className="box-pad-h-m box-pad-v-m fx-centered fx-col"
//           style={{
//             borderRadius: "18px",
//             backgroundColor: "white",
//             gap: "20px",
//           }}
//           ref={containerRef}
//         >
//           <QRCode
//             value={fullURL}
//             size={256}
//             level="L"
//             fgColor={selectedFgColor}
//           />
//           <div>
//             <p className="p-centered" style={{ color: selectedFgColor }}>
//               Post shared on {new Date().toLocaleDateString()}
//             </p>
//             <p className="p-centered" style={{ color: selectedFgColor }}>
//               From YakiHonne.com
//             </p>
//           </div>
//         </div>
//         <div className="fit-container sc-s bg-sp fx-even box-pad-v-s box-pad-h-s">
//           {allColors.map((_) => {
//             return (
//               <div
//                 key={_}
//                 onClick={() => setSelectedFgColor(_)}
//                 style={{
//                   backgroundColor: _,
//                   minWidth: "20px",
//                   minHeight: "20px",
//                   borderRadius: "50%",

//                   outline:
//                     selectedFgColor === _
//                       ? "1px solid var(--black)"
//                       : "1px solid var(--pale-gray)",
//                 }}
//               ></div>
//             );
//           })}
//         </div>
//         <button className="btn btn-gray btn-full fx-centered">
//           <div className="download-file"></div>
//           {t("AxyxzkE")}
//         </button>
//         <button className="btn btn-normal btn-full">{t("Acglhzb")}</button>
//       </div>
//     </div>
//   );
// };

// export default function ShareLink({
//   label = false,
//   path = "",
//   title = "",
//   description = "",
//   shareImgData = false,
//   kind = false,
// }) {
//   const dispatch = useDispatch();
//   const { t } = useTranslation();
//   const [showSharing, setShowSharing] = useState(false);
//   const [showCopyURL, setShowCopyURL] = useState(false);
//   const [showShareSocial, setShowShareSocial] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [nostrURL, setNostURL] = useState("");
//   const [isMobile, setIsMobile] = useState(false);
//   const [_, convert, ref] = useToPng({
//     selector: "#to-print",
//     quality: 0.8,
//     onSuccess: (data) => {
//       const link = document.createElement("a");
//       link.download = "shared-from-YAKIHONNE.jpeg";
//       link.href = data;
//       link.click();
//     },
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       let url = await getNostrLink(path);
//       setNostURL(url);
//     };
//     fetchData();
//   }, []);

//   const copyLink = (toCopy) => {
//     navigator.clipboard.writeText(toCopy);
//     dispatch(
//       setToast({
//         type: 1,
//         desc: `${t("AxBmdge")} 👏`,
//       })
//     );
//   };
//   const handleSharing = async (e) => {
//     e.stopPropagation();
//     let isTouchScreen = window.matchMedia("(pointer: coarse)").matches;
//     if (navigator.share && isTouchScreen) {
//       setIsMobile(true);
//       setShowSharing(true);
//     } else {
//       setShowSharing(true);
//       console.log(
//         "Web share is currently not supported on this browser. Please provide a callback"
//       );
//     }
//   };

//   const handleSharingInMobile = async () => {
//     if (navigator.share) {
//       try {
//         let shareDetails = {
//           url: `${window.location.protocol}//${window.location.hostname}${path}`,
//           title: title,
//           text: description,
//         };
//         await navigator.share(shareDetails).then(() => console.log("shared"));
//       } catch (error) {
//         console.log(`Oops! I couldn't share to the world because: ${error}`);
//       }
//     } else {
//       setShowSharing(true);
//     }
//   };
//   if (!shareImgData && isMobile) {
//     handleSharingInMobile();
//     return;
//   }
//   return (
//     <>
//       {showSharing && (
//         <div
//           className="fixed-container fx-centered box-pad-h"
//           onClick={(e) => {
//             e.stopPropagation();
//             setShowSharing(false);
//           }}
//         >
//           <div
//             className="box-pad-v-m box-pad-h-m fx-centered fx-col sc-s-18"
//             onClick={(e) => e.stopPropagation()}
//             style={{ position: "relative", width: "400px", gap: 0 }}
//           >
//             <div className="close" onClick={() => setShowSharing(false)}>
//               <div></div>
//             </div>
//             <h4 className="box-marg-s">{t("AGB5vpj")}</h4>
//             {shareImgData && !showCopyURL && !showShareSocial && (
//               <ShareImg
//                 data={shareImgData}
//                 kind={kind}
//                 path={`${window.location.protocol}//${window.location.hostname}${path}`}
//                 isLoading={isLoading}
//                 setIsLoading={setIsLoading}
//               />
//             )}
//             {!(showCopyURL || showShareSocial) && (
//               <div
//                 className="fit-container fx-centered fx-col"
//                 style={{ columnGap: "30px" }}
//               >
//                 <div className="fx-centered fit-container">
//                   {!isMobile && (
//                     <button
//                       className="btn btn-normal btn-full fx-centered"
//                       onClick={() => setShowShareSocial(true)}
//                     >
//                       {t("AFnYfjs")}
//                     </button>
//                   )}
//                   <button
//                     className="btn btn-normal btn-full fx-centered"
//                     onClick={() =>
//                       isMobile ? handleSharingInMobile() : setShowCopyURL(true)
//                     }
//                   >
//                     {t("AahCFK4")}
//                   </button>
//                 </div>
//                 {shareImgData && (
//                   <button
//                     className={`btn btn-gray btn-full ${
//                       isLoading ? "flash" : "round-icon-tooltip"
//                     } fx-centered`}
//                     onClick={() => (isLoading ? null : convert())}
//                   >
//                     <div className="download-file"></div> {t("AxyxzkE")}
//                   </button>
//                 )}
//               </div>
//             )}
//             {showCopyURL && (
//               <div
//                 className="fit-container fx-centered fx-col fx-start-v  slide-up"
//                 style={{ maxWidth: "400px" }}
//               >
//                 <p className="c1-c p-left fit-container">{t("Aw5f61f")}</p>
//                 <div
//                   className={`fx-scattered if pointer fit-container dashed-onH`}
//                   style={{ borderStyle: "dashed" }}
//                   onClick={() =>
//                     copyLink(
//                       `${window.location.protocol}//${window.location.hostname}${path}`
//                     )
//                   }
//                 >
//                   <p className="p-one-line">{`${window.location.protocol}//${window.location.hostname}${path}`}</p>
//                   <div className="copy-24"></div>
//                 </div>
//                 <p className="c1-c p-left fit-container">{t("AezhEDd")}</p>
//                 <div
//                   className="fx-scattered if pointer dashed-onH fit-container"
//                   style={{ borderStyle: "dashed" }}
//                   onClick={() => copyLink(nostrURL)}
//                 >
//                   <p className="p-one-line">{nostrURL}</p>
//                   <div className="copy-24"></div>
//                 </div>
//                 <button
//                   className="btn btn-normal btn-full fx-centered"
//                   onClick={() => setShowCopyURL(false)}
//                 >
//                   <div className="arrow" style={{ rotate: "90deg" }}></div>
//                   {t("ATB2h6T")}
//                 </button>
//               </div>
//             )}
//             {showShareSocial && (
//               <div
//                 className="fit-container fx-centered fx-col fx-start-v  slide-up"
//                 style={{ maxWidth: "400px" }}
//               >
//                 <a
//                   className="twitter-share-button btn-gray btn btn-full fx-centered"
//                   href={`https://twitter.com/intent/tweet?text=${`${window.location.protocol}//${window.location.hostname}${path}`}`}
//                   target="_blank"
//                 >
//                   <div className="twitter-logo-24"></div> {t("AroZoen")}
//                 </a>
//                 <a
//                   href={`whatsapp://send?text=${`${window.location.protocol}//${window.location.hostname}${path}`}`}
//                   data-action="share/whatsapp/share"
//                   target="_blank"
//                   className="twitter-share-button fit-container"
//                 >
//                   <button className="btn btn-gray btn-full fx-centered">
//                     <div className="whatsapp-icon-24"></div> WhatsApp
//                   </button>
//                 </a>
//                 <a
//                   href={`https://www.linkedin.com/shareArticle?mini=true&url=${`${
//                     window.location.protocol
//                   }//${"yakihonne.com"}${path}`}&title=${title}&summary=${description}&source=${"https://yakihonne.com"}`}
//                   data-action="share/whatsapp/share"
//                   target="_blank"
//                   className="twitter-share-button fit-container"
//                 >
//                   <button className="btn btn-gray btn-full fx-centered">
//                     <div className="in-icon-24"></div> LinkedIn
//                   </button>
//                 </a>
//                 <button
//                   className="btn btn-normal btn-full fx-centered"
//                   onClick={() => setShowShareSocial(false)}
//                 >
//                   <div className="arrow" style={{ rotate: "90deg" }}></div>
//                   {t("ATB2h6T")}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       <div
//         className={label ? "fx-centered fx-start-h fit-container" : "round-icon-tooltip"}
//         data-tooltip={t("AGB5vpj")}
//         onClick={handleSharing}
//       >
//         <div className="share-v2"></div>
//         {label && <p>{label}</p>}
//       </div>
//     </>
//   );
// }

// const ShareImg = ({ data, kind, path, setIsLoading }) => {
//   const { t } = useTranslation();
//   const followersCountSL = useSelector((state) => state.followersCountSL);
//   const [ppBase64, setPpBase64] = useState(data.author.picture || "");
//   const [thumbnailBase64, setThumbnailBase64] = useState(data.post.image || "");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         let [_pp, _thumbnail] = await Promise.all([
//           axiosInstance.post("/api/v1/url-to-base64", {
//             images: [data.author.picture],
//           }),
//           axiosInstance.post("/api/v1/url-to-base64", {
//             images: [data.post.image],
//           }),
//         ]);
//         setIsLoading(false);
//         setThumbnailBase64(_thumbnail.data[0] || data.post.image);
//         setPpBase64(_pp.data[0] || data.author.picture);
//       } catch (err) {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const getBG = () => {
//     if (data.label.toLowerCase() === "flash news") return kind1BG.fn;
//     if (data.label.toLowerCase() === "uncensored note") return kind1BG.un;
//     if (data.label.toLowerCase() === "buzz feed") return kind1BG.bf;
//     if (data.label.toLowerCase() === "note") return kind1BG.nt;
//   };

//   if (kind === 1)
//     return (
//       <div
//         className="box-pad-h box-pad-v fx-centered fx-col "
//         id="to-print"
//         style={{ width: "380px", maxHeight: "600px", minHeight: "400px" }}
//       >
//         <div
//           className="fit-container fx-centered fx-col sc-s-18"
//           style={{
//             border: "none",
//             height: "100%",
//             position: "relative",
//             rowGap: 0,
//             background: getBG(),
//           }}
//         >
//           <div>
//             <div
//               className="yakihonne-logo"
//               style={{
//                 width: "128px",
//                 height: "60px",
//                 filter: "brightness(0) invert()",
//               }}
//             ></div>
//           </div>
//           <div style={{ backgroundColor: "white" }} className="fit-container">
//             <div className="fit-container box-pad-h-m box-pad-v-m ">
//               <p
//                 style={{
//                   color: "black",
//                   maxHeight: "250px",
//                   overflow: "hidden",
//                 }}
//                 className=" p-medium gray-c"
//               >
//                 {data.post.content}
//               </p>
//               <p style={{ color: "black" }}>...</p>
//               {data.post.description && (
//                 <p className="p-three-lines p-medium gray-c">
//                   {data.post.description}
//                 </p>
//               )}
//               {thumbnailBase64 && (
//                 <div
//                   className="fit-container bg-img cover-bg sc-s-18"
//                   style={{
//                     aspectRatio: "16/9",
//                     margin: ".5rem auto",
//                     backgroundImage: `url(${thumbnailBase64})`,
//                   }}
//                 ></div>
//               )}
//               {data.extra && data.extra.is_sealed && (
//                 <div style={{ marginTop: ".5rem" }} className="fit-container">
//                   <UN
//                     data={JSON.parse(data.extra.content)}
//                     state="sealed"
//                     scaled={true}
//                     setTimestamp={() => null}
//                     flashNewsAuthor={data.author.pubkey}
//                     sealedCauses={data.extra.tags
//                       .filter((tag) => tag[0] === "cause")
//                       .map((cause) => cause[1])}
//                   />
//                 </div>
//               )}
//               {data.extra && !data.extra.is_sealed && (
//                 <div style={{ marginTop: ".5rem" }} className="fit-container">
//                   <div
//                     className="fit-container sc-s-18 fx-centered fx-col"
//                     style={{ rowGap: 0, overflow: "visible" }}
//                   >
//                     <div className="fit-container  box-pad-h-m box-pad-v-s">
//                       <div className="fit-container fx-scattered">
//                         <div className="fx-centered fit-container ">
//                           <p className="p-bold p-medium green-c">
//                             {t("ABgVYCn")}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <hr />
//                     <div
//                       className="fit-container fx-centered box-pad-h-m box-pad-v-s"
//                       style={{ rowGap: "0px" }}
//                     >
//                       <p className="p-medium p-centered">{t("ASm8U6V")}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div style={{ height: "50px" }}></div>
//             <div className="fx-centered fx-start-h box-pad-h-m box-pad-v-s ">
//               <UserProfilePic
//                 mainAccountUser={false}
//                 size={24}
//                 img={ppBase64}
//                 allowClick={false}
//               />
//               <div>
//                 <p className="p-small" style={{ color: "black" }}>
//                   {t("AsXpL4b", {
//                     name:
//                       data.author.display_name ||
//                       data.author.name ||
//                       getBech32("npub", data.author.pubkey).substring(0, 10),
//                   })}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="fit-container box-pad-h-m box-pad-v-s">
//             <p className="p-bold" style={{ color: "white" }}>
//               {data.label}
//             </p>
//             <p style={{ color: "white" }} className="p-medium">
//               <Date_
//                 toConvert={new Date(data.post.created_at * 1000)}
//                 time={true}
//               />
//             </p>
//           </div>
//           <div
//             className="fx-centered"
//             style={{ position: "absolute", right: "8px", bottom: "8px" }}
//           >
//             <div
//               className="fx-centered fx-col box-pad-h-s box-pad-v-s sc-s-18"
//               style={{ background: "white", border: "none" }}
//             >
//               <QRCode value={path} size={100} />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   if (kind === 0)
//     return (
//       <div className="box-pad-h box-pad-v fx-centered fx-col" id="to-print">
//         <div
//           className="fx-centered fx-col fx-end-h fx-end-h sc-s-18"
//           style={{
//             width: "380px",
//             height: "600px",
//             border: "none",
//             position: "relative",
//           }}
//         >
//           <div
//             className="fx-centered sc-s-18 bg-img cover-bg fit-container"
//             style={{
//               position: "absolute",
//               left: 0,
//               top: 0,
//               zIndex: 0,
//               height: "100%",
//               border: "none",
//               backgroundImage: `url(${thumbnailBase64})`,
//               filter: "blur(10px) brightness(70%)",
//             }}
//           ></div>
//           <div
//             className="sc-s-18 fx-scattered fx-col"
//             style={{
//               backgroundColor: "white",
//               width: "90%",
//               // height: "80%",
//               aspectRatio: "1/1",
//               position: "relative",
//               overflow: "visible",
//               zIndex: 1,
//               rowGap: 0,
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 left: "50%",
//                 top: "-49px",
//                 transform: "translateX(-50%)",
//               }}
//             >
//               <UserProfilePic
//                 mainAccountUser={false}
//                 size={98}
//                 img={ppBase64}
//                 allowClick={false}
//               />
//             </div>
//             <div
//               className="fit-container fx-centered fx-col box-pad-h-m "
//               style={{ padding: "4.5rem 1rem 1rem" }}
//             >
//               <h4 className="p-one-line" style={{ color: "black" }}>
//                 {data.author.display_name || data.author.name}
//               </h4>
//               <p className="gray-c p-three-lines p-medium p-centered box-pad-h-m">
//                 {data.author.about}
//               </p>
//               {data.author.nip05 && (
//                 <div className="fx-centered  box-pad-h-m">
//                   <p className="orange-c p-medium p-centered">
//                     {data.author.nip05}
//                   </p>
//                   <div className="checkmark-c1"></div>
//                 </div>
//               )}
//             </div>
//             <hr style={{ margin: 0 }} />
//             <div className="fit-container fx-centered  box-pad-h-m box-pad-v-s">
//               <div className="fx-centered">
//                 <p style={{ color: "black" }}>{data.followings}</p>
//                 <p className="p-medium gray-c">{t("A9TqNxQ")}</p>
//               </div>
//               <div className="fx-centered">
//                 <p style={{ color: "black" }}>{followersCountSL.length}</p>
//                 <p className="p-medium gray-c">{t("A6huCnT")}</p>
//               </div>
//             </div>
//             <hr />
//             <div
//               className="fx-scattered fx-stretch fit-container"
//               style={{ columnGap: 0, marginTop: "1rem" }}
//             >
//               <div style={{ width: "100%" }} className="fx-centered fx-col">
//                 <QRCode value={path} size={160} />
//               </div>
//             </div>

//             <div
//               className="fit-container fx-centered box-pad-h-m "
//               style={{ height: "50px" }}
//             >
//               <div>
//                 <div
//                   className="yakihonne-logo"
//                   style={{ width: "70px", filter: "brightness(0)" }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//           <div className="box-marg-s"></div>
//         </div>
//       </div>
//     );
//   if ([30023, 34235, 30004, 21, 22].includes(kind))
//     return (
//       <div
//         className="box-pad-h box-pad-v fx-centered fx-col"
//         id="to-print"
//         style={{ maxHeight: "70dvh" }}
//       >
//         <div
//           className="fx-centered sc-s-18"
//           style={{
//             width: "380px",
//             height: "600px",
//             border: "none",
//             position: "relative",
//           }}
//         >
//           <div
//             className="fx-centered sc-s-18 bg-img cover-bg fit-container"
//             style={{
//               position: "absolute",
//               left: 0,
//               top: 0,
//               zIndex: 0,
//               height: "100%",
//               border: "none",
//               backgroundImage: `url(${thumbnailBase64})`,
//               filter: "blur(10px) brightness(70%)",
//             }}
//           ></div>
//           <div
//             className="sc-s-18 fx-scattered fx-col"
//             style={{
//               backgroundColor: "white",
//               width: "90%",
//               // height: "80%",
//               aspectRatio: "1/1",
//               position: "relative",
//               zIndex: 1,
//               rowGap: 0,
//             }}
//           >
//             <div
//               className="fit-container fx-scattered box-pad-h-m "
//               style={{ height: "40px" }}
//             >
//               {kind === 30023 && (
//                 <div className="fx-centered">
//                   <div
//                     className="posts"
//                     style={{ filter: "brightness(0)" }}
//                   ></div>
//                   <p className="p-medium" style={{ color: "black" }}>
//                     Article
//                   </p>
//                 </div>
//               )}
//               {kind === 30004 && (
//                 <div className="fx-centered">
//                   <div
//                     className="curation"
//                     style={{ filter: "brightness(0)" }}
//                   ></div>
//                   <p className="p-medium" style={{ color: "black" }}>
//                     {t("Ac6UnVb")}
//                   </p>
//                 </div>
//               )}
//               {(kind === 34235 || kind === 21 || kind === 22) && (
//                 <div className="fx-centered">
//                   <div
//                     className="video"
//                     style={{ filter: "brightness(0)" }}
//                   ></div>
//                   <p className="p-medium" style={{ color: "black" }}>
//                     {t("AVdmifm")}
//                   </p>
//                 </div>
//               )}
//               <div className="fx-centered">
//                 <div className="fx-centered">
//                   <p className="p-medium" style={{ color: "black" }}>
//                     {data.likes}
//                   </p>
//                   <div
//                     className="heart"
//                     style={{ filter: "brightness(0)" }}
//                   ></div>
//                   <div
//                     className="like"
//                     style={{ filter: "brightness(0)", rotate: "-180deg" }}
//                   ></div>
//                   {(kind === 34235 || kind === 21 || kind === 22) && (
//                     <p className="p-medium" style={{ color: "black" }}>
//                       {t("AginxGR", { count: data.views })}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <hr style={{ margin: 0 }} />
//             <div
//               className="fx-scattered fx-stretch fit-container"
//               style={{ height: "260px", columnGap: 0 }}
//             >
//               <div style={{ width: "100%" }} className="fx-centered fx-col">
//                 <p
//                   style={{ color: "black" }}
//                   className="p-medium p-centered box-pad-h-m p-three-lines"
//                 >
//                   {data.post.title}
//                 </p>

//                 <p className="p-medium p-centered box-pad-h-m p-two-lines">
//                   {data.post.description}
//                 </p>
//                 <QRCode value={path} size={100} />
//                 {data.author.nip05 && (
//                   <p className="c1-c p-medium p-centered box-pad-h-m">
//                     yakihonne.com/profile/{data.author.nip05}
//                   </p>
//                 )}
//               </div>
//             </div>
//             <hr style={{ margin: 0 }} />
//             <div
//               className="fit-container fx-scattered box-pad-h-m "
//               style={{ height: "50px" }}
//             >
//               <div className="fx-centered">
//                 <UserProfilePic
//                   mainAccountUser={false}
//                   size={24}
//                   img={ppBase64}
//                   allowClick={false}
//                 />
//                 <div>
//                   <p className="p-small" style={{ color: "black" }}>
//                     {t("AsXpL4b", {
//                       name:
//                         data.author.display_name ||
//                         data.author.name ||
//                         getBech32("npub", data.post.author_pubkey).substring(
//                           0,
//                           10
//                         ),
//                     })}
//                   </p>
//                 </div>
//               </div>
//               <div>
//                 <div
//                   className="yakihonne-logo"
//                   style={{ width: "70px", filter: "brightness(0)" }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
// };
