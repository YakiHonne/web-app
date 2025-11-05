import React, { useState } from "react";
import UserProfilePic from "@/Components/UserProfilePic";
import { downloadAsFile, getBech32, minimizeKey } from "@/Helpers/Encryptions";
import { useMemo } from "react";
import NotificationCenter from "@/Components/SideBar/NotificationCenter";
import { useEffect } from "react";
import { useRef } from "react";
import ProgressCirc from "@/Components/ProgressCirc";
import LoadingDots from "@/Components/LoadingDots";
import LoginWithAPI from "@/Components/LoginWithAPI";
import WriteNew from "@/Components/WriteNew";
import UserBalance from "@/Components/UserBalance";
import NumberShrink from "@/Components/NumberShrink";
import {
  getAllWallets,
  getConnectedAccounts,
  getWallets,
} from "@/Helpers/ClientHelpers";
import { redirectToLogin } from "@/Helpers/Helpers";
import { useSelector } from "react-redux";
import {
  exportAllWallets,
  handleSwitchAccount,
  logoutAllAccounts,
  userLogout,
} from "@/Helpers/Controlers";
import { store } from "@/Store/Store";
import { setToast } from "@/Store/Slides/Publishers";
import Publishing from "@/Components/Publishing";
import YakiMobileappSidebar from "@/Components/YakiMobileappSidebar";
import { useTranslation } from "react-i18next";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { nip19 } from "nostr-tools";
import SearchSidebar from "@/Components/SearchSidebar";
import { usePathname } from "next/navigation";
import { customHistory } from "@/Helpers/History";
import useDirectMessages from "@/Hooks/useDirectMessages";
import { SidebarNavItem } from "@/Components/SideBar/SidebarNavItem";

