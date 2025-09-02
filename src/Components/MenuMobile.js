import React, { useEffect, useRef, useState } from "react";
import ShortenKey from "@/Components/ShortenKey";
import UserProfilePic from "@/Components/UserProfilePic";
import { getBech32, minimizeKey } from "@/Helpers/Encryptions";
import { nip19 } from "nostr-tools";
import { useMemo } from "react";
import WriteNew from "@/Components/WriteNew";
import { getConnectedAccounts } from "@/Helpers/ClientHelpers";
import { redirectToLogin } from "@/Helpers/Helpers";
import { useSelector } from "react-redux";
import {
  handleSwitchAccount,
  logoutAllAccounts,
  userLogout,
} from "@/Helpers/Controlers";
import { customHistory } from "@/Helpers/History";
import YakiMobileappSidebar from "@/Components/YakiMobileappSidebar";
import { useTranslation } from "react-i18next";
import NotificationCenter from "./SideBar/NotificationCenter";

export default function MenuMobile({ toggleLogin, exit }) {
  const userMetadata = useSelector((state) => state.userMetadata);
  const userKeys = useSelector((state) => state.userKeys);
  const userChatrooms = useSelector((state) => state.userChatrooms);

  const isNewMsg = useMemo(() => {
    return userChatrooms.find((chatroom) => !chatroom.checked);
  }, [userChatrooms]);
  const [pubkey, setPubkey] = useState(
    userKeys.pub ? getBech32("npub", userKeys.pub) : ""
  );
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [showMyContent, setShowMyContent] = useState(false);
  const [showWritingOptions, setShowWritingOptions] = useState(false);

  const accounts = useMemo(() => {
    return getConnectedAccounts();
  }, [userKeys, userMetadata]);
  const settingsRef = useRef(null);
  const myContentRef = useRef(null);
  const writingOpt = useRef(null);
  useEffect(() => {
    userKeys.pub ? setPubkey(getBech32("npub", userKeys.pub)) : setPubkey("");
  }, [userKeys]);

  useEffect(() => {
    const handleOffClick = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target))
        setShowSettings(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [settingsRef]);
  useEffect(() => {
    const handleOffClick = (e) => {
      if (myContentRef.current && !myContentRef.current.contains(e.target))
        setShowMyContent(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [myContentRef]);
  useEffect(() => {
    const handleOffClick = (e) => {
      if (writingOpt.current && !writingOpt.current.contains(e.target))
        setShowWritingOptions(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [writingOpt]);

  const isPage = (url) => {
    if (url === window.location.pathname) return true;
    return false;
  };
  const dismiss = () => {
    setDismissed(true);
    setTimeout(() => {
      exit();
    }, [600]);
  };

  return (
    <div className={`menu-login ${dismissed ? "dismiss" : "slide-right"}`}>
      <div
        className="fit-container fx-centered fx-start-h sticky"
        onClick={dismiss}
      >
        <div className="close-button">
          <div className="arrow" style={{ rotate: "-90deg" }}></div>
        </div>
      </div>

      {!userMetadata && (
        <>
          <div className="fit-container fx-scattered">
            <h4>{t("AXsKX9G")}</h4>
            <button className="btn btn-normal" onClick={toggleLogin}>
              {t("AmOtzoL")}
            </button>
          </div>
          <hr style={{ margin: "1rem 0" }} />
        </>
      )}
      {userMetadata && (
        <div
          className="fx-centered fx-start-h box-pad-v fit-container"
          style={{ columnGap: "16px" }}
        >
          <UserProfilePic size={32} mainAccountUser={true} allowClick={true} />
          <div className="fx-centered fx-start-h fx-start-v">
            <p>{userMetadata.name || minimizeKey(pubkey)}</p>
            <ShortenKey id={pubkey} />
          </div>
        </div>
      )}
      <div className="fx-scattered fx-col" style={{ rowGap: "8px" }}>
        <div
          onClick={() => {
            customHistory("/");
            dismiss();
          }}
          className={`fx-scattered fit-container fx-start-h pointer box-pad-h-s box-pad-v-s ${
            isPage("/") ? "active-link" : "inactive-link"
          }`}
        >
          <div className="home-24"></div>
          <div className="p-big">{t("AJDdA3h")}</div>
        </div>
        <div
          onClick={() => {
            customHistory("/discover");
            dismiss();
          }}
          className={`fx-scattered fit-container fx-start-h pointer box-pad-h-s box-pad-v-s ${
            isPage("/discover") ? "active-link" : "inactive-link"
          }`}
        >
          <div className="posts-24"></div>
          <div className="p-big">{t("ABSoIm9")}</div>
        </div>
        {/* <div
          onClick={() => {
            customHistory("/articles");
            dismiss();
          }}
          className={`fx-scattered fit-container fx-start-h pointer box-pad-h-s box-pad-v-s ${
            isPage("/articles") ? "active-link" : "inactive-link"
          }`}
        >
          <div className="posts-24"></div>
          <div className="p-big">{t("AesMg52")}</div>
        </div> */}

        <div
          onClick={() => {
            customHistory("/smart-widgets");
            dismiss();
          }}
          className={`fx-scattered fit-container fx-start-h pointer box-pad-h-s box-pad-v-s ${
            isPage("/smart-widgets") ? "active-link" : "inactive-link"
          }`}
        >
          <div className="smart-widget-24"></div>
          <div className="p-big">{t("AkvXmyz")}</div>
        </div>
        <div
          onClick={() => {
            customHistory("/messages");
            dismiss();
          }}
          className={`pointer fit-container fx-scattered box-pad-h-s box-pad-v-s ${
            isPage("/messages") ? "active-link" : "inactive-link"
          }`}
        >
          <div className="fx-centered">
            <div className="env-24"></div>
            <div className="link-labe p-big">{t("As2zi6P")}</div>
          </div>
          {isNewMsg && (
            <div
              style={{
                minWidth: "8px",
                aspectRatio: "1/1",
                backgroundColor: "var(--red-main)",
                borderRadius: "var(--border-r-50)",
              }}
            ></div>
          )}
        </div>
        <NotificationCenter dismiss={dismiss} mobile={true} />
        {userKeys && (
          <div
            className="fit-container fx-centered fx-col fx-end-v"
            style={{
              position: "relative",
            }}
          >
            <div
              className={`pointer fit-container fx-scattered box-pad-h-s box-pad-v-s ${
                isPage("/dashboard") ? "active-link" : "inactive-link"
              }`}
              onClick={() => {
                customHistory("/dashboard");
                dismiss();
              }}
            >
              <div className="fx-centered">
                <div
                  className={
                    isPage("/dashboard") ? "dashboard-bold-24" : "dashboard-24"
                  }
                ></div>
                <div className="link-label p-big">Dashboard</div>
              </div>
            </div>
          </div>
        )}
        <YakiMobileappSidebar />
        {userKeys && <WriteNew exit={dismiss} />}
      </div>
      {userMetadata && (
        <>
          <div className="box-pad-v-s"></div>
          <div className="fit-container fx-centered fx-start-v fx-col pointer">
            <div
              className="fx-centered fx-col fx-start-v fit-container"
              style={{ rowGap: "8px" }}
            >
              <div
                className="fit-container fx-centered fx-start-h  box-pad-v-s  box-pad-h-s"
                onClick={() => {
                  customHistory(
                    `/profile/${nip19.nprofileEncode({ pubkey: userKeys.pub })}`
                  );
                  dismiss();
                }}
              >
                <div className="user-24"></div>
                <p className="p-big">{t("AyBBPWE")}</p>
              </div>
              <div
                className="fit-container fx-centered fx-start-h  box-pad-v-s  box-pad-h-s"
                onClick={() => customHistory(`/yaki-points`)}
              >
                <div className="cup-24"></div>
                <p className="p-big">{t("ABsx3n9")}</p>
              </div>
              <div
                className="fit-container fx-centered fx-start-h  box-pad-v-s  box-pad-h-s"
                onClick={() => {
                  customHistory(`/settings`);
                  dismiss();
                }}
              >
                <div className="setting-24"></div>
                <p className="p-big">{t("ABtsLBp")}</p>
              </div>
            </div>
            <div
              className="fit-container fx-centered fx-start-h box-pad-v-s  box-pad-h-s"
              onClick={() => {
                userLogout(userKeys.pub);
              }}
            >
              <div className="logout-24"></div>
              <p className="fx-centered p-big">
                {t("AyXwdfE")}
                <span className="sticker sticker-normal sticker-orange-side">
                  {userMetadata.name ||
                    userMetadata.display_name ||
                    minimizeKey(userKeys.pub)}
                </span>
              </p>
            </div>
          </div>
          <hr style={{ margin: "1rem 0" }} />
          <div className="fit-container fx-centered fx-col box-pad-h-s box-pad-v-s">
            <div className="fit-container">
              <p className="gray-c">{t("AT2OPkx")}</p>
            </div>
            <div className="fit-container">
              {accounts.map((account) => {
                return (
                  <div
                    className="fit-container sc-s-18 box-pad-h-s box-pad-v-s fx-scattered option pointer"
                    style={{
                      backgroundColor:
                        userKeys.pub !== account.pubkey
                          ? "transparent"
                          : "var(--dim-gray)",
                      border: "none",
                      borderRadius: "10px",
                    }}
                    key={account.pubkey}
                    onClick={() => {
                      handleSwitchAccount(account);
                      setShowSettings(false);
                      dismiss();
                    }}
                  >
                    <div className="fx-centered">
                      <div style={{ pointerEvents: "none" }}>
                        <UserProfilePic
                          size={32}
                          mainAccountUser={false}
                          img={account.picture}
                          allowClick={false}
                        />
                      </div>
                      <div>
                        <p className="p-one-line">
                          {account.display_name ||
                            account.name ||
                            minimizeKey(userKeys.pub)}
                        </p>
                        <p className="gray-c p-medium p-one-line">
                          @
                          {account.name ||
                            account.display_name ||
                            minimizeKey(account.pubkey)}
                        </p>
                      </div>
                    </div>
                    <div>
                      {userKeys.pub !== account.pubkey && (
                        <div
                          className="fx-centered"
                          style={{
                            border: "1px solid var(--gray)",
                            borderRadius: "var(--border-r-50)",
                            minWidth: "14px",
                            aspectRatio: "1/1",
                          }}
                        ></div>
                      )}
                      {userKeys.pub === account.pubkey && (
                        <div
                          className="fx-centered"
                          style={{
                            borderRadius: "var(--border-r-50)",
                            backgroundColor: "var(--orange-main)",
                            minWidth: "14px",
                            aspectRatio: "1/1",
                          }}
                        >
                          <div
                            style={{
                              borderRadius: "var(--border-r-50)",
                              backgroundColor: "white",
                              minWidth: "6px",
                              aspectRatio: "1/1",
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              className="fit-container fx-centered box-pad-h-m box-pad-v-m sc-s-d option pointer"
              style={{
                backgroundColor: "transparent",
                borderColor: "var(--gray)",
                borderRadius: "10px",
              }}
              onClick={(e) => {
                // e.stopPropagation();
                redirectToLogin();
                dismiss();
              }}
            >
              <div className="plus-sign"></div>
              <p className="gray-c">{t("AnDg41L")}</p>
            </div>
            <div
              className="fit-container fx-centered fx-start-h"
              onClick={() => {
                logoutAllAccounts();
              }}
            >
              <div
                className="fit-container fx-centered fx-start-h box-pad-h-m box-pad-v-m sc-s-18"
                style={{
                  backgroundColor: "var(--dim-gray)",
                  borderRadius: "10px",
                }}
              >
                <div className="logout"></div>
                <p>{t("AWFCAQG")}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
