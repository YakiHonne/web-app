import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { nip19 } from "nostr-tools";
import { PanelLeftClose, PanelLeftOpen, ArrowUpRight, ChevronRight, ChevronsUpDown, X } from "lucide-react";

import Icon from "@/Components/Icon";
import UserProfilePic from "@/Components/UserProfilePic";
import NumberShrink from "@/Components/NumberShrink";
import Publishing from "@/Components/Publishing";
import PremiumSidebarBanner, { usePremiumBannerState } from "@/Components/PremiumSidebarBanner";
import { customHistory } from "@/Helpers/History";
import { minimizeKey } from "@/Helpers/Encryptions";
import { redirectToLogin } from "@/Helpers/Helpers";
import { getAccountKindTag } from "@/Helpers/Controlers";
import { iconsNames } from "@/Content/IconV2URL";
import { setSidebarCollapsed } from "@/Helpers/utils/appearance";

function usePresence(open, ms = 180) {
  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
      return undefined;
    }
    setClosing(true);
    const timer = setTimeout(() => {
      setRender(false);
      setClosing(false);
    }, ms);
    return () => clearTimeout(timer);
  }, [open, ms]);
  return { render, closing };
}

function useSidePlacement(render, btnRef, popRef, asideRef, deps) {
  const [pos, setPos] = useState(null);
  useLayoutEffect(() => {
    if (!render) {
      setPos(null);
      return undefined;
    }
    const place = () => {
      const btn = btnRef.current;
      const panel = popRef.current;
      const side = asideRef.current;
      if (!btn || !panel || !side) return;
      const b = btn.getBoundingClientRect();
      const sb = side.getBoundingClientRect();
      const h = panel.offsetHeight;
      const vh = window.innerHeight;
      const top = Math.max(12, Math.min(b.top - 10, vh - h - 12));
      const originY = Math.round(b.top + b.height / 2 - top);
      if (document.documentElement.dir === "rtl") {
        setPos({ top, right: window.innerWidth - sb.left + 10, transformOrigin: `right ${originY}px` });
      } else {
        setPos({ top, left: sb.right + 10, transformOrigin: `left ${originY}px` });
      }
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render, ...deps]);
  return pos || { visibility: "hidden" };
}

function usePremiumFit(slotRef, visible, collapsed) {
  const [fit, setFit] = useState("none");
  const [room, setRoom] = useState(0);
  useLayoutEffect(() => {
    const el = slotRef.current;
    if (!el) return undefined;
    const measure = () => {
      const h = el.clientHeight;
      setRoom(h);
      if (!visible) return setFit("none");
      if (collapsed) return setFit(h >= 40 ? "icon" : "more");
      if (h >= 128) return setFit("full");
      if (h >= 46) return setFit("compact");
      return setFit("more");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slotRef, visible, collapsed]);
  return { fit, room };
}

const stagger = (i) => ({ "--i": i });

function Pop({ className = "", closing, style, popRef, label, role = "menu", children }) {
  return (
    <div
      ref={popRef}
      className={`csb-pop ${className}${closing ? " is-closing" : ""}`}
      style={style}
      role={role}
      aria-label={label}
    >
      <div className="csb-pop-glass" aria-hidden="true" />
      <div className="csb-pop-body">{children}</div>
    </div>
  );
}

function NavRow({ item, active, collapsed, flyoutProps, accent, onSelect }) {
  const content = (
    <>
      <span className="csb-row-icon">
        <Icon
          name={item.icon}
          v={item.v ?? 2}
          size={22}
          opacity={active || accent ? 1 : 0.85}
          isBoldThemeColor={active || accent}
        />
        {item.dot && collapsed && <span className="csb-dot" aria-hidden="true" />}
      </span>
      {!collapsed && <span className="csb-row-label">{item.label}</span>}
      {!collapsed && item.badge > 0 && <span className="csb-badge">{item.badge > 99 ? "99+" : item.badge}</span>}
      {!collapsed && item.dot && !item.badge && <span className="csb-dot csb-dot-inline" aria-hidden="true" />}
      {!collapsed && item.external && <ArrowUpRight size={14} className="csb-ext" />}
    </>
  );
  const className = `csb-row${active ? " is-active" : ""}${accent ? " is-accent" : ""}`;
  const hover = collapsed && flyoutProps ? flyoutProps(item.label, item.badge) : {};
  if (item.href) {
    return (
      <a
        href={item.href}
        data-vt={item.vt}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={collapsed ? item.label : undefined}
        onClick={() => onSelect && onSelect()}
        {...hover}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={className}
      data-vt={item.vt}
      onClick={() => {
        item.onClick();
        if (onSelect) onSelect();
      }}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      {...hover}
    >
      {content}
    </button>
  );
}

function BalanceCard({ className = "", style, userBalance, fiatValue, currency, onOpen, vt }) {
  const { t } = useTranslation();
  const hasFiat = fiatValue !== null && fiatValue !== undefined;
  return (
    <button
      type="button"
      className={`csb-wallet${hasFiat ? " has-fiat" : ""} ${className}`}
      style={style}
      data-vt={vt}
      onClick={onOpen}
    >
      <span className="csb-wallet-dot" aria-hidden="true">₿</span>
      <span className="csb-wallet-text">
        <span className="csb-wallet-label">{t("AbcY4ef")}</span>
        <span className="csb-wallet-roll">
          <span className="csb-wallet-stack">
            <span className="csb-wallet-value">
              {userBalance === "N/A" || userBalance === undefined ? "—" : <NumberShrink value={userBalance} />}{" "}
              <span className="csb-wallet-unit">sats</span>
            </span>
            {hasFiat && (
              <span className="csb-wallet-value">
                {fiatValue.toFixed(2)} <span className="csb-wallet-unit">{currency.toUpperCase()}</span>
              </span>
            )}
          </span>
        </span>
      </span>
      <ChevronRight size={16} className="csb-wallet-chev" />
    </button>
  );
}

export default function ClassicSidebar({
  pathname,
  collapsed,
  userKeys,
  userMetadata,
  accounts,
  userBalance,
  fiatValue,
  currency,
  walletUrl,
  newNotificationsCount,
  isNewMsg,
  createItems,
  canCreate,
  isAccountSwitching,
  onProfile,
  onSingleLogout,
  onMultiLogout,
  onSwitchAccount,
  onShowDemo,
  onShowChangelog,
}) {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [flyout, setFlyout] = useState(null);

  const asideRef = useRef(null);
  const moreWrapRef = useRef(null);
  const moreBtnRef = useRef(null);
  const morePopRef = useRef(null);
  const writeWrapRef = useRef(null);
  const writeBtnRef = useRef(null);
  const createPopRef = useRef(null);
  const accountRef = useRef(null);
  const slotRef = useRef(null);

  const premium = usePremiumBannerState();
  const { fit, room } = usePremiumFit(slotRef, premium.visible, collapsed);
  const moreP = usePresence(moreOpen);
  const createP = usePresence(createOpen);
  const accountP = usePresence(accountOpen);
  const morePos = useSidePlacement(moreP.render, moreBtnRef, morePopRef, asideRef, [fit, collapsed]);
  const createPos = useSidePlacement(createP.render, writeBtnRef, createPopRef, asideRef, [collapsed]);

  useEffect(() => {
    if (!collapsed) setFlyout(null);
  }, [collapsed]);

  useEffect(() => {
    setMoreOpen(false);
    setCreateOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const close = (e) => {
      if (moreWrapRef.current && !moreWrapRef.current.contains(e.target)) setMoreOpen(false);
      if (writeWrapRef.current && !writeWrapRef.current.contains(e.target)) setCreateOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setMoreOpen(false);
      setCreateOpen(false);
      setAccountOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const flyoutProps = (label, badge) => {
    if (!collapsed) return {};
    const show = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const rtl = document.documentElement.dir === "rtl";
      setFlyout({
        label,
        badge,
        top: r.top + r.height / 2,
        ...(rtl ? { right: window.innerWidth - r.left + 12 } : { left: r.right + 12 }),
      });
    };
    return {
      onMouseEnter: show,
      onFocus: show,
      onMouseLeave: () => setFlyout(null),
      onBlur: () => setFlyout(null),
    };
  };

  const isOwnProfile = useMemo(() => {
    if (!userKeys?.pub || !pathname?.startsWith("/profile/")) return false;
    const segment = decodeURIComponent(pathname.split("/")[2] || "");
    if (userMetadata?.nip05 && segment === userMetadata.nip05) return true;
    try {
      const decoded = nip19.decode(segment);
      const pubkey = typeof decoded.data === "string" ? decoded.data : decoded.data?.pubkey;
      return pubkey === userKeys.pub;
    } catch {
      return false;
    }
  }, [pathname, userKeys, userMetadata]);

  const within = (...prefixes) =>
    prefixes.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname?.startsWith(`${p}/`)));

  const go = (path, replace = true) => () => customHistory(path, replace);

  const mainLinks = [
    { id: "home", vt: "home", label: t("AJDdA3h"), icon: iconsNames.house_01, onClick: go("/"), active: within("/") },
    { id: "articles", vt: "articles", label: t("AesMg52"), icon: iconsNames.file_blank, onClick: go("/articles"), active: within("/articles", "/article") },
    { id: "media", label: t("A0i2SOt"), icon: iconsNames.camera, onClick: go("/media"), active: within("/media", "/image", "/video") },
    { id: "search", vt: "search", label: t("A0omdiR"), icon: iconsNames.search_magnifying_glass, onClick: go("/search"), active: within("/search") },
    { id: "explore", label: t("ABxLOSx"), icon: iconsNames.compass, onClick: go("/explore"), active: within("/explore") },
    { id: "messages", vt: "messages", label: t("As2zi6P"), icon: iconsNames.chat_conversation, onClick: go("/messages", false), active: within("/messages"), dot: isNewMsg },
    { id: "notifications", vt: "notifications", label: t("ASSFfFZ"), icon: iconsNames.bell, onClick: go("/notifications", false), active: within("/notifications"), badge: newNotificationsCount },
    ...(userKeys
      ? [
          { id: "profile", label: t("A1HzYJS"), icon: iconsNames.user_01, onClick: onProfile, active: isOwnProfile },
          { id: "dashboard", label: t("ALBhi3j"), icon: iconsNames.chart_line, onClick: go("/dashboard"), active: within("/dashboard") },
        ]
      : []),
  ];

  const moreLinks = [
    { id: "orbits", label: t("AjGFut6"), icon: iconsNames.planet, onClick: go("/relay-orbits"), active: within("/relay-orbits") },
    { id: "widgets", label: t("A2mdxcf"), icon: iconsNames.puzzle, onClick: go("/smart-widgets"), active: within("/smart-widgets") },
    ...(userKeys
      ? [
          { id: "blossom", label: t("A8SkkKn"), icon: iconsNames.cloud, onClick: go("/blossom"), active: within("/blossom") },
          { id: "points", label: t("ABsx3n9"), icon: iconsNames.star, onClick: go("/yaki-points"), active: within("/yaki-points") },
        ]
      : []),
  ];
  const moreExtras = [
    { id: "pricing", label: t("APrcng1"), icon: "sats", v: 1, onClick: go("/pricing"), active: within("/pricing") },
    { id: "yakipro", label: "YakiPro", icon: iconsNames.wavy_check, href: "https://pro.yakihonne.com", external: true },
    { id: "mobile", label: t("Ai28b6B"), icon: iconsNames.mobile, onClick: onShowDemo },
  ];
  const moreActive = moreLinks.some((l) => l.active) || moreExtras.some((l) => l.active);

  const accountName =
    userMetadata?.display_name || userMetadata?.name || (userKeys?.pub ? minimizeKey(userKeys.pub) : "");
  const accountHandle =
    userMetadata?.name && userMetadata.name !== accountName ? userMetadata.name : "";

  const toggleWrite = () => {
    if (!canCreate) {
      customHistory("/login");
      return;
    }
    setCreateOpen((v) => !v);
  };

  let moreIndex = 0;

  return (
    <aside
      ref={asideRef}
      className={`csb-sidebar${collapsed ? " is-collapsed" : ""}`}
      aria-label={t("Ayc6Y5B")}
    >
      <div className="csb-head">
        {collapsed ? (
          <button
            type="button"
            className="csb-logo-toggle"
            data-vt="logo"
            onClick={() => setSidebarCollapsed(false)}
            aria-label={t("AsbExpd")}
            title={t("AsbExpd")}
          >
            <span className="csb-logo-mark"><Icon name="yaki-logomark" size={36} /></span>
            <span className="csb-logo-expand"><PanelLeftOpen size={20} /></span>
          </button>
        ) : (
          <button type="button" className="csb-logo" data-vt="logo" onClick={go("/")} aria-label="YakiHonne">
            <Icon name="yakihonne-logo" width={128} height={48} />
          </button>
        )}
        {!collapsed && (
          <div className="csb-head-actions">
            <button
              type="button"
              className="csb-icon-btn"
              onClick={() => setSidebarCollapsed(true)}
              aria-label={t("AsbIcon")}
              title={t("AsbIcon")}
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          className="csb-edge-toggle"
          onClick={() => setSidebarCollapsed(false)}
          aria-label={t("AsbExpd")}
          {...flyoutProps(t("AsbExpd"))}
        >
          <ChevronRight size={16} />
        </button>
      )}

      {!collapsed && userKeys && (
        <BalanceCard
          className="csb-side-balance"
          vt="balance"
          userBalance={userBalance}
          fiatValue={fiatValue}
          currency={currency}
          onOpen={() => customHistory(walletUrl)}
        />
      )}

      <nav className="csb-links">
        {mainLinks.map((item) => (
          <NavRow key={item.id} item={item} active={item.active} collapsed={collapsed} flyoutProps={flyoutProps} />
        ))}

        <div className="csb-more" ref={moreWrapRef}>
          <button
            ref={moreBtnRef}
            type="button"
            className={`csb-row${moreActive || moreOpen ? " is-active" : ""}`}
            data-vt="more"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-label={collapsed ? t("Ayc6Y5B") : undefined}
            {...flyoutProps(t("Ayc6Y5B"))}
          >
            <span className="csb-row-icon">
              <Icon name={iconsNames.menu_alt_05} v={2} size={22} opacity={moreActive ? 1 : 0.85} isBoldThemeColor={moreActive} />
            </span>
            {!collapsed && <span className="csb-row-label">{t("Ayc6Y5B")}</span>}
          </button>
          {moreP.render && (
            <Pop className="csb-side-pop csb-more-pop" closing={moreP.closing} style={morePos} popRef={morePopRef} label={t("Anb1xKp")} role="dialog">
              <div className="csb-pop-head csb-stagger" style={stagger(moreIndex++)}>
                <p className="csb-group-title">{t("Anb1xKp")}</p>
                <button type="button" className="csb-icon-btn csb-icon-btn-sm" onClick={() => setMoreOpen(false)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              {userKeys && (
                <BalanceCard
                  className="csb-more-balance csb-stagger"
                  style={stagger(moreIndex++)}
                  userBalance={userBalance}
                  fiatValue={fiatValue}
                  currency={currency}
                  onOpen={() => {
                    setMoreOpen(false);
                    customHistory(walletUrl);
                  }}
                />
              )}

              <div className="csb-group">
                {moreLinks.map((item) => (
                  <div key={item.id} className="csb-stagger" style={stagger(moreIndex++)}>
                    <NavRow item={item} active={item.active} collapsed={false} onSelect={() => setMoreOpen(false)} />
                  </div>
                ))}
                {moreExtras.map((item) => (
                  <div key={item.id} className="csb-stagger" style={stagger(moreIndex++)}>
                    <NavRow item={item} active={item.active} collapsed={false} accent onSelect={() => setMoreOpen(false)} />
                  </div>
                ))}
              </div>

              {fit === "more" && premium.visible && (
                <div className="csb-stagger" style={stagger(moreIndex++)}>
                  <PremiumSidebarBanner />
                </div>
              )}

              <div className="csb-updates csb-stagger" style={stagger(moreIndex++)}>
                <div>
                  <p className="csb-updates-title">{t("Acq7mWs")}</p>
                  <p className="csb-meta">{process.env.NEXT_PUBLIC_UPDATE_DATE}</p>
                </div>
                <div className="csb-updates-right">
                  <span className="csb-version">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
                  <button
                    type="button"
                    className="csb-link"
                    onClick={() => {
                      setMoreOpen(false);
                      onShowChangelog();
                    }}
                  >
                    {t("Az3tRpL")}
                  </button>
                </div>
              </div>

              <p className="csb-legal csb-stagger" style={stagger(moreIndex++)}>
                <button type="button" onClick={() => { setMoreOpen(false); customHistory("/privacy", true); }}>{t("AH6LUz3")}</button>
                <span aria-hidden="true">·</span>
                <button type="button" onClick={() => { setMoreOpen(false); customHistory("/terms", true); }}>{t("A5LsZ43")}</button>
                <span aria-hidden="true">·</span>
                <button type="button" onClick={() => { setMoreOpen(false); customHistory("/refund-policy", true); }}>{t("ARbkkUU")}</button>
              </p>
            </Pop>
          )}
        </div>

        <div className="csb-write" ref={writeWrapRef}>
          <button
            ref={writeBtnRef}
            type="button"
            className={`csb-write-btn${createOpen ? " is-open" : ""}`}
            data-vt="write"
            onClick={toggleWrite}
            aria-expanded={createOpen}
            aria-label={t("AsbWrNw")}
            {...flyoutProps(t("AsbWrNw"))}
          >
            <span className="csb-write-plus"><Icon name={iconsNames.add_plus} v={2} size={20} opacity={1} /></span>
            {!collapsed && <span>{t("AsbWrNw")}</span>}
          </button>
          {createP.render && (
            <Pop className="csb-side-pop csb-create-pop" closing={createP.closing} style={createPos} popRef={createPopRef} label={t("AsbWrNw")}>
              <p className="csb-group-title csb-stagger" style={stagger(0)}>{t("AsbWrNw")}</p>
              {createItems.map((item, i) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className="csb-row csb-create-row csb-stagger"
                  style={stagger(i + 1)}
                  onClick={() => {
                    setCreateOpen(false);
                    item.action();
                  }}
                >
                  <span className="csb-row-icon"><Icon name={item.icon} v={2} size={22} /></span>
                  <span className="csb-create-text">
                    <span className="csb-row-label">{item.label}</span>
                    <span className="csb-create-desc">{item.description}</span>
                  </span>
                </button>
              ))}
            </Pop>
          )}
        </div>
      </nav>

      <div className="csb-premium-slot" ref={slotRef}>
        {fit === "full" && <PremiumSidebarBanner maxHeight={Math.min(room, 300)} />}
        {fit === "compact" && <PremiumSidebarBanner variant="compact" />}
        {fit === "icon" && <PremiumSidebarBanner variant="icon" flyoutProps={(label) => flyoutProps(label)} />}
      </div>

      {userKeys && (
        <Publishing variant="sidebar" collapsed={collapsed} flyoutProps={(label) => flyoutProps(label)} />
      )}

      {userKeys ? (
        <div className="csb-account" ref={accountRef}>
          <button
            type="button"
            className={`csb-account-card${isAccountSwitching ? " is-switching" : ""}`}
            data-vt="account"
            onClick={() => setAccountOpen((v) => !v)}
            aria-expanded={accountOpen}
            aria-label={accountName}
          >
            <span className="csb-avatar" aria-hidden="true">
              <UserProfilePic
                size={collapsed ? 36 : 40}
                mainAccountUser
                allowClick={false}
                allowPropagation={true}
                isSwitching={isAccountSwitching}
              />
            </span>
            {!collapsed && (
              <span className="csb-account-text">
                <span className="csb-account-name">{accountName}</span>
                {accountHandle && <span className="csb-account-sub">@{accountHandle}</span>}
              </span>
            )}
            {!collapsed && <ChevronsUpDown size={16} className="csb-account-chev" />}
          </button>
          {accountP.render && (
            <Pop className="csb-account-pop" closing={accountP.closing} label={accountName}>
              <button type="button" role="menuitem" className="csb-menu-item" onClick={() => { setAccountOpen(false); onProfile(); }}>
                <Icon name={iconsNames.user_01} v={2} size={18} /> <span>{t("A1HzYJS")}</span>
              </button>
              <button type="button" role="menuitem" className="csb-menu-item" onClick={() => { setAccountOpen(false); customHistory("/subscription"); }}>
                <Icon name="credit_card" size={18} /> <span>{t("Ar1oBm3")}</span>
              </button>
              <button type="button" role="menuitem" className="csb-menu-item" onClick={() => { setAccountOpen(false); customHistory("/creators-subscriptions"); }}>
                <Icon name="crown" size={18} /> <span>{t("AC8k2xO")}</span>
              </button>
              <button type="button" role="menuitem" className="csb-menu-item" onClick={() => { setAccountOpen(false); customHistory("/settings"); }}>
                <Icon name={iconsNames.settings} v={2} size={18} /> <span>{t("ABtsLBp")}</span>
              </button>
              <button type="button" role="menuitem" className="csb-menu-item csb-danger" onClick={() => { setAccountOpen(false); onSingleLogout(); }}>
                <Icon name="logout" size={18} /> <span>{t("AyXwdfE")}</span>
              </button>
              <div className="csb-menu-sep" />
              <p className="csb-menu-title">{t("AT2OPkx")}</p>
              {accounts.map((account) => {
                const isCurrent = userKeys.pub === account.pubkey;
                return (
                  <button
                    key={account.pubkey}
                    type="button"
                    role="menuitem"
                    className={`csb-menu-item csb-account-item${isCurrent ? " is-current" : ""}`}
                    onClick={() => {
                      setAccountOpen(false);
                      if (!isCurrent) onSwitchAccount(account);
                    }}
                  >
                    <span className="csb-account-item-pic">
                      <UserProfilePic
                        size={32}
                        mainAccountUser={false}
                        img={account.picture}
                        user_id={account.userKeys.pub}
                        allowClick={false}
                      />
                    </span>
                    <span className="csb-menu-stack">
                      <span className="p-one-line">{account.display_name || account.name || minimizeKey(account.pubkey)}</span>
                      {getAccountKindTag({ account })}
                    </span>
                    {isCurrent && <span className="csb-current-dot" aria-hidden="true" />}
                  </button>
                );
              })}
              <button type="button" role="menuitem" className="csb-menu-item" onClick={() => { setAccountOpen(false); redirectToLogin(); }}>
                <Icon name="plus-sign" size={18} /> <span>{t("AnDg41L")}</span>
              </button>
              <button type="button" role="menuitem" className="csb-menu-item csb-danger" onClick={() => { setAccountOpen(false); onMultiLogout(); }}>
                <Icon name="logout" size={18} /> <span>{t("AWFCAQG")}</span>
              </button>
            </Pop>
          )}
        </div>
      ) : (
        <button type="button" className="csb-login-btn" data-vt="login" onClick={redirectToLogin} aria-label={t("AmOtzoL")} {...flyoutProps(t("AmOtzoL"))}>
          {collapsed ? <Icon name="connect" size={20} /> : t("AmOtzoL")}
        </button>
      )}

      {collapsed && flyout && (
        <span
          className="csb-flyout"
          role="tooltip"
          style={{ top: flyout.top, left: flyout.left, right: flyout.right }}
        >
          {flyout.label}
          {flyout.badge ? <span className="csb-flyout-badge">{flyout.badge}</span> : null}
        </span>
      )}
    </aside>
  );
}