export default function SidebarComp() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const userMetadata = useSelector((state) => state.userMetadata);
  const userKeys = useSelector((state) => state.userKeys);
  const { isNewMsg } = useDirectMessages();
  const yakiChestStats = useSelector((state) => state.yakiChestStats);
  const isYakiChestLoaded = useSelector((state) => state.isYakiChestLoaded);
  const updatedActionFromYakiChest = useSelector(
    (state) => state.updatedActionFromYakiChest
  );

  const [showConfirmationBox, setShowConfirmationBox] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);
  const mainFrame = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [showYakiChest, setShowYakiChest] = useState(false);
  const accounts = useMemo(() => {
    return getConnectedAccounts();
  }, [userKeys, userMetadata]);
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);

  const isPage = (url) => {
    if (url === pathname) return true;
    return false;
  };

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
    let handleOffClick = (e) => {
      if (mainFrame.current && !mainFrame.current.contains(e.target))
        setIsActive(false);
    };
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [mainFrame]);

  const singleLogout = () => {
    let wallets = getWallets();
    let isNWC = wallets.find((_) => _.kind !== 1);

    if (isNWC) {
      setShowConfirmationBox(1);
      return;
    }
    setShowSettings(false);
    userLogout(userKeys.pub);
  };
  const multiLogout = () => {
    let wallets = getAllWallets();
    let isNWCs = wallets.find((_) => _.wallets.find((_) => _.kind !== 1));

    if (isNWCs) {
      setShowConfirmationBox(2);
      return;
    }
    setShowSettings(false);
    logoutAllAccounts();
  };

  const handleLogout = async () => {
    if (showConfirmationBox === 1) {
      // Show toast to inform user about downloads
      store.dispatch(
        setToast({
          show: true,
          type: 'info',
          message: t('Downloading wallet backups... Please allow downloads if prompted by your browser.'),
        })
      );

      await exportAllWallets();
      setShowSettings(false);
      userLogout(userKeys.pub);
    }
    if (showConfirmationBox === 2) {
      // Show toast to inform user about downloads
      store.dispatch(
        setToast({
          show: true,
          type: 'info',
          message: t('Downloading wallet backups... Please allow downloads if prompted by your browser.'),
        })
      );

      setShowSettings(false);
      // logoutAllAccounts() will handle all the exports
      logoutAllAccounts();
    }
    setShowConfirmationBox(false);
  };

  const handleProfileLink = async () => {
    try {
      let ndkUser = new NDKUser({
        pubkey: userKeys.pub,
      });
      ndkUser.ndk = ndkInstance;
      let isVer = userMetadata.nip05
        ? await ndkUser.validateNip05(userMetadata.nip05)
        : false;
      if (isVer) {
        customHistory(`/profile/${userMetadata.nip05}`);
        return;
      }

      let pubkey = nip19.nprofileEncode({ pubkey: userKeys.pub });
      customHistory(`/profile/${pubkey}`);
    } catch {
      return null;
    }
  };

  return (
    <>
      {showYakiChest && <LoginWithAPI exit={() => setShowYakiChest(false)} />}
      {isAccountSwitching && (
        <AccountSwitching exit={() => setIsAccountSwitching(false)} />
      )}
      {showConfirmationBox && (
        <ConfirmmationBox
          exit={() => setShowConfirmationBox(false)}
          handleOnClick={handleLogout}
        />
      )}
      <aside
        className="fx-scattered fx-end-v nostr-sidebar-container fx-col "
        style={{
          zIndex: isActive ? 1000 : 200,
        }}
        onClick={() => setIsActive(true)}
        ref={mainFrame}
      >
        <div
          className="nostr-sidebar fx-centered fx-start-h fx-col fit-container"
          style={{ height: "100%" }}
        >
          <div style={{ position: "sticky", top: 0, width: "100%" }}>
            <div className="fx-centered fx-start-h fit-container box-pad-v-s">
              <div
                className="yakihonne-logo-128 mb-hide"
                onClick={() => customHistory("/", true)}
              ></div>
              <div
                className="yaki-logomark mb-show"
                style={{ minHeight: "70px", minWidth: "70px" }}
                onClick={() => customHistory("/", true)}
              ></div>
            </div>
            <UserBalance />
          </div>
          <nav
            className="fit-container link-items fx-col fx-start-v "
            style={{
              flex: 1,
              overflow: "auto",
              overscrollBehavior: "contain",
              paddingBottom: "2rem",
            }}
          >
            <SidebarNavItem
              onClick={() => {
                customHistory("/", true);
              }}
              isActive={isPage("/")}
            >
              <div className={isPage("/") ? "home-bold-24" : "home-24"}></div>
              <div className="link-label">{t("AJDdA3h")}</div>
            </SidebarNavItem>
            <SidebarNavItem
              onClick={() => {
                customHistory("/relay-orbits", true);
              }}
              isActive={isPage("/relay-orbits")}
            >
              <div
                className={
                  isPage("/relay-orbits") ? "orbit-bold-24" : "orbit-24"
                }
              ></div>
              <div className="link-label">{t("AjGFut6")}</div>
            </SidebarNavItem>

            <SidebarNavItem
              onClick={() => {
                customHistory("/discover", true);
              }}
              isActive={isPage("/discover")}
            >
              <div
                className={
                  isPage("/discover") ? "discover-bold-24" : "discover-24"
                }
              ></div>
              <div className="link-label">{t("ABSoIm9")}</div>
            </SidebarNavItem>
            <SidebarNavItem
              onClick={() => {
                customHistory("/smart-widgets");
              }}
              isActive={isPage("/smart-widgets")}
            >
              <div
                className={
                  isPage("/smart-widgets")
                    ? "smart-widget-bold-24"
                    : "smart-widget-24"
                }
              ></div>
              <div className="link-label">{t("A2mdxcf")}</div>
            </SidebarNavItem>
            <SidebarNavItem
              style={{ position: "relative" }}
              isActive={isPage("/messages")}
              onClick={() => customHistory("/messages")}
            >
              <div className="fx-centered">
                <div
                  className={isPage("/messages") ? "env-bold-24" : "env-24"}
                ></div>
                <div className="link-label">{t("As2zi6P")}</div>
              </div>
              {isNewMsg && <div className="notification-dot"></div>}
            </SidebarNavItem>
            <NotificationCenter isCurrent={isPage("/notifications")} />
            <SearchSidebar />
            {userKeys && (
              <SidebarNavItem
                isActive={
                  isPage("/profile/" + getBech32("npub", userKeys.pub)) ||
                  isPage(
                    "/profile/" + nip19.nprofileEncode({ pubkey: userKeys.pub })
                  ) ||
                  isPage("/profile/" + userMetadata.nip05)
                }
                onClick={handleProfileLink}
              >
                <div
                  className={
                    isPage("/profile/" + getBech32("npub", userKeys.pub)) ||
                    isPage(
                      "/profile/" +
                        nip19.nprofileEncode({ pubkey: userKeys.pub })
                    ) ||
                    isPage("/profile/" + userMetadata.nip05)
                      ? "user-bold-24"
                      : "user-24"
                  }
                ></div>
                <div className="link-label">{t("AyBBPWE")}</div>
              </SidebarNavItem>
            )}
            {userKeys && (
              <SidebarNavItem
                isActive={isPage("/dashboard")}
                onClick={() => {
                  customHistory("/dashboard");
                }}
              >
                <div
                  className={
                    isPage("/dashboard") ? "dashboard-bold-24" : "dashboard-24"
                  }
                ></div>
                <div className="link-label">{t("ALBhi3j")}</div>
              </SidebarNavItem>
            )}
            <YakiMobileappSidebar />
          </nav>

          <WriteNew exit={() => null} />

          <Publishing />
          <div style={{ position: "sticky", bottom: 0, width: "100%" }}>
            {userKeys ? (
              <div
                className="fx-scattered fx-col fit-container sidebar-user-settings "
                style={{ position: "relative" }}
                ref={settingsRef}
              >
                <div
                  className="fit-container sidebar-user-settings-button"
                  style={{ overflow: "visible", rowGap: "10px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsActive(true);
                    setShowSettings(!showSettings);
                  }}
                >
                  <div className="mb-show round-icon">
                    <div className="setting-24"></div>
                  </div>
                  <div
                    className="fx-centered fx-start-h pointer"
                    style={{ columnGap: "16px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActive(true);
                      setShowSettings(!showSettings);
                    }}
                  >
                    <div className="mb-hide">
                      <UserProfilePic
                        size={40}
                        mainAccountUser={true}
                        allowClick={true}
                        allowPropagation={false}
                      />
                    </div>
                    <div className="mb-show">
                      <UserProfilePic
                        size={40}
                        mainAccountUser={true}
                        allowClick={true}
                        allowPropagation={false}
                      />
                    </div>
                    <div className="mb-hide">
                      <p className="p-one-line">
                        {userMetadata.display_name ||
                          userMetadata.name ||
                          minimizeKey(userKeys.pub)}
                      </p>
                      <p className="gray-c p-medium p-one-line">
                        @
                        {userMetadata.name ||
                          userMetadata.display_name ||
                          minimizeKey(userKeys.pub)}
                      </p>
                    </div>
                  </div>

                  {isYakiChestLoaded && !yakiChestStats && (
                    <div
                      className="round-icon round-icon-tooltip orange-pulse"
                      data-tooltip={t("ACALoWH")}
                      style={{ minWidth: "40px", minHeight: "40px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowYakiChest(true);
                      }}
                    >
                      <div className="cup"></div>
                    </div>
                  )}
                  {isYakiChestLoaded && yakiChestStats && (
                    <div
                      style={{ position: "relative" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        customHistory("/yaki-points");
                      }}
                    >
                      {updatedActionFromYakiChest && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            bottom: "calc(100% + 5px)",
                            width: "54px",
                            aspectRatio: "1/1",
                            borderRadius: "var(--border-r-50)",
                            backgroundColor: "var(--c1-side)",
                          }}
                          className="fx-centered slide-up-down"
                        >
                          <p>
                            <NumberShrink
                              value={updatedActionFromYakiChest.points}
                            />
                            <span className="gray-c p-medium">xp</span>
                          </p>
                        </div>
                      )}
                      <ProgressCirc
                        sidebar={true}
                        size={50}
                        percentage={
                          (yakiChestStats.inBetweenLevelPoints * 100) /
                          yakiChestStats.totalPointInLevel
                        }
                        innerComp={
                          <div
                            className="fx-centered fx-col"
                            style={{ rowGap: 0 }}
                          >
                            <p className="orange-c p-small mb-hide">
                              {yakiChestStats.xp} xp
                            </p>
                            <p className="gray-c p-small">
                              {t("AdLQkic", {
                                level: yakiChestStats.currentLevel,
                              })}
                            </p>
                          </div>
                        }
                        tooltip={t("AdLQkic", {
                          level: yakiChestStats.currentLevel,
                        })}
                      />
                    </div>
                  )}

                  {!isYakiChestLoaded && <LoadingDots />}
                </div>
                {showSettings && (
                  <div
                    className="sc-s-18 fx-centered fx-start-v fx-col pointer slide-left"
                    style={{
                      position: "absolute",
                      bottom: "110%",
                      left: "0",
                      width: "240px",
                      height: "max-content",
                      backgroundColor: "var(--very-dim-gray)",
                      zIndex: "900",
                      rowGap: 0,
                    }}
                    onClick={() => setShowSettings(false)}
                  >
                    <div
                      className="fx-centered fx-col fx-start-v fit-container"
                      style={{ rowGap: "0" }}
                    >
                      <div
                        className="fit-container fx-centered fx-start-h box-pad-h-m box-pad-v-m nostr-navbar-link"
                        onClick={() => customHistory(`/settings`)}
                        style={{ padding: ".75rem 1rem" }}
                      >
                        <div className="setting"></div>
                        <p className="gray-c">{t("ABtsLBp")}</p>
                      </div>
                      <div
                        className="fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-m nostr-navbar-link"
                        onClick={singleLogout}
                        style={{ padding: ".75rem 1rem" }}
                      >
                        <div className="logout"></div>
                        <p className="fx-centered">
                          {t("AyXwdfE")}
                          <span className="sticker sticker-normal sticker-small sticker-c1-pale">
                            {userMetadata.name ||
                              userMetadata.display_name ||
                              minimizeKey(userKeys.pub)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="fit-container fx-centered fx-col box-pad-h-s box-pad-v-s">
                      <div className="fit-container">
                        <p className="gray-c p-small">{t("AT2OPkx")}</p>
                      </div>
                      <div className="fit-container">
                        {accounts.map((account) => {
                          return (
                            <div
                              className="fit-container sc-s-18 box-pad-h-s box-pad-v-s fx-scattered option"
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
                                setIsAccountSwitching(true);
                                setShowSettings(false);
                              }}
                            >
                              <div className="fx-centered">
                                <div style={{ pointerEvents: "none" }}>
                                  <UserProfilePic
                                    size={32}
                                    mainAccountUser={false}
                                    img={account.picture}
                                    user_id={account.userKeys.pub}
                                    allowClick={false}
                                  />
                                </div>
                                <div>
                                  <p className="p-one-line p-medium">
                                    {account.display_name ||
                                      account.name ||
                                      minimizeKey(userKeys.pub)}
                                  </p>
                                  <p className="gray-c p-small p-one-line">
                                    @
                                    {account.name ||
                                      account.display_name ||
                                      minimizeKey(account.pubkey)}
                                  </p>
                                </div>
                              </div>
                              <div className="fx-centered">
                                {account.userKeys.ext && (
                                  <div
                                    className="sticker sticker-small sticker-orange-side"
                                    style={{ minWidth: "max-content" }}
                                  >
                                    Extension
                                  </div>
                                )}
                                {account.userKeys.sec && (
                                  <div
                                    className="sticker sticker-small sticker-red-side"
                                    style={{ minWidth: "max-content" }}
                                  >
                                    nSec
                                  </div>
                                )}
                                {account.userKeys.bunker && (
                                  <div
                                    className="sticker sticker-small sticker-green-side"
                                    style={{ minWidth: "max-content" }}
                                  >
                                    Bunker
                                  </div>
                                )}
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
                        className="fit-container fx-centered box-pad-h-m box-pad-v-s sc-s-d option"
                        style={{
                          backgroundColor: "transparent",
                          borderColor: "var(--gray)",
                          borderRadius: "10px",
                        }}
                        onClick={(e) => {
                          redirectToLogin();
                        }}
                      >
                        <div className="plus-sign"></div>
                        <p className="gray-c p-medium">{t("AnDg41L")}</p>
                      </div>
                    </div>
                    <div
                      className="fit-container fx-centered fx-start-h box-pad-h-s box-pad-v-s"
                      onClick={multiLogout}
                    >
                      <div
                        className="fit-container fx-centered fx-start-h box-pad-h-m box-pad-v-s sc-s-18"
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
                )}
              </div>
            ) : (
              <button
                className="btn btn-normal btn-full fx-centered"
                // onClick={() => customHistory("/login")}
                onClick={() => redirectToLogin()}
              >
                <div className="link-label">{t("AmOtzoL")}</div>
                <div className="connect-24"></div>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

const AccountSwitching = ({ exit }) => {
  const { t } = useTranslation();
  const userMetadata = useSelector((state) => state.userMetadata);
  useEffect(() => {
    let timeout = setTimeout(() => {
      exit();
    }, 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed-container fx-centered">
      <div className="fx-centered fx-col">
        <div className="fx-centered popout">
          <div style={{ borderRadius: "var(--border-r-50)" }}>
            <UserProfilePic
              size={200}
              mainAccountUser={true}
              allowClick={false}
            />
          </div>
        </div>
        <div className="box-pad-v fx-centered fx-col">
          <p className="orange-c p-medium">{t("AhxSvbf")}</p>
          <h3>{userMetadata.display_name || userMetadata.name}</h3>
          <p className="gray-c">@{userMetadata.name}</p>
        </div>
      </div>
    </div>
  );
};

const ConfirmmationBox = ({ exit, handleOnClick }) => {
  const { t } = useTranslation();

  return (
    <section className="fixed-container fx-centered box-pad-h">
      <section
        className="fx-centered fx-col sc-s bg-sp box-pad-h box-pad-v"
        style={{ width: "450px" }}
      >
        <div
          className="fx-centered box-marg-s"
          style={{
            minWidth: "54px",
            minHeight: "54px",
            borderRadius: "var(--border-r-50)",
            backgroundColor: "var(--orange-main)",
          }}
        >
          <div className="warning"></div>
        </div>
        <h3 className="p-centered">{t("AirKalq")}</h3>
        <p className="p-centered gray-c box-pad-v-m">{t("Ac9JSPk")}</p>
        <div className="fx-centered fit-container">
          <button
            className="fx btn btn-gst fx-centered"
            style={{ minWidth: "max-content" }}
            onClick={handleOnClick}
          >
            {t("AHmZKVA")}
            <div className="export"></div>
          </button>
          <button className="fx btn btn-red" onClick={exit}>
            {t("AB4BSCe")}
          </button>
        </div>
      </section>
    </section>
  );
};
