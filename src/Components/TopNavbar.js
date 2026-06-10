import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import axios from "axios";
import { webln } from "@getalby/sdk";

import Icon from "@/Components/Icon";
import UserProfilePic from "@/Components/UserProfilePic";
import NumberShrink from "@/Components/NumberShrink";
import SearchNetwork from "@/Components/SearchNetwork";
import LoginWithAPI from "@/Components/LoginWithAPI";
import LoginSignup from "@/Components/LoginSignup";
import PostAsNote from "@/Components/PostAsNote";
import PostMedia from "@/Components/PostMedia/PostMedia";
import Publishing from "@/Components/Publishing";

import { customHistory } from "@/Helpers/History";
import { getBech32, minimizeKey, downloadAsFile } from "@/Helpers/Encryptions";
import { redirectToLogin } from "@/Helpers/Helpers";
import { getConnectedAccounts, getWallets, getAllWallets } from "@/Helpers/ClientHelpers";
import { ndkInstance } from "@/Helpers/NDKInstance";
import {
  exportAllWallets,
  handleSwitchAccount,
  logoutAllAccounts,
  userLogout,
} from "@/Helpers/Controlers";
import { setUserBalance } from "@/Store/Slides/UserData";
import useDirectMessages from "@/Hooks/useDirectMessages";
import useNotifications from "@/Hooks/useNotifications";
import useCashu from "@/Hooks/useCachu";
import useCustomizationSettings from "@/Hooks/useCustomizationSettings";
import { localStorage_ } from "@/Helpers/utils/clientLocalStorage";
import { iconsNames } from "@/Content/IconV2URL";
import { updatesList } from "@/Components/YakiIntro";
import Overlay from "@/Components/Overlay";
import useIsMobile from "@/Hooks/useIsMobile";

