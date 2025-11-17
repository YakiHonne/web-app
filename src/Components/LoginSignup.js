import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  bytesTohex,
  downloadAsFile,
  getBech32,
  getHex,
} from "@/Helpers/Encryptions";
import * as secp from "@noble/secp256k1";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { FilePicker } from "@/Components/FilePicker";
import UserProfilePic from "@/Components/UserProfilePic";
import { useDispatch, useSelector } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import axios from "axios";
import { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { FileUpload } from "@/Helpers/Helpers";
import { updateWallets } from "@/Helpers/ClientHelpers";
import { setUserKeys } from "@/Store/Slides/UserData";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { relaysOnPlatform } from "@/Content/Relays";
import LoadingDots from "@/Components/LoadingDots";
import { getUser, getUserFromNOSTR } from "@/Helpers/Controlers";
let profilePlaceholder = "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/profile-avatar.png";

export default function LoginSignup({ exit }) {
  const { t } = useTranslation();
  let sk = bytesTohex(generateSecretKey());
  let pk = getPublicKey(sk);
  let userKeys = { pub: pk, sec: sk };
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (
      navigator.userAgent.includes("Safari") &&
      !navigator.userAgent.includes("Chrome")
    ) {
      const main = document.querySelector("main");
      const nostrContainer = document.querySelector(
        ".main-page-nostr-container"
      );

      main.style.overflow = "visible";
      nostrContainer.style.overflowX = "visible";
    }

    return () => {
      const main = document.querySelector("main");
      const nostrContainer = document.querySelector(
        ".main-page-nostr-container"
      );

      main.style.overflow = "scroll";
      nostrContainer.style.overflowX = "hidden";
    };
  }, []);

  return (
    <div
      className="fixed-container fx-centered box-pad-h fx-end-h"
      onClick={(e) => {
        e.stopPropagation();
        exit();
      }}
    >
      <div
        className="sc-s-18 bg-sp box-pad-h box-pad-v fx-scattered fx-col slide-right"
        style={{
          width: "min(100%, 450px)",
          position: "relative",
          height: "95%",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="close" onClick={exit}>
          <div></div>
        </div>
        <div className="yakihonne-logo" style={{ width: "128px" }}></div>
        <div className="fit-container fx-centered fx-col">
          <div className="box-marg-s">
            {isLogin && <h4>{t("AITU9z0")}</h4>}
            {!isLogin && <h4>{t("AHXrr4Y")}</h4>}
          </div>
          {isLogin && (
            <LoginScreen
              switchScreen={() => setIsLogin(!isLogin)}
              userKeys={userKeys}
              exit={exit}
            />
          )}

          {!isLogin && (
            <SignupScreen
              switchScreen={() => setIsLogin(!isLogin)}
              userKeys={userKeys}
              exit={exit}
            />
          )}
        </div>
        <div style={{ height: "5vh" }}></div>
      </div>
    </div>
  );
}

const LoginScreen = ({ switchScreen, exit }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [key, setKey] = useState("");
  const [checkExt, setCheckExt] = useState(window.nostr ? true : false);
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async (inputKey) => {
    if (!inputKey) return;
    setIsLoading(true);
    if (inputKey.startsWith("npub")) {
      try {
        let hex = getHex(inputKey);
        let user = await getUserFromNOSTR(hex);
        if (user) {
          let keys = {
            pub: hex,
          };
          dispatch(setUserKeys(keys));
        }
        setIsLoading(false);
        exit();
        //   customHistory.back();
        return;
      } catch (err) {
        setIsLoading(false);
        dispatch(
          setToast({
            type: 2,
            desc: t("AiHLMRi"),
          })
        );
      }
    }
    if (inputKey.startsWith("nsec")) {
      try {
        let hex = getHex(inputKey);
        if (secp.utils.isValidPrivateKey(hex)) {
          let user = await getUserFromNOSTR(getPublicKey(hex));
          if (user) {
            let keys = {
              sec: hex,
              pub: getPublicKey(hex),
            };

            dispatch(setUserKeys(keys));
          }
          setIsLoading(false);
          exit();
          // customHistory.back();
          return;
        }
      } catch (err) {
        setIsLoading(false);
        dispatch(
          setToast({
            type: 2,
            desc: t("AC5ByUA"),
          })
        );
      }
    }
    if (secp.utils.isValidPrivateKey(inputKey)) {
      let user = await getUserFromNOSTR(getPublicKey(inputKey));
      if (user) {
        let keys = {
          sec: inputKey,
          pub: getPublicKey(inputKey),
        };

        dispatch(setUserKeys(keys));
      }
      setIsLoading(false);
      exit();
      // customHistory.back();
      return;
    }
    setIsLoading(false);
    dispatch(
      setToast({
        type: 2,
        desc: t("AC5ByUA"),
      })
    );
  };
  const onLoginWithExt = async () => {
    try {
      setIsLoading(true);

      let key = await window.nostr.getPublicKey();
      let keys = {
        pub: key,
        ext: true,
      };
      let extWallet = [
        {
          id: Date.now(),
          kind: 1,
          entitle: "WebLN",
          active: true,
          data: "",
        },
      ];
      let wallet = updateWallets(extWallet, keys.pub);

      if (wallet.length > 0) dispatch(setUserKeys(keys));

      // }
      setIsLoading(false);
      exit();
      // customHistory.back();
      return;
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      dispatch(
        setToast({
          type: 2,
          desc: t("AiHLMRi"),
        })
      );
    }
  };

  return (
    <>
      <div className="fit-container slide-down">
        <input
          type="text"
          className="if ifs-full box-marg-s"
          placeholder="npub, nsec, hex"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />

        <div className="fx-centered fx-col fit-container">
          <button
            className="btn btn-normal btn-full"
            onClick={() => onLogin(key)}
          >
            {isLoading ? <LoadingDots /> : <>{t("AmOtzoL")}</>}
          </button>
          {checkExt && (
            <>
              <p>{t("Ax46s4g")}</p>
              <button
                className="btn btn-gst btn-full"
                disabled={!checkExt}
                onClick={onLoginWithExt}
              >
                {isLoading ? <LoadingDots /> : <>{t("AgG7T1H")}</>}
              </button>
            </>
          )}
          {!checkExt && (
            <button className="btn btn-disabled btn-full" disabled={true}>
              <>{t("AgG7T1H")}</>
            </button>
          )}
        </div>
        <div
          className="fit-container  box-pad-v-m fx-centered"
          onClick={switchScreen}
        >
          <p className="gray-c">
            <span className="orange-c pointer p-bold">{t("AHXrr4Y")}</span>{" "}
          </p>
        </div>
      </div>
    </>
  );
};

const SignupScreen = ({ switchScreen, userKeys, exit }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [pictureFile, setPictureFile] = useState("");
  const [picture, setPicture] = useState("");
  const [bannerFile, setBannerFile] = useState("");
  const [banner, setBanner] = useState("");
  const [NWCAddr, setNWCAddr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingWalletLoading, setIsCreatingWalletLoading] = useState(false);
  const [showErrorMessage, setShowMessageError] = useState(false);
  const [showInvalidMessage, setShowInvalidMessage] = useState(false);
  const [showEmptyUNMessage, setShowMessageEmtpyUN] = useState(false);
  const [userName, setUserName] = useState("");
  const [enableWalletLinking, setEnablingWalletLinking] = useState(true);

  const handleCreateWallet = async () => {
    try {
      if (isCreatingWalletLoading || showInvalidMessage) return;
      if (!userName) {
        setShowMessageEmtpyUN(true);
        return false;
      }
      setIsCreatingWalletLoading(true);
      let url = await axios.post("https://wallet.yakihonne.com/api/wallets", {
        username: userName?.toLowerCase(),
      });
      setNWCAddr(url.data.lightningAddress);
      let toSave = [
        `Wallet Address: ${url.data.lightningAddress}`,
        `Wallet NWC secret: ${url.data.connectionSecret}`,
      ];
      setIsCreatingWalletLoading(false);
      return {
        toSave,
        NWCURL: url.data.connectionSecret,
        NWCAddr: url.data.lightningAddress,
      };
    } catch (err) {
      console.log(err);
      setIsCreatingWalletLoading(false);
      if (err.response.status) {
        setShowMessageError(true);
      } else
        dispatch(
          setToast({
            type: 3,
            desc: t("AQ12OQz"),
          })
        );
      return false;
    }
  };

  const initializeAccount = async () => {
    try {
      if (!name) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AdrCWCj"),
          })
        );
        return;
      }
      let isWalletCreated = enableWalletLinking
        ? await handleCreateWallet()
        : { toSave: [] };
      if (enableWalletLinking && isWalletCreated.toSave.length === 0) return;
      setIsLoading(true);
      let picture_ = pictureFile
        ? await FileUpload(pictureFile, userKeys)
        : "";
      if (picture_ === false) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AfM6xbs"),
          })
        );

        return;
      }
      let banner_ = bannerFile
        ? await FileUpload(bannerFile, userKeys)
        : "";
      if (banner_ === false) {
        dispatch(
          setToast({
            type: 2,
            desc: t("AnmPNHc"),
          })
        );
        setIsLoading(false);
        return;
      }

      dispatch(setUserKeys(userKeys));
      let toSave = [
        "Important: Store this information securely. If you lose it, recovery may not be possible. Keep it private and protected at all times",
        "---",
        `Private key: ${getBech32("nsec", userKeys.sec)}`,
        `Public key: ${getBech32("npub", userKeys.pub)}`,
      ];
      downloadAsFile(
        [...toSave, ...isWalletCreated?.toSave].join("\n"),
        "text/plain",
        `account-credentials.txt`,
        t("AdoWp0E"),
        false
      );

      let signer = new NDKPrivateKeySigner(userKeys.sec);
      ndkInstance.signer = signer;

      await Promise.all([
        warmup(),
        metadataEvent(picture_, banner_, isWalletCreated?.NWCAddr),
        relaysEvent(),
      ]);

      if (isWalletCreated?.NWCAddr) {
        let nwcNode = {
          id: Date.now(),
          kind: 3,
          entitle: NWCAddr,
          active: true,
          data: isWalletCreated?.NWCURL,
        };
        updateWallets([nwcNode], userKeys.pub);
      }
      setIsLoading(false);
      exit();
      //   customHistory.back();
    } catch (err) {
      setIsLoading(false);
      console.log(err);
    }
  };

  const warmup = () => {
    const tempEvent = new NDKEvent(ndkInstance);
    tempEvent.kind = 0;
    tempEvent.content = "";
    tempEvent.publish();
    return;
  };
  const metadataEvent = async (profilePicture, bannerPicture, walletAddr) => {
    try {
      const ndkEvent = new NDKEvent(ndkInstance);
      let metadata = {};

      metadata.display_name = name;
      metadata.name = name;
      metadata.about = about;
      metadata.picture = profilePicture || "";
      metadata.banner = bannerPicture || "";
      if (walletAddr && enableWalletLinking) metadata.lud16 = walletAddr;
      ndkEvent.kind = 0;
      ndkEvent.content = JSON.stringify(metadata);
      let published = await ndkEvent.publish(undefined, 2000);

      return ndkEvent;
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const relaysEvent = async () => {
    try {
      let relaysTags = relaysOnPlatform.map((relay) => ["r", relay]);
      const ndkRelaysEvent = new NDKEvent(ndkInstance);
      ndkRelaysEvent.kind = 10002;
      ndkRelaysEvent.content = "";
      ndkRelaysEvent.tags = relaysTags;

      let published = await ndkRelaysEvent.publish(undefined, 2000);

      return;
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const handleInputField = (e) => {
    let value = e.target.value;
    let isValid = /^[a-zA-Z0-9]+$/.test(value);
    if (showErrorMessage) setShowMessageError(false);
    if (showEmptyUNMessage) setShowMessageEmtpyUN(false);
    if (!value || (isValid && showInvalidMessage)) setShowInvalidMessage(false);
    if (value && !isValid && !showInvalidMessage) setShowInvalidMessage(true);
    setUserName(value);
  };

  return (
    <>
      <div
        className="fit-container slide-up"
        style={{
          backgroundColor: "transparent",
        }}
      >
        <div
          className="fit-container fx-centered box-pad-v-s fx-start-h fx-end-v"
          style={{
            height: "150px",
            position: "relative",
            pointerEvents:
              isCreatingWalletLoading || isLoading ? "none" : "auto",
            cursor: isCreatingWalletLoading || isLoading ? "not-allowed" : "",
          }}
        >
          <div
            className="fit-container bg-img cover-bg sc-s-18"
            style={{
              backgroundImage: `url(${banner})`,
              height: "70%",
              zIndex: 0,
              position: "absolute",
              left: 0,
              top: 0,
              borderBottom: "1px solid var(--very-dim-gray)",
              border: "none",
            }}
          ></div>
          <div
            className="fx-centered pointer"
            style={{
              position: "absolute",
              right: "16px",
              top: "16px",
            }}
          >
            {!banner && (
              <FilePicker
                element={
                  <div className="fx-centered sticker  sticker-gray-gray">
                    {t("A1HsCqp")}
                    <div className="plus-sign"></div>
                  </div>
                }
                setFile={(data) => {
                  setBannerFile(data.file);
                  setBanner(data.url);
                }}
              />
            )}

            {banner && (
              <div
                className="close"
                onClick={() => setBanner("")}
                style={{ position: "static" }}
              >
                <div></div>
              </div>
            )}
          </div>
          <FilePicker
            element={
              <div className="fit-container fx-col fx-centered box-pad-h">
                <div
                  style={{
                    border: "6px solid var(--white)",
                    borderRadius: "var(--border-r-50)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className="settings-profile-pic"
                >
                  <div
                    style={{
                      backgroundImage: `url(${picture || profilePlaceholder})`,
                      border: "none",
                      minWidth: "100px",
                      aspectRatio: "1/1",
                      borderRadius: "50%",
                    }}
                    className="bg-img cover-bg sc-s"
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                      zIndex: 1,
                      backgroundColor: "rgba(0,0,0,.8)",
                    }}
                    className="fx-centered pointer toggle fx-col"
                  >
                    <div
                      className="image-24"
                      style={{ filter: "invert()" }}
                    ></div>
                    <p className="gray-c">{t("AnD39Ci")}</p>
                  </div>
                </div>
              </div>
            }
            setFile={(data) => {
              setPictureFile(data.file);
              setPicture(data.url);
            }}
          />
        </div>
        <div className="fit-container fx-centered fx-col">
          <input
            type="text"
            className="if ifs-full "
            placeholder={t("At0Sp8H")}
            value={name}
            onChange={(e) => {
              userName === name && setUserName(e.target.value);
              setName(e.target.value);
            }}
            disabled={isCreatingWalletLoading || isLoading}
          />
          <textarea
            className="txt-area if ifs-full "
            placeholder={t("ARTqPc0")}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            disabled={isCreatingWalletLoading || isLoading}
          />
        </div>

        <div className=" fx-centered box-pad-v-s fx-start-v fx-col">
          {!NWCAddr && (
            <label
              className="if ifs-full fx-centered fx-start-h"
              htmlFor="wallet-checkbox"
            >
              <input
                type="checkbox"
                value={enableWalletLinking}
                onChange={() => setEnablingWalletLinking(!enableWalletLinking)}
                checked={enableWalletLinking}
                name="wallet-checkbox"
                id="wallet-checkbox"
                disabled={isCreatingWalletLoading || isLoading}
              />

              <p className="p-centered gray-c" style={{ maxWidth: "400px" }}>
                {t("AOxmFz5")}
              </p>
            </label>
          )}

          {!NWCAddr && enableWalletLinking && (
            <div
              className={`fit-container fit-container fx-centered fx-col ${
                isCreatingWalletLoading ? "flash" : ""
              }`}
            >
              <div className="fit-container fx-centered">
                <input
                  type="text"
                  className="ifs-full if"
                  placeholder={t("ALCpv2S")}
                  value={userName}
                  onChange={handleInputField}
                  style={{
                    borderColor:
                      showErrorMessage ||
                      showEmptyUNMessage ||
                      showInvalidMessage
                        ? "var(--red-main)"
                        : "",
                  }}
                  disabled={isCreatingWalletLoading || isLoading}
                />
                <p className="gray-c p-big" style={{ minWidth: "max-content" }}>
                  @wallet.yakihonne.com
                </p>
              </div>
              {showErrorMessage && (
                <div className="fit-container box-pad-h-m">
                  <p className="red-c p-medium">{t("AgrHddv")}</p>
                </div>
              )}
              {showEmptyUNMessage && (
                <div className="fit-container box-pad-h-m">
                  <p className="red-c p-medium">{t("AhQtS0K")}</p>
                </div>
              )}
              {showInvalidMessage && (
                <div className="fit-container box-pad-h-m">
                  <p className="red-c p-medium">{t("AqSxggD")}</p>
                </div>
              )}
            </div>
          )}
          {NWCAddr && (
            <div className="fx-centered sc-s-18 box-pad-h-s box-pad-v-s fit-container">
              <div className="bolt"></div>
              {NWCAddr}
            </div>
          )}
          {/* {NWCURL && (
            <>
              <label className=" fx-centered" htmlFor="wallet-checkbox">
                <input
                  type="checkbox"
                  value={enableWalletLinking}
                  onChange={() =>
                    setEnablingWalletLinking(!enableWalletLinking)
                  }
                  checked={enableWalletLinking}
                  name="wallet-checkbox"
                  id="wallet-checkbox"
                />
                {t("AoR0AIr")}
              </label>
              <p className="p-centered gray-c">{t("Ag7XtTn")}</p>
            </>
          )} */}
        </div>
        <button
          className="btn btn-normal btn-full"
          onClick={initializeAccount}
          disabled={isCreatingWalletLoading || isLoading}
        >
          {isCreatingWalletLoading || isLoading ? (
            <LoadingDots />
          ) : (
            t("AHXrr4Y")
          )}
        </button>
      </div>
      <div
        className="fx-centered  fit-container"
        onClick={isCreatingWalletLoading || isLoading ? null : switchScreen}
      >
        <p className="gray-c">
          {t("AKJqtlx")}{" "}
          <span className="orange-c pointer p-bold">{t("AmOtzoL")}</span>{" "}
        </p>
      </div>
    </>
  );
};

const ProfilePreview = ({ pubkeys }) => {
  let nostrAuthors = useSelector((state) => state.nostrAuthors);
  let [images, setImages] = useState(pubkeys);

  useEffect(() => {
    try {
      let authors = [];
      for (let author of pubkeys) {
        let pubkey = getHex(author);
        let auth = getUser(pubkey);
        if (auth) authors.push(auth.picture);
        else authors.push("");
      }
      setImages(authors);
    } catch (err) {
      console.log(err);
    }
  }, [nostrAuthors]);

  return (
    <div style={{ position: "relative", minWidth: "32px", minHeight: "32px" }}>
      <div style={{ position: "absolute", left: 0, bottom: "0" }}>
        <UserProfilePic
          user_id={pubkeys[0]}
          mainAccountUser={false}
          img={images[0] || ""}
          size={10}
        />
      </div>
      <div style={{ position: "absolute", left: "16px", top: "10px" }}>
        <UserProfilePic
          user_id={pubkeys[1]}
          mainAccountUser={false}
          img={images[1] || ""}
          size={8}
        />
      </div>
      <div style={{ position: "absolute", left: "16px", bottom: "-4px" }}>
        <UserProfilePic
          user_id={pubkeys[2]}
          mainAccountUser={false}
          img={images[2] || ""}
          size={12}
        />
      </div>
    </div>
  );
};