export default function TopNavbar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const userMetadata = useSelector((state) => state.userMetadata);
  const userKeys = useSelector((state) => state.userKeys);
  const userBalance = useSelector((state) => state.userBalance);
  const { isNewMsg } = useDirectMessages();
  const { newNotifications } = useNotifications();
  const { cashuTotalBalance } = useCashu();
  const userSettings = useCustomizationSettings();

  const isMobile = useIsMobile();
  const [showSearch, setShowSearch] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dismissingProfile, setDismissingProfile] = useState(false);

  const closeProfileMenu = () => {
    if (document.body.classList.contains("ios-sheet-open")) {
      document.body.classList.replace("ios-sheet-open", "ios-sheet-closing");
      setTimeout(() => document.body.classList.remove("ios-sheet-closing"), 450);
    }
    if (isMobile && profileDropRef.current) {
      profileDropRef.current.classList.remove("uplift-profile-open");
    }
    const dismissDuration = isMobile ? 300 : 220;
    setDismissingProfile(true);
    setTimeout(() => { setShowProfileMenu(false); setDismissingProfile(false); }, dismissDuration);
  };
  const [showYakiChest, setShowYakiChest] = useState(false);
  const [showConfirmationBox, setShowConfirmationBox] = useState(false);
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);
  const switchingTimerRef = useRef(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [showPostNote, setShowPostNote] = useState(false);
  const [showPostMedia, setShowPostMedia] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [profilePos, setProfilePos] = useState({ top: 72, right: 16 });
  const [balanceHover, setBalanceHover] = useState(false);
  const [fiatRate, setFiatRate] = useState(null);
  const [fiatValue, setFiatValue] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [navHidden, setNavHidden] = useState(false);

  const avatarRef = useRef(null);
  const profileDropRef = useRef(null);
  const moreBtnRef = useRef(null);
  const moreDrawerRef = useRef(null);
  const createMenuRef = useRef(null);
  const plusBtnRef = useRef(null);

  const accounts = useMemo(() => getConnectedAccounts(), [userKeys, userMetadata]);
  const isPage = (url) => url === pathname;

  const currency = useMemo(() => userSettings.currency || "usd", [userSettings.currency]);

  useEffect(() => {
    if (!userKeys || !(userKeys?.ext || userKeys?.sec || userKeys?.bunker)) return;
    const walletUrl = localStorage_.getItem("selectedWalletType");
    if (["/lightning-wallet", "/cashu-wallet"].includes(window?.location?.pathname)) return;

    if (walletUrl === "/cashu-wallet") {
      if (cashuTotalBalance >= 0) dispatch(setUserBalance(cashuTotalBalance));
      return;
    }

    const wallets = getWallets();
    const activeWallet = wallets.find((w) => w.active);
    if (!activeWallet) { dispatch(setUserBalance("N/A")); return; }

    if (activeWallet.kind === 1) {
      window?.webln?.enable().then(() => window.webln.getBalance()).then((data) => {
        dispatch(setUserBalance(data.balance));
      }).catch(() => { });
    } else if (activeWallet.kind === 3) {
      try {
        const nwc = new webln.NWC({ nostrWalletConnectUrl: activeWallet.data });
        nwc.enable().then(() => nwc.getBalance()).then((res) => {
          dispatch(setUserBalance(res.balance));
        }).catch(() => { });
      } catch { }
    } else if (activeWallet.kind === 2) {
      const token = activeWallet.data?.access_token;
      if (token) {
        axios.get("https://api.getalby.com/balance", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => dispatch(setUserBalance(res.data.balance))).catch(() => { });
      }
    }
  }, [userKeys, cashuTotalBalance]);

  useEffect(() => {
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}`)
      .then((res) => setFiatRate(res.data.bitcoin[currency]))
      .catch(() => { });
  }, [currency]);

  useEffect(() => {
    if (fiatRate !== null && userBalance !== "N/A" && userBalance !== undefined) {
      setFiatValue((userBalance / 100000000) * fiatRate);
    } else {
      setFiatValue(null);
    }
  }, [fiatRate, userBalance]);

  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") setCreateOpen(false);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const lastScrollY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      if (showMore || showProfileMenu || createOpen) return;
      const y = window.scrollY;
      setNavHidden(y > lastScrollY.current && y > 80);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showMore, showProfileMenu, createOpen]);

  useEffect(() => {
    const handle = (e) => {
      if (
        avatarRef.current?.contains(e.target) ||
        profileDropRef.current?.contains(e.target)
      ) return;
      closeProfileMenu();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (moreDrawerRef.current?.contains(e.target)) return;
      if (moreBtnRef.current?.contains(e.target)) return;
      setShowMore(false);
    };
    if (showMore) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showMore]);

  useEffect(() => {
    const el = document.getElementById("floating-dms");
    if (!el) return;
    if (showMore) el.classList.add("uplift-drawer-open-mask");
    else el.classList.remove("uplift-drawer-open-mask");
    return () => el.classList.remove("uplift-drawer-open-mask");
  }, [showMore]);

  useEffect(() => {
    const anyOpen = showMore || showProfileMenu || createOpen;
    if (anyOpen) {
      document.body.classList.remove("ios-sheet-closing");
      document.body.classList.add("ios-sheet-open");
    } else if (document.body.classList.contains("ios-sheet-open")) {
      document.body.classList.replace("ios-sheet-open", "ios-sheet-closing");
      const timer = setTimeout(() => document.body.classList.remove("ios-sheet-closing"), 450);
      return () => clearTimeout(timer);
    }
  }, [showMore, showProfileMenu, createOpen]);

  useEffect(() => {
    const handle = (e) => {
      if (
        plusBtnRef.current?.contains(e.target) ||
        createMenuRef.current?.contains(e.target)
      ) return;
      setCreateOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const openProfileMenu = () => {
    if (avatarRef.current) {
      const r = avatarRef.current.getBoundingClientRect();
      const dropdownH = 520;
      const top = Math.min(r.bottom + 8, window.innerHeight - dropdownH - 8);
      setProfilePos({ top: Math.max(top, 56), right: window.innerWidth - r.right });
    }
    if (showProfileMenu) {
      closeProfileMenu();
    } else {
      setShowProfileMenu(true);
      if (isMobile) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (profileDropRef.current) profileDropRef.current.classList.add("uplift-profile-open");
        }));
      }
    }
  };

  const openMore = () => setShowMore((v) => !v);

  const toggleCreate = () => {
    if (!(userKeys?.ext || userKeys?.sec || userKeys?.bunker)) {
      setIsLogin(true);
      return;
    }
    setCreateOpen((v) => !v);
  };

  const handleProfileLink = async () => {
    closeProfileMenu();
    try {
      const ndkUser = new NDKUser({ pubkey: userKeys.pub });
      ndkUser.ndk = ndkInstance;
      const isVer = userMetadata.nip05
        ? await ndkUser.validateNip05(userMetadata.nip05)
        : false;
      if (isVer) { customHistory(`/profile/${userMetadata.nip05}`); return; }
      customHistory(`/profile/${nip19.nprofileEncode({ pubkey: userKeys.pub })}`);
    } catch { return null; }
  };

  const singleLogout = () => {
    const wallets = getWallets();
    if (wallets.find((_) => _.kind !== 1)) { setShowConfirmationBox(1); return; }
    closeProfileMenu();
    userLogout(userKeys.pub);
  };

  const multiLogout = () => {
    const wallets = getAllWallets();
    if (wallets.find((_) => _.wallets.find((_) => _.kind !== 1))) {
      setShowConfirmationBox(2); return;
    }
    setShowProfileMenu(false);
    logoutAllAccounts();
  };

  const handleLogout = () => {
    if (showConfirmationBox === 1) {
      exportAllWallets();
      setShowProfileMenu(false);
      userLogout(userKeys.pub);
    }
    if (showConfirmationBox === 2) {
      let wallets = getAllWallets().filter((_) => _.wallets.find((_) => _.kind !== 1));
      const NWCs = wallets.map((_) => ({ ..._, wallets: _.wallets.filter((_) => _.kind !== 1) }));
      const lines = NWCs.flatMap((w) => [
        `Wallets for: ${getBech32("npub", w.pubkey)}`, "-",
        ...w.wallets.flatMap((wl, i, arr) => [
          `Address: ${wl.entitle}`, `NWC secret: ${wl.data}`,
          i < arr.length - 1 ? "----" : "",
        ]),
        "------------------------------------------------------", " ",
      ]);
      downloadAsFile(
        ["Important: Store this information securely.", "---", ...lines].join("\n"),
        "text/plain", "NWCs-wallets.txt", t("AVUlnek"),
      );
      setShowProfileMenu(false);
      logoutAllAccounts();
    }
    setShowConfirmationBox(false);
  };

  const walletUrl = (() => {
    if (typeof window === "undefined") return "/lightning-wallet";
    const url = localStorage.getItem("selectedWalletType");
    return ["/lightning-wallet", "/cashu-wallet"].includes(url) ? url : "/lightning-wallet";
  })();

  const morePages = [
    { icon: iconsNames.camera, iconBold: "media-bold", label: t("A0i2SOt"), path: "/media" },
    { icon: iconsNames.planet, iconBold: "orbit-bold", label: t("AjGFut6"), path: "/relay-orbits" },
    { icon: iconsNames.compass, iconBold: "discover-bold", label: t("ABxLOSx"), path: "/explore" },
    { icon: iconsNames.puzzle, iconBold: "smart-widget-bold", label: t("A2mdxcf"), path: "/smart-widgets" },
    ...(userKeys ? [
      { icon: iconsNames.user_01, iconBold: "user-bold", label: t("AyBBPWE"), path: null, onClick: handleProfileLink },
      { icon: iconsNames.chart_line, iconBold: "dashboard-bold", label: t("ALBhi3j"), path: "/dashboard" },
      { icon: iconsNames.star, iconBold: "dashboard-bold", label: t("ABsx3n9"), path: "/yaki-points" },
    ] : []),
  ];

  const createItems = [
    {
      icon: iconsNames.note,
      label: "Note",
      description: "Quick post",
      action: () => { setCreateOpen(false); setShowPostNote(true); },
    },
    {
      icon: iconsNames.file_document,
      label: "Article",
      description: "Long-form",
      action: () => { setCreateOpen(false); customHistory("/write-article"); },
    },
    {
      icon: iconsNames.image_01,
      label: "Media",
      description: "Photo or clip",
      action: () => { setCreateOpen(false); setShowPostMedia(true); },
    },
    {
      icon: iconsNames.more_grid_big,
      label: "Widget",
      description: "Smart embed",
      action: () => { setCreateOpen(false); customHistory("/smart-widget-builder"); },
    },
  ];

  return (
    <>
      {showChangelog && (
        <Overlay exit={() => setShowChangelog(false)} width={480}>
          <div
            className="fx-centered fx-col box-pad-h box-pad-v slide-up"
          >
            <div className="close" onClick={() => setShowChangelog(false)}><div /></div>
            <div className="fit-container fx-scattered">
              <div>
                <p className="p-bold">{t("Aw2kJdM")}</p>
                <p className="gray-c p-medium p-italic">
                  ({process.env.NEXT_PUBLIC_UPDATE_DATE})
                </p>
              </div>
              <p className="orange-c p-medium">v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
            </div>
            <div className="box-pad-v-s" />
            <ul className="fit-container" style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", rowGap: "0.5rem" }}>
              {updatesList.map((item, i) => (
                <li key={i} style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", lineHeight: 1.5 }}>{item}</li>
              ))}
            </ul>
          </div>
        </Overlay>
      )}
      {isLogin && <LoginSignup exit={() => setIsLogin(false)} />}
      {showPostNote && <PostAsNote exit={() => setShowPostNote(false)} />}
      {showPostMedia && <PostMedia exit={() => setShowPostMedia(false)} />}
      {showYakiChest && <LoginWithAPI exit={() => setShowYakiChest(false)} />}
      {showSearch && <SearchNetwork exit={() => setShowSearch(false)} />}
      {showConfirmationBox && (
        <ConfirmationBox exit={() => setShowConfirmationBox(false)} handleOnClick={handleLogout} />
      )}
      <MiniNavbar
        visible={navHidden}
        pathname={pathname}
        userKeys={userKeys}
        newNotifications={newNotifications}
        isNewMsg={isNewMsg}
        avatarRef={avatarRef}
        onAvatarClick={openProfileMenu}
        onReveal={() => setNavHidden(false)}
        isAccountSwitching={isAccountSwitching}
      />

      <MobileBottomNav
        pathname={pathname}
        isPage={isPage}
        navHidden={navHidden}
        userKeys={userKeys}
        isNewMsg={isNewMsg}
        createOpen={createOpen}
        plusBtnRef={plusBtnRef}
        toggleCreate={toggleCreate}
        openMore={openMore}
      />

      <nav className={`uplift-navbar${navHidden ? " uplift-navbar-hidden" : ""}`}>

        <div className="uplift-navbar-left">
          <div className="uplift-logo-btn" onClick={() => customHistory("/", true)}>
            <Icon name="yaki-logomark" size={48} />
          </div>
          <div className="uplift-search-pill" onClick={() => setShowSearch(true)}>
            <Icon name={iconsNames.search_magnifying_glass} size={15} v={2} />
            <span className="uplift-search-pill-label">Search</span>

          </div>
        </div>


        <div className="uplift-nav-center">
          <div className="uplift-nav-pill">
            <div
              className={`uplift-nav-icon-btn${isPage("/") ? " uplift-active" : ""}`}
              aria-label="Home"
              onClick={() => customHistory("/", true)}
            >
              <span className="uplift-nav-icon-wrap">
                <Icon name={iconsNames.house_01} size={22} v={2} opacity={1} />
              </span>
              {isPage("/") && <span className="uplift-active-dot" />}
            </div>

            <div
              className={`uplift-nav-icon-btn${isPage("/articles") ? " uplift-active" : ""}`}
              aria-label="Articles"
              onClick={() => customHistory("/articles", true)}
            >
              <span className="uplift-nav-icon-wrap">
                <Icon name={iconsNames.file_blank} size={22} v={2} opacity={1} />
              </span>
              {isPage("/articles") && <span className="uplift-active-dot" />}
            </div>

            <button
              ref={plusBtnRef}
              className={`uplift-plus-btn${createOpen ? " uplift-plus-open" : ""}`}
              aria-label="Create"
              onClick={toggleCreate}
            >
              <span className="uplift-plus-icon-wrap">
                <Icon name={iconsNames.add_plus} size={22} v={2} opacity={1} />
              </span>
            </button>

            <div
              className={`uplift-nav-icon-btn${isPage("/messages") ? " uplift-active" : ""}`}
              aria-label="Messages"
              onClick={() => customHistory("/messages")}
            >
              <span className="uplift-nav-icon-wrap">
                <Icon name={iconsNames.chat_conversation} size={22} v={2} opacity={1} />
              </span>
              {isNewMsg && <span className="uplift-notif-dot" />}
              {isPage("/messages") && <span className="uplift-active-dot" />}
            </div>

            <div
              ref={moreBtnRef}
              className={`uplift-nav-icon-btn${showMore ? " uplift-active" : ""}`}
              aria-label="More"
              onClick={openMore}
            >
              <span className="uplift-nav-icon-wrap">
                <Icon name={iconsNames.menu_alt_05} size={22} v={2} opacity={1} />
              </span>
            </div>
          </div>
        </div>


        <div className="uplift-nav-right">
          {userKeys && (
            <div
              className={`uplift-balance-chip${balanceHover && fiatValue !== null ? " uplift-balance-chip-hover" : ""}`}
              onClick={() => customHistory(walletUrl)}
              onMouseEnter={() => setBalanceHover(true)}
              onMouseLeave={() => setBalanceHover(false)}
            >
              <div className="uplift-balance-btc-dot">₿</div>
              <div className="uplift-balance-text-wrap">
                <div className="uplift-balance-text-stack">
                  <p className="uplift-balance-sats">
                    {userBalance === "N/A" ? "—" : <NumberShrink value={userBalance} />}
                    {" "}<span className="uplift-balance-unit">sats</span>
                  </p>
                  {fiatValue !== null && (
                    <p className="uplift-balance-fiat">
                      {fiatValue.toFixed(2)} <span className="uplift-balance-unit">{currency.toUpperCase()}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className="uplift-icon-btn"
            aria-label="Notifications"
            onClick={() => customHistory("/notifications")}
          >
            <Icon name={iconsNames.bell} size={18} v={2} />
            {newNotifications.length > 0 && (
              <span className="uplift-bell-dot" />
            )}
          </div>

          {userKeys ? (
            <div ref={avatarRef} className={`uplift-avatar-btn${isAccountSwitching ? " uplift-avatar-switching" : ""}`} onClick={openProfileMenu}>
              <UserProfilePic
                size={40}
                mainAccountUser
                allowClick={false}
                allowPropagation={true}
                isSwitching={isAccountSwitching}
              />
            </div>
          ) : (
            <button className="uplift-login-btn" onClick={redirectToLogin}>
              {t("AmOtzoL")}
            </button>
          )}
        </div>
      </nav>


      {typeof document !== "undefined" && createPortal(
        <>

          <div
            className={`uplift-create-scrim${createOpen ? " uplift-create-scrim-open" : ""}`}
            onClick={() => setCreateOpen(false)}
          />


          <div
            ref={createMenuRef}
            className={`uplift-create-menu${createOpen ? " uplift-create-menu-open" : ""}`}
          >
            <div className="uplift-create-menu-glass" />
            <div className={`uplift-create-grid${createOpen ? " uplift-create-grid-open" : ""}`}>
              {createItems.map((item, i) => (
                <button
                  key={item.label}
                  className="uplift-create-item"
                  style={{ "--i": i }}
                  onClick={item.action}
                >
                  <span className="uplift-create-item-icon">
                    <Icon name={item.icon} size={24} v={2} />
                  </span>
                  <span className="uplift-create-item-label">{item.label}</span>
                  <span className="uplift-create-item-desc">{item.description}</span>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}


      {showProfileMenu && userKeys && typeof document !== "undefined" && createPortal(
        <>
          <div
            className="uplift-profile-scrim"
            onClick={closeProfileMenu}
          />
          <div
            ref={profileDropRef}
            className={`${isMobile ? "" : "bg-dropdown "}uplift-profile-dropdown-wrapper${dismissingProfile ? " dismissing" : ""}`}
            style={{ top: profilePos.top, right: profilePos.right }}
          >
            <div className="uplift-profile-dropdown">
              <div className="uplift-dropdown-item" onClick={handleProfileLink}>
                <Icon name={iconsNames.user_01} v={2} size={18} />
                <span className="uplift-dropdown-profile-name">
                  {t("A1HzYJS")}
                  <span className="gray-c">
                    {" @"}{userMetadata?.name || userMetadata?.display_name || minimizeKey(userKeys.pub)}
                  </span>
                </span>
              </div>

              <div className="uplift-dropdown-item" onClick={() => { closeProfileMenu(); customHistory("/subscription"); }}>
                <Icon name="cup" size={18} />
                <span>{t("Ar1oBm3")}</span>
              </div>

              <div className="uplift-dropdown-item" onClick={() => { closeProfileMenu(); customHistory("/settings"); }}>
                <Icon name={iconsNames.settings} v={2} size={18} />
                <span>{t("ABtsLBp")}</span>
              </div>

              <a
                href="https://pro.yakihonne.com"
                target="_blank"
                rel="noopener noreferrer"
                className="uplift-dropdown-item"
                style={{ textDecoration: "none" }}
                onClick={closeProfileMenu}
              >
                <Icon name={iconsNames.wavy_check} v={2} size={18} />
                <span>YakiPro</span>
              </a>

              <div className="uplift-dropdown-item" onClick={() => { singleLogout(); }}>
                <Icon name="logout" size={18} />
                <span>{t("AyXwdfE")}</span>
              </div>

              <div className="uplift-dropdown-divider" />
              <div className="uplift-dropdown-section-label">{t("AT2OPkx")}</div>

              <div className="uplift-dropdown-accounts-list">
                {accounts.map((account) => (
                  <div
                    key={account.pubkey}
                    className={`uplift-dropdown-account-item${userKeys.pub === account.pubkey ? " uplift-account-active" : ""}`}
                    onClick={() => {
                      closeProfileMenu();
                      handleSwitchAccount(account);
                      clearTimeout(switchingTimerRef.current);
                      setIsAccountSwitching(true);
                      switchingTimerRef.current = setTimeout(() => setIsAccountSwitching(false), 900);
                    }}
                  >
                    <div className="uplift-dropdown-account-info">
                      <div style={{ pointerEvents: "none", flexShrink: 0 }}>
                        <UserProfilePic
                          size={40}
                          mainAccountUser={false}
                          img={account.picture}
                          user_id={account.userKeys.pub}
                          allowClick={false}
                        />
                      </div>
                      <div className="uplift-dropdown-account-text">
                        <p className="p-one-line">
                          {account.display_name || account.name || minimizeKey(account.pubkey)}
                        </p>
                        <p className="gray-c p-small p-one-line">
                          @{account.name || account.display_name || minimizeKey(account.pubkey)}
                        </p>
                      </div>
                    </div>
                    {userKeys.pub === account.pubkey ? (
                      <div className="uplift-dropdown-account-dot-active">
                        <div className="uplift-dropdown-account-dot-inner" />
                      </div>
                    ) : (
                      <div className="uplift-dropdown-account-dot" />
                    )}
                  </div>
                ))}
              </div>

              <div className="uplift-dropdown-item" onClick={() => { closeProfileMenu(); redirectToLogin(); }}>
                <Icon name="plus-sign" size={18} />
                <span className="gray-c">{t("AnDg41L")}</span>
              </div>

              <div className="uplift-dropdown-divider" />

              <div className="uplift-dropdown-signout-row">
                <div className="uplift-dropdown-signout-btn" onClick={multiLogout}>
                  <Icon name="logout" size={18} />
                  <span>{t("AWFCAQG")}</span>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}


      {typeof document !== "undefined" && createPortal(
        <>
          <div
            className={`uplift-more-scrim${showMore ? " uplift-more-scrim-open" : ""}`}
            onClick={() => setShowMore(false)}
          />
          <div
            ref={moreDrawerRef}
            className={`uplift-more-drawer${showMore ? " uplift-more-drawer-open" : ""}`}
          >
            <div className="uplift-more-drawer-inner bg-dropdown">
              <div className="uplift-more-drawer-section-label">{t("Anb1xKp")}</div>
              <div className="uplift-more-drawer-links">
                {morePages.map((page) => (
                  <div
                    key={page.path || page.label}
                    className={`uplift-more-drawer-item${isPage(page.path) ? " uplift-more-active" : ""}`}
                    onClick={() => {
                      setShowMore(false);
                      if (page.onClick) { page.onClick(); return; }
                      customHistory(page.path, true);
                    }}
                  >
                    <span className="uplift-more-drawer-item-icon">
                      <Icon v={2} name={page.icon} size={20} opacity={isPage(page.path) ? 1 : .5} />
                    </span>
                    <span className={isPage(page.path) ? "" : "gray-c"}>{page.label}</span>
                  </div>
                ))}
              </div>

              <div className="uplift-more-drawer-section-label">{t("Apv9nXe")}</div>
              <div className="uplift-more-drawer-publishing">
                <Publishing />
              </div>
              <div className="uplift-more-drawer-updates-card">
                <p className="uplift-more-drawer-updates-title">{t("Acq7mWs")}</p>
                <p className="uplift-more-drawer-updates-meta gray-c p-medium">
                  {process.env.NEXT_PUBLIC_UPDATE_DATE}
                </p>
                <p className="uplift-more-drawer-updates-meta orange-c p-medium">
                  v{process.env.NEXT_PUBLIC_APP_VERSION}
                </p>
                <button
                  className="uplift-more-drawer-changelog-btn"
                  onClick={() => setShowChangelog(true)}
                >
                  {t("Az3tRpL")}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

const PAGE_TITLES = {
  "/": "AJDdA3h",
  "/articles": "AesMg52",
  "/messages": "As2zi6P",
  "/notifications": "ASSFfFZ",
  "/explore": "A9aq49d",
  "/media": "A0i2SOt",
  "/relay-orbits": "AjGFut6",
  "/smart-widgets": "A2mdxcf",
  "/dashboard": "ALBhi3j",
  "/settings": "ABtsLBp",
  "/write-article": "AV2yFXl",
  "/smart-widget-builder": "ARYw3G4",
  "/lightning-wallet": "Ah1Kxvl",
  "/cashu-wallet": "Ah1Kxvl",
  "/subscription": "Ar1oBm3",
};

const MiniNavbar = ({ visible, pathname, userKeys, newNotifications, isNewMsg, avatarRef, onAvatarClick, onReveal, isAccountSwitching }) => {
  const { t } = useTranslation();
  const title = PAGE_TITLES[pathname] ? t(PAGE_TITLES[pathname]) : "";
  return (
    <div
      className={`uplift-mini-navbar${visible ? " uplift-mini-navbar-visible" : ""}`}
      onClick={onReveal}
    >

      <div className="uplift-mini-logo" onClick={() => customHistory("/", true)}>
        <Icon name="yakihonne-logo" size={28} width={100} height={28} />
      </div>


      <p className="uplift-mini-title">{title}</p>


      <div className="uplift-mini-right">
        <div
          className="uplift-mini-icon-btn"
          aria-label="Messages"
          onClick={() => customHistory("/messages")}
        >
          <Icon name={iconsNames.chat_conversation} size={17} v={2} opacity={1} />
          {isNewMsg && <span className="uplift-bell-dot" />}
        </div>

        <div
          className="uplift-mini-icon-btn"
          aria-label="Notifications"
          onClick={() => customHistory("/notifications")}
        >
          <Icon name={iconsNames.bell} size={17} v={2} opacity={1} />
          {newNotifications.length > 0 && <span className="uplift-bell-dot" />}
        </div>

        {userKeys && (
          <div ref={avatarRef} className={`uplift-avatar-btn${isAccountSwitching ? " uplift-avatar-switching" : ""}`} onClick={onAvatarClick}>
            <UserProfilePic size={28} mainAccountUser allowClick={false} allowPropagation={true} isSwitching={isAccountSwitching} />
          </div>
        )}
      </div>
    </div>
  );
};

const MobileBottomNav = ({ isPage, navHidden, userKeys, isNewMsg, createOpen, plusBtnRef, toggleCreate, openMore }) => {
  useEffect(() => {
    if (!navHidden) {
      document.body.classList.add("bottom-nav-visible");
    } else {
      document.body.classList.remove("bottom-nav-visible");
    }
    return () => document.body.classList.remove("bottom-nav-visible");
  }, [navHidden]);

  return (
    <nav className={`uplift-bottom-nav${navHidden ? " uplift-bottom-nav-hidden" : ""}`}>
      <div
        className={`uplift-bottom-nav-btn${isPage("/") ? " uplift-active" : ""}`}
        aria-label="Home"
        onClick={() => customHistory("/", true)}
      >
        <span className="uplift-nav-icon-wrap">
          <Icon name={iconsNames.house_01} size={24} v={2} opacity={1} />
        </span>
        {isPage("/") && <span className="uplift-active-dot" style={{ bottom: 6 }} />}
      </div>

      <div
        className={`uplift-bottom-nav-btn${isPage("/articles") ? " uplift-active" : ""}`}
        aria-label="Articles"
        onClick={() => customHistory("/articles", true)}
      >
        <span className="uplift-nav-icon-wrap">
          <Icon name={iconsNames.file_blank} size={24} v={2} opacity={1} />
        </span>
        {isPage("/articles") && <span className="uplift-active-dot" style={{ bottom: 6 }} />}
      </div>

      <button
        ref={plusBtnRef}
        className={`uplift-bottom-nav-plus${createOpen ? " uplift-plus-open" : ""}`}
        aria-label="Create"
        onClick={toggleCreate}
      >
        <span className="uplift-plus-icon-wrap">
          <Icon name={iconsNames.add_plus} size={22} v={2} opacity={1} />
        </span>
      </button>

      <div
        className={`uplift-bottom-nav-btn${isPage("/messages") ? " uplift-active" : ""}`}
        aria-label="Messages"
        onClick={() => customHistory("/messages")}
      >
        <span className="uplift-nav-icon-wrap">
          <Icon name={iconsNames.chat_conversation} size={24} v={2} opacity={1} />
        </span>
        {isNewMsg && <span className="uplift-notif-dot" style={{ top: 4, right: "calc(50% - 20px)" }} />}
        {isPage("/messages") && <span className="uplift-active-dot" style={{ bottom: 6 }} />}
      </div>

      <div
        className="uplift-bottom-nav-btn"
        aria-label="More"
        onClick={openMore}
      >
        <span className="uplift-nav-icon-wrap">
          <Icon name={iconsNames.menu_alt_05} size={24} v={2} opacity={1} />
        </span>
      </div>
    </nav>
  );
};

const ConfirmationBox = ({ exit, handleOnClick }) => {
  const { t } = useTranslation();
  return (
    <Overlay exit={exit} width={450}>
      <section className="fx-centered fx-col box-pad-h box-pad-v">
        <div
          className="fx-centered box-marg-s"
          style={{ minWidth: "54px", minHeight: "54px", borderRadius: "var(--border-r-50)", backgroundColor: "var(--c1)" }}
        >
          <Icon name="warning" />
        </div>
        <h3 className="p-centered">{t("AirKalq")}</h3>
        <p className="p-centered gray-c box-pad-v-m">{t("Ac9JSPk")}</p>
        <div className="fx-centered fit-container">
          <button className="fx btn btn-gst fx-centered" style={{ minWidth: "max-content" }} onClick={handleOnClick}>
            {t("AHmZKVA")}<Icon name="export" />
          </button>
          <button className="fx btn btn-red" onClick={exit}>{t("AB4BSCe")}</button>
        </div>
      </section>
    </Overlay>
  );
};
