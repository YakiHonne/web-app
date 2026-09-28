import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Head from "next/head";
import { useTheme } from "next-themes";
import {
  House,
  Compass,
  FileText,
  Camera,
  Orbit,
  Puzzle,
  Mail,
  Bell,
  User,
  LineChart,
  Cloud,
  Star,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Plus,
  StickyNote,
  Image as ImageIcon,
  LayoutGrid,
  Coins,
  BadgeCheck,
  Smartphone,
  ArrowUpRight,
  Layers,
  CircleCheck,
  CircleX,
  Settings,
  LogOut,
  Check,
  CreditCard,
  Users,
  X,
  Ellipsis,
  ChevronRight,
  Crown,
  Loader,
} from "lucide-react";
import { proUpdatesList, proUpdatesVersion, updatesList } from "@/Components/YakiIntro";
import Icon from "@/Components/Icon";

const BANNER_URL =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/premium-banner.png";

const ESSENTIAL = [
  { id: "home", label: "Home", icon: House },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "media", label: "Media", icon: Camera },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "messages", label: "Messages", icon: Mail, badge: 3 },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 12 },
  { id: "profile", label: "My profile", icon: User },
  { id: "dashboard", label: "Dashboard", icon: LineChart },
  { id: "blossom", label: "Blossom storage", icon: Cloud },
];

const MORE_LINKS = [
  { id: "orbits", label: "Relay Orbits", icon: Orbit },
  { id: "widgets", label: "Smart widgets", icon: Puzzle },
  { id: "points", label: "Yaki points", icon: Star },
];

const MORE_EXTRAS = [
  { id: "pricing", label: "Pricing", icon: Coins },
  { id: "yakipro", label: "YakiPro", icon: BadgeCheck, external: true },
  { id: "mobile", label: "Mobile app", icon: Smartphone },
];

const MORE_IDS = new Set([...MORE_LINKS, ...MORE_EXTRAS].map((i) => i.id));

const CREATE = [
  { id: "note", label: "Note", desc: "Quick post", icon: StickyNote },
  { id: "article", label: "Article", desc: "Long-form", icon: FileText },
  { id: "media", label: "Media", desc: "Photo or clip", icon: ImageIcon },
  { id: "widget", label: "Widget", desc: "Smart embed", icon: LayoutGrid },
];

const ACCOUNTS = [
  { id: "a1", name: "Mostafa", handle: "mostafa@yakihonne.com", initial: "M", active: true },
  { id: "a2", name: "YakiHonne", handle: "yakihonne@yakihonne.com", initial: "Y" },
];

const PLACEMENT = [
  ["Home, Articles", "Top bar", "Sidebar"],
  ["Messages, Notifications", "Top bar", "Sidebar, with unread counts"],
  ["Media, Explore", "More drawer", "Sidebar"],
  ["My profile", "Avatar menu", "Sidebar"],
  ["Dashboard, Blossom storage", "More drawer", "Sidebar"],
  ["Premium banner or trial countdown", "More drawer", "Sidebar, sized to the room left"],
  ["Published Events", "More drawer", "Sidebar, one line with the counts"],
  ["Note, Article, Media, Widget", "Plus button", "Write new button under More, opens beside the sidebar"],
  ["Search, wallet balance", "Top bar", "Next to the logo, under the logo"],
  ["Relay Orbits, Smart widgets, Yaki points", "More drawer", "More panel"],
  ["Pricing, YakiPro, Mobile app", "More drawer", "More panel"],
  ["Updates and changelog, legal links", "More drawer", "More panel"],
  ["Subscription & Usage, Creators subscriptions, Settings, accounts, log out", "Avatar menu", "Account card menu"],
];

const SIZES = [
  ["Up to 1599px wide", "1200px", "260px", "40px"],
  ["1600px to 1919px wide", "1320px", "280px", "44px"],
  ["1920px to 2399px wide", "1440px", "300px", "46px"],
  ["2400px wide and up", "1680px", "330px", "52px"],
  ["Shorter than 900px tall", "same", "same", "same, balance moves into More"],
  ["Shorter than 760px tall", "same", "same", "34px"],
  ["Shorter than 640px tall", "same", "same", "30px"],
];

const COMPARISON = [
  ["Placement", "Centered with the content", "Centered with the content, frame grows on large screens"],
  ["Short screens", "Links fell below the fold and had to be scrolled to", "The nine links always fit, the rest are one click away in More"],
  ["Large screens", "Same size on every screen", "Frame, sidebar, rows and icons grow in four steps"],
  ["Icons-only view", "No labels and no tooltips, icons had to be guessed", "Every icon shows its name on hover, with its unread count"],
  ["Active item", "Lit only on the exact page, lost on any sub-page", "Stays lit anywhere inside that section, including pages inside More"],
  ["Writing", "One button that opened a chooser", "Write new opens a glass panel beside the sidebar with the four choices"],
  ["Keyboard", "Links could not be reached with Tab", "Every row is focusable, Escape closes More"],
];

function flyoutHandlers(collapsed, showFlyout, label, badge) {
  if (!collapsed) return {};
  const show = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    showFlyout({ label, badge, top: r.top + r.height / 2, left: r.right + 12 });
  };
  return {
    onMouseEnter: show,
    onFocus: show,
    onMouseLeave: () => showFlyout(null),
    onBlur: () => showFlyout(null),
  };
}

function NavRow({ item, active, collapsed, onSelect, showFlyout, accent }) {
  const IconC = item.icon;
  return (
    <button
      type="button"
      className={`sd-row${active ? " is-active" : ""}${accent ? " is-accent" : ""}`}
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      {...flyoutHandlers(collapsed, showFlyout, item.label, item.badge)}
    >
      <span className="sd-row-icon">
        <IconC strokeWidth={active ? 2.4 : 1.9} />
        {item.badge && collapsed && <span className="sd-dot" aria-hidden="true" />}
      </span>
      {!collapsed && <span className="sd-row-label">{item.label}</span>}
      {!collapsed && item.badge && <span className="sd-badge">{item.badge}</span>}
      {!collapsed && item.external && <ArrowUpRight size={14} className="sd-ext" />}
    </button>
  );
}

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
    const t = setTimeout(() => {
      setRender(false);
      setClosing(false);
    }, ms);
    return () => clearTimeout(t);
  }, [open, ms]);
  return { render, closing };
}

const stagger = (i) => ({ "--i": i });

function Pop({ className = "", closing, style, popRef, label, role = "menu", children }) {
  return (
    <div
      ref={popRef}
      className={`sd-pop ${className}${closing ? " is-closing" : ""}`}
      style={style}
      role={role}
      aria-label={label}
    >
      <div className="sd-pop-glass" aria-hidden="true" />
      <div className="sd-pop-body">{children}</div>
    </div>
  );
}

function BalanceCard({ className = "", style }) {
  return (
    <button type="button" className={`sd-wallet ${className}`} style={style} aria-label="Wallet, 12,450 sats, about 8.21 USD">
      <span className="sd-wallet-dot" aria-hidden="true">₿</span>
      <span className="sd-wallet-text">
        <span className="sd-wallet-label">Balance</span>
        <span className="sd-wallet-roll">
          <span className="sd-wallet-stack">
            <span className="sd-wallet-value">12,450 <span className="sd-wallet-unit">sats</span></span>
            <span className="sd-wallet-value">8.21 <span className="sd-wallet-unit">USD</span></span>
          </span>
        </span>
      </span>
      <ChevronRight size={16} className="sd-wallet-chev" />
    </button>
  );
}

function CreatePanel({ closing, style, popRef, onPick }) {
  return (
    <Pop className="sd-side-pop sd-create-pop" closing={closing} style={style} popRef={popRef} label="Write new">
      <p className="sd-group-title sd-stagger" style={stagger(0)}>Write new</p>
      {CREATE.map((c, i) => {
        const I = c.icon;
        return (
          <button
            key={c.id}
            type="button"
            role="menuitem"
            className="sd-row sd-create-row sd-stagger"
            style={stagger(i + 1)}
            onClick={onPick}
          >
            <span className="sd-row-icon"><I strokeWidth={1.9} /></span>
            <span className="sd-create-text">
              <span className="sd-row-label">{c.label}</span>
              <span className="sd-create-desc">{c.desc}</span>
            </span>
          </button>
        );
      })}
    </Pop>
  );
}

function MorePanel({ active, onSelect, bannerMode, bannerInMore, onChangelog, onClose, closing, style, popRef }) {
  let i = 0;
  return (
    <Pop className="sd-side-pop sd-more-pop" closing={closing} style={style} popRef={popRef} label="More" role="dialog">
      <div className="sd-more-head sd-stagger" style={stagger(i++)}>
        <p className="sd-group-title">More features</p>
        <button type="button" className="sd-icon-btn sd-icon-btn-sm" onClick={onClose} aria-label="Close more">
          <X size={16} />
        </button>
      </div>

      <BalanceCard className="sd-more-balance sd-stagger" style={stagger(i++)} />

      <div className="sd-group">
        {MORE_LINKS.map((it) => (
          <div key={it.id} className="sd-stagger" style={stagger(i++)}>
            <NavRow item={it} active={active === it.id} collapsed={false} onSelect={onSelect} />
          </div>
        ))}
        {MORE_EXTRAS.map((it) => (
          <div key={it.id} className="sd-stagger" style={stagger(i++)}>
            <NavRow item={it} active={active === it.id} collapsed={false} onSelect={onSelect} accent />
          </div>
        ))}
      </div>

      {bannerInMore && bannerMode !== "none" && (
        <div className="sd-stagger" style={stagger(i++)}>
          {bannerMode === "free" ? (
            <button type="button" className="sd-banner" aria-label="Upgrade to premium">
              <img src={BANNER_URL} alt="" loading="lazy" />
            </button>
          ) : (
            <button type="button" className="sd-trial">
              <span className="sd-trial-text"><Crown size={16} /> 5 days left in your trial</span>
              <span className="sd-trial-cta">Upgrade</span>
            </button>
          )}
        </div>
      )}

      <div className="sd-updates sd-stagger" style={stagger(i++)}>
        <div>
          <p className="sd-updates-title">Updates</p>
          <p className="sd-meta">{process.env.NEXT_PUBLIC_UPDATE_DATE || "06/09/2026"}</p>
        </div>
        <div className="sd-updates-right">
          <span className="sd-version">v{process.env.NEXT_PUBLIC_APP_VERSION || "6.0.2"}</span>
          <button type="button" className="sd-link" onClick={onChangelog}>See changelog</button>
        </div>
      </div>

      <p className="sd-legal sd-stagger" style={stagger(i++)}>
        <a href="/privacy">Privacy policies</a>
        <span aria-hidden="true">·</span>
        <a href="/terms">Terms &amp; conditions</a>
        <span aria-hidden="true">·</span>
        <a href="/refund-policy">Refund policy</a>
      </p>
    </Pop>
  );
}

function usePremiumFit(slotRef, bannerMode, collapsed) {
  const [fit, setFit] = useState("full");
  const [room, setRoom] = useState(0);
  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      setRoom(h);
      if (bannerMode === "none") return setFit("none");
      if (collapsed) return setFit(h >= 40 ? "icon" : "more");
      if (bannerMode === "trial") return setFit(h >= 46 ? "compact" : "more");
      if (h >= 128) return setFit("full");
      if (h >= 46) return setFit("compact");
      return setFit("more");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slotRef, bannerMode, collapsed]);
  return { fit, room };
}

function PremiumSlot({ slotRef, fit, room, bannerMode, collapsed, showFlyout }) {
  return (
    <div className="sd-premium-slot" ref={slotRef}>
      {fit === "full" && (
        <button type="button" className="sd-banner sd-banner-fit" aria-label="Upgrade to premium">
          <img src={BANNER_URL} alt="" style={{ maxHeight: Math.min(room, 300) }} />
        </button>
      )}
      {fit === "compact" && bannerMode === "free" && (
        <button type="button" className="sd-trial">
          <span className="sd-trial-text"><Crown size={16} /> Go premium</span>
          <span className="sd-trial-cta">Upgrade</span>
        </button>
      )}
      {fit === "compact" && bannerMode === "trial" && (
        <button type="button" className="sd-trial">
          <span className="sd-trial-text"><Crown size={16} /> 5 days left in your trial</span>
          <span className="sd-trial-cta">Upgrade</span>
        </button>
      )}
      {fit === "icon" && (
        <button
          type="button"
          className="sd-row sd-premium-icon"
          aria-label={bannerMode === "trial" ? "5 days left in your trial" : "Go premium"}
          {...flyoutHandlers(collapsed, showFlyout, bannerMode === "trial" ? "5 days left in your trial" : "Go premium")}
        >
          <span className="sd-row-icon"><Crown strokeWidth={2} /></span>
        </button>
      )}
    </div>
  );
}

function EventsStrip({ failed, publishing, collapsed, showFlyout }) {
  const total = 24;
  const ok = total - failed;
  const label = publishing
    ? "Publishing 1 event, 3 of 5 relays"
    : `Published events: ${total} total, ${ok} succeeded, ${failed} failed`;
  if (collapsed) {
    return (
      <button
        type="button"
        className="sd-row sd-events-icon"
        aria-label={label}
        {...flyoutHandlers(true, showFlyout, publishing ? "Publishing 1 event" : failed ? `${failed} events failed` : `${total} events published`)}
      >
        <span className="sd-row-icon">
          {publishing ? <Loader className="sd-spin" strokeWidth={2} /> : <Layers strokeWidth={1.9} />}
          {failed && !publishing ? <span className="sd-dot is-red" aria-hidden="true" /> : null}
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`sd-events${failed && !publishing ? " has-failed" : ""}${publishing ? " is-publishing" : ""}`}
      aria-label={label}
    >
      <span className="sd-events-title">
        {publishing ? <Loader size={16} className="sd-spin" /> : <Layers size={16} />}
        {publishing ? "Publishing…" : "Published events"}
      </span>
      {publishing ? (
        <span className="sd-events-count"><span className="sd-meta">3/5 relays</span></span>
      ) : (
        <span className="sd-events-count">
          <span className="sd-events-stat is-ok" title="Succeeded"><CircleCheck size={13} strokeWidth={2.4} /> {ok}</span>
          {failed ? (
            <span className="sd-events-stat is-bad" title="Failed"><CircleX size={13} strokeWidth={2.4} /> {failed}</span>
          ) : null}
        </span>
      )}
    </button>
  );
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
      if (window.innerWidth <= 900) {
        const top = Math.max(12, Math.min(b.bottom + 8, vh - h - 12));
        setPos({ top, left: 16, right: 16, transformOrigin: "top center" });
        return;
      }
      const top = Math.max(12, Math.min(b.top - 10, vh - h - 12));
      const originY = Math.round(b.top + b.height / 2 - top);
      setPos({ top, left: sb.right + 10, transformOrigin: `left ${originY}px` });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render, ...deps]);
  return pos ? pos : { visibility: "hidden" };
}

function Sidebar({ collapsed, setCollapsed, active, setActive, bannerMode, failed, publishing, onChangelog }) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [flyout, setFlyout] = useState(null);
  const composeRef = useRef(null);
  const accountRef = useRef(null);
  const moreRef = useRef(null);
  const moreBtnRef = useRef(null);
  const panelRef = useRef(null);
  const writeBtnRef = useRef(null);
  const createRef = useRef(null);
  const asideRef = useRef(null);
  const slotRef = useRef(null);
  const { fit, room } = usePremiumFit(slotRef, bannerMode, collapsed);
  const composeP = usePresence(composeOpen);
  const accountP = usePresence(accountOpen);
  const moreP = usePresence(moreOpen);
  const panelPos = useSidePlacement(moreP.render, moreBtnRef, panelRef, asideRef, [bannerMode, fit, collapsed]);
  const createPos = useSidePlacement(composeP.render, writeBtnRef, createRef, asideRef, [collapsed]);

  useEffect(() => {
    if (!collapsed) setFlyout(null);
  }, [collapsed]);

  useEffect(() => {
    const close = (e) => {
      if (composeRef.current && !composeRef.current.contains(e.target)) setComposeOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setComposeOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const select = (id) => {
    setActive(id);
    setMoreOpen(false);
  };
  const rowProps = { collapsed, onSelect: select, showFlyout: setFlyout };
  const moreActive = MORE_IDS.has(active);

  return (
    <aside ref={asideRef} className={`sd-sidebar${collapsed ? " is-collapsed" : ""}`} aria-label="Main navigation">
      <div className="sd-head">
        {collapsed ? (
          <button
            type="button"
            className="sd-logo-toggle"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <span className="sd-logo-mark"><Icon name="yaki-logomark" size={36} /></span>
            <span className="sd-logo-expand"><PanelLeftOpen size={20} /></span>
          </button>
        ) : (
          <span className="sd-logo" aria-label="YakiHonne">
            <Icon name="yakihonne-logo" width={128} height={48} />
          </span>
        )}
        {!collapsed && (
          <div className="sd-head-actions">
            <button type="button" className="sd-icon-btn" aria-label="Search" title="Search">
              <Search size={18} />
            </button>
            <button
              type="button"
              className="sd-icon-btn"
              onClick={() => setCollapsed(true)}
              aria-label="Show icons only"
              title="Show icons only"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        )}
      </div>

      {collapsed && (
        <button type="button" className="sd-row sd-fixed" aria-label="Search" {...flyoutHandlers(true, setFlyout, "Search")}>
          <span className="sd-row-icon"><Search strokeWidth={1.9} /></span>
        </button>
      )}

      {!collapsed && <BalanceCard className="sd-side-balance" />}

      <nav className="sd-links">
        {ESSENTIAL.map((it) => (
          <NavRow key={it.id} item={it} active={active === it.id} {...rowProps} />
        ))}
        <div className="sd-more" ref={moreRef}>
          <button
            ref={moreBtnRef}
            type="button"
            className={`sd-row${moreActive || moreOpen ? " is-active" : ""}`}
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-label={collapsed ? "More" : undefined}
            {...flyoutHandlers(collapsed, setFlyout, "More")}
          >
            <span className="sd-row-icon">
              <Ellipsis strokeWidth={moreActive ? 2.4 : 1.9} />
            </span>
            {!collapsed && <span className="sd-row-label">More</span>}
          </button>
          {moreP.render && (
            <MorePanel
              popRef={panelRef}
              closing={moreP.closing}
              style={panelPos}
              active={active}
              onSelect={select}
              bannerMode={bannerMode}
              bannerInMore={fit === "more"}
              onChangelog={() => {
                setMoreOpen(false);
                onChangelog();
              }}
              onClose={() => setMoreOpen(false)}
            />
          )}
        </div>

        <div className="sd-write" ref={composeRef}>
          <button
            ref={writeBtnRef}
            type="button"
            className={`sd-write-btn${composeOpen ? " is-open" : ""}`}
            onClick={() => setComposeOpen((v) => !v)}
            aria-expanded={composeOpen}
            aria-label="Write new"
            {...flyoutHandlers(collapsed, setFlyout, "Write new")}
          >
            <Plus size={20} strokeWidth={2.6} />
            {!collapsed && <span>Write new</span>}
          </button>
          {composeP.render && (
            <CreatePanel
              popRef={createRef}
              closing={composeP.closing}
              style={createPos}
              onPick={() => setComposeOpen(false)}
            />
          )}
        </div>
      </nav>

      <PremiumSlot
        slotRef={slotRef}
        fit={fit}
        room={room}
        bannerMode={bannerMode}
        collapsed={collapsed}
        showFlyout={setFlyout}
      />

      <EventsStrip failed={failed} publishing={publishing} collapsed={collapsed} showFlyout={setFlyout} />

      <div className="sd-account" ref={accountRef}>
        <button
          type="button"
          className="sd-account-card"
          onClick={() => setAccountOpen((v) => !v)}
          aria-expanded={accountOpen}
          aria-label="Account menu"
        >
          <span className="sd-avatar" aria-hidden="true">
            <svg className="sd-ring" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" className="sd-ring-track" />
              <circle cx="20" cy="20" r="18" className="sd-ring-fill" />
            </svg>
            <span className="sd-avatar-inner">M</span>
          </span>
          {!collapsed && (
            <span className="sd-account-text">
              <span className="sd-account-name">Mostafa</span>
              <span className="sd-account-sub">@mostafa</span>
            </span>
          )}
          {!collapsed && <ChevronsUpDown size={16} className="sd-account-chev" />}
        </button>
        {accountP.render && (
          <Pop className="sd-account-pop" closing={accountP.closing} label="Account menu">
            <button type="button" role="menuitem" className="sd-menu-item"><User size={17} /> <span>My profile</span></button>
            <button type="button" role="menuitem" className="sd-menu-item"><CreditCard size={17} /> <span>Subscription &amp; Usage</span></button>
            <button type="button" role="menuitem" className="sd-menu-item"><Users size={17} /> <span>Creators subscriptions</span></button>
            <button type="button" role="menuitem" className="sd-menu-item"><Settings size={17} /> <span>Settings</span></button>
            <button type="button" role="menuitem" className="sd-menu-item sd-danger"><LogOut size={17} /> <span>Log out</span></button>
            <div className="sd-menu-sep" />
            <p className="sd-menu-title">Switch account</p>
            {ACCOUNTS.map((a) => (
              <button key={a.id} type="button" role="menuitem" className="sd-menu-item">
                <span className="sd-avatar-sm">{a.initial}</span>
                <span className="sd-menu-stack">
                  <span>{a.name}</span>
                  <span className="sd-menu-sub">{a.handle}</span>
                </span>
                {a.active && <Check size={16} className="sd-check" />}
              </button>
            ))}
            <button type="button" role="menuitem" className="sd-menu-item"><Plus size={17} /> <span>Add account</span></button>
            <button type="button" role="menuitem" className="sd-menu-item sd-danger"><LogOut size={17} /> <span>Log out all</span></button>
          </Pop>
        )}
      </div>

      {collapsed && flyout && (
        <span className="sd-flyout" role="tooltip" style={{ top: flyout.top, left: flyout.left }}>
          {flyout.label}
          {flyout.badge ? <span className="sd-flyout-badge">{flyout.badge}</span> : null}
        </span>
      )}
    </aside>
  );
}

function LayoutChoice() {
  const [layout, setLayout] = useState("classic");
  const [startCollapsed, setStartCollapsed] = useState(false);
  return (
    <div className="sd-settings">
      <p className="sd-settings-label">Navigation layout</p>
      <p className="sd-settings-desc">Choose where the main menu lives. Applies on screens wider than 1024px.</p>
      <div className="sd-choices" role="radiogroup" aria-label="Navigation layout">
        {[
          { id: "modern", label: "Top bar", desc: "Current look" },
          { id: "classic", label: "Sidebar", desc: "Classic look" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={layout === c.id}
            className={`sd-choice${layout === c.id ? " is-on" : ""}`}
            onClick={() => setLayout(c.id)}
          >
            <span className={`sd-thumb sd-thumb-${c.id}`} aria-hidden="true">
              {c.id === "modern" ? (
                <>
                  <span className="t-bar"><span className="t-pill" /></span>
                  <span className="t-body"><span className="t-feed" /></span>
                </>
              ) : (
                <span className="t-frame">
                  <span className="t-side">
                    <span className="t-line" /><span className="t-line" /><span className="t-line" />
                    <span className="t-line short" /><span className="t-line short" />
                  </span>
                  <span className="t-body"><span className="t-feed" /></span>
                </span>
              )}
            </span>
            <span className="sd-choice-text">
              <span className="sd-choice-label">{c.label}</span>
              <span className="sd-choice-desc">{c.desc}</span>
            </span>
            <span className="sd-radio" aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="sd-settings-row">
        <div>
          <p className="sd-settings-label">Start with icons only</p>
          <p className="sd-settings-desc">Keep the sidebar narrow until you expand it.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={startCollapsed}
          aria-label="Start with icons only"
          className={`sd-switch${startCollapsed ? " is-on" : ""}`}
          onClick={() => setStartCollapsed((v) => !v)}
        >
          <span />
        </button>
      </div>
    </div>
  );
}

function Changelog({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="sd-modal-scrim" onClick={onClose}>
      <div className="sd-modal" role="dialog" aria-label="Changelog" onClick={(e) => e.stopPropagation()}>
        <div className="sd-modal-head">
          <div>
            <p className="sd-settings-label">Changelog</p>
            <p className="sd-meta">({process.env.NEXT_PUBLIC_UPDATE_DATE || "06/09/2026"})</p>
          </div>
          <span className="sd-version">v{process.env.NEXT_PUBLIC_APP_VERSION || "6.0.2"}</span>
          <button type="button" className="sd-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <ul className="sd-list">
          {updatesList.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
        <div className="sd-modal-head sd-modal-sub">
          <p className="sd-settings-label">YakiPro</p>
          <span className="sd-version">v{proUpdatesVersion}</span>
        </div>
        <ul className="sd-list">
          {proUpdatesList.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default function SidebarDesign() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("home");
  const [bannerMode, setBannerMode] = useState("free");
  const [failed, setFailed] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const { theme, setTheme } = useTheme();
  const originalTheme = useRef(null);
  const setThemeRef = useRef(setTheme);
  setThemeRef.current = setTheme;

  useEffect(() => {
    if (originalTheme.current === null && theme) originalTheme.current = theme;
  }, [theme]);

  useEffect(() => {
    return () => {
      if (originalTheme.current) setThemeRef.current(originalTheme.current);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Sidebar design proposal</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="sd-page">
        <div className="sd-frame">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            active={active}
            setActive={setActive}
            bannerMode={bannerMode}
            failed={failed}
            publishing={publishing}
            onChangelog={() => setShowChangelog(true)}
          />

          <main className="sd-doc">
            <div className="sd-toolbar">
              <div className="sd-seg" role="group" aria-label="Sidebar width">
                <button type="button" className={!collapsed ? "is-on" : ""} onClick={() => setCollapsed(false)}>Full</button>
                <button type="button" className={collapsed ? "is-on" : ""} onClick={() => setCollapsed(true)}>Icons only</button>
              </div>
              <div className="sd-seg" role="group" aria-label="Premium banner">
                <button type="button" className={bannerMode === "free" ? "is-on" : ""} onClick={() => setBannerMode("free")}>Free user</button>
                <button type="button" className={bannerMode === "trial" ? "is-on" : ""} onClick={() => setBannerMode("trial")}>On trial</button>
                <button type="button" className={bannerMode === "none" ? "is-on" : ""} onClick={() => setBannerMode("none")}>Premium</button>
              </div>
              <div className="sd-seg" role="group" aria-label="Publishing log">
                <button type="button" className={failed === 0 && !publishing ? "is-on" : ""} onClick={() => { setFailed(0); setPublishing(false); }}>All published</button>
                <button type="button" className={failed > 0 && !publishing ? "is-on" : ""} onClick={() => { setFailed(2); setPublishing(false); }}>Some failed</button>
                <button type="button" className={publishing ? "is-on" : ""} onClick={() => setPublishing(true)}>Publishing now</button>
              </div>
              <div className="sd-seg" role="group" aria-label="Preview theme">
                {[
                  ["dark", "Noir"],
                  ["gray", "Graphite"],
                  ["light", "Neige"],
                  ["creamy", "Ivory"],
                ].map(([th, label]) => (
                  <button key={th} type="button" className={theme === th ? "is-on" : ""} onClick={() => setTheme(th)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <header className="sd-hero">
              <p className="sd-eyebrow">Design proposal · for review</p>
              <h1>The classic sidebar, back</h1>
              <p className="sd-lede">
                An opt-in layout in Settings, under Appearance. The sidebar and the content share one centered frame,
                as in v5. The sidebar keeps nine links, the premium banner and a one-line Published Events summary.
                The rest of today’s More drawer opens from More, in the same glass panel style as the rest of the app. Try resizing the window: the sidebar grows on large
                screens, tightens on short ones, and the banner shrinks to fit the room that is left.
              </p>
            </header>

            <section className="sd-section">
              <h2>Where everything goes</h2>
              <p>Nothing from today’s navigation is dropped. Each item keeps its name and destination.</p>
              <div className="sd-table" role="table" aria-label="Where each item moves">
                <div className="sd-tr sd-th" role="row">
                  <span role="columnheader">Item</span>
                  <span role="columnheader">Today</span>
                  <span role="columnheader">With the sidebar</span>
                </div>
                {PLACEMENT.map(([item, today, where]) => (
                  <div className="sd-tr" role="row" key={item}>
                    <span role="rowheader" className="sd-td-key">{item}</span>
                    <span role="cell" className="sd-td-before">{today}</span>
                    <span role="cell" className="sd-td-after">{where}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="sd-section">
              <h2>Sizes</h2>
              <p>
                Everything together needs about 1,040px of height, and a 1280×720 laptop has much less. So the sidebar
                holds nine links plus More, scales in steps, and the banner takes whatever height is left. With room, the
                full banner shows. With less, it becomes a one-line “Go premium” strip. Only when even that does not
                fit does it move into More.
              </p>
              <div className="sd-table sd-table-4" role="table" aria-label="Sizes by screen">
                <div className="sd-tr sd-th" role="row">
                  <span role="columnheader">Screen</span>
                  <span role="columnheader">Frame</span>
                  <span role="columnheader">Sidebar</span>
                  <span role="columnheader">Link rows</span>
                </div>
                {SIZES.map(([screen, frame, side, row]) => (
                  <div className="sd-tr" role="row" key={screen}>
                    <span role="rowheader" className="sd-td-key">{screen}</span>
                    <span role="cell">{frame}</span>
                    <span role="cell">{side}</span>
                    <span role="cell">{row}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="sd-section">
              <h2>What gets better than v5</h2>
              <div className="sd-table" role="table" aria-label="Comparison with the v5 sidebar">
                <div className="sd-tr sd-th" role="row">
                  <span role="columnheader" />
                  <span role="columnheader">v5 sidebar</span>
                  <span role="columnheader">Proposed</span>
                </div>
                {COMPARISON.map(([k, before, after]) => (
                  <div className="sd-tr" role="row" key={k}>
                    <span role="rowheader" className="sd-td-key">{k}</span>
                    <span role="cell" className="sd-td-before">{before}</span>
                    <span role="cell" className="sd-td-after">{after}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="sd-section">
              <h2>The setting</h2>
              <p>
                A new row in Settings → Appearance, under the theme cards and next to font size. The top bar stays the
                default, so nobody’s layout changes without asking. The choice is stored on the device, the same way
                font size is today.
              </p>
              <LayoutChoice />
            </section>

            <section className="sd-section">
              <h2>How it fits the rest of the app</h2>
              <ul className="sd-list">
                <li><strong>The top bar goes away on this layout.</strong> Everything it held is in the sidebar or in More, so navigation never appears twice.</li>
                <li><strong>More opens beside the sidebar</strong> and holds the rest of today’s More drawer: Relay Orbits, Smart widgets, Yaki points, Pricing, YakiPro, Mobile app, Updates and the legal links.</li>
                <li><strong>Published Events stays visible.</strong> One line shows how many events succeeded and, when any did, how many failed, with a red outline. While an event is going out it shows a spinner and the relay count. Clicking it opens the full log, as today.</li>
                <li><strong>Phones keep the bottom bar.</strong> Below 1024px the sidebar is not shown and the current mobile navigation is used, whichever layout is chosen.</li>
                <li><strong>Built on the existing pieces.</strong> The premium banner, the publishing log, the changelog, notifications, messages, account switching and the post chooser reuse the components the top bar uses today.</li>
              </ul>
            </section>

            <section className="sd-section sd-questions">
              <h2>Decisions needed before building</h2>
              <ol className="sd-list">
                <li>Are Home, Articles, Media, Explore, Messages, Notifications, My profile, Dashboard and Blossom storage the right nine to keep in the sidebar?</li>
                <li>Keep the icons-only option, or ship the full sidebar only, as in v5?</li>
                <li>The first-run tour points at top bar buttons. With the sidebar on, should it get its own tour, or be skipped?</li>
              </ol>
            </section>
          </main>
        </div>
      </div>
      {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}

      <style jsx global>{`
        .sd-page {
          position: fixed;
          inset: 0;
          z-index: 50;
          overflow-y: auto;
          background: var(--white);
          color: var(--black);
          --sd-frame: 1200px;
          --sd-w: 260px;
          --sd-row: 40px;
          --sd-font: 1rem;
          --sd-icon: 22px;
          --sd-gap: 12px;
          --sd-panel: 300px;
        }
        @media (min-width: 1600px) {
          .sd-page {
            --sd-frame: 1320px;
            --sd-w: 280px;
            --sd-row: 44px;
            --sd-font: 1.06rem;
            --sd-icon: 23px;
            --sd-panel: 320px;
          }
        }
        @media (min-width: 1920px) {
          .sd-page {
            --sd-frame: 1440px;
            --sd-w: 300px;
            --sd-row: 46px;
            --sd-font: 1.12rem;
            --sd-icon: 24px;
            --sd-gap: 14px;
            --sd-panel: 340px;
          }
        }
        @media (min-width: 2400px) {
          .sd-page {
            --sd-frame: 1680px;
            --sd-w: 330px;
            --sd-row: 52px;
            --sd-font: 1.2rem;
            --sd-icon: 26px;
            --sd-gap: 16px;
            --sd-panel: 360px;
          }
        }
        @media (max-height: 760px) {
          .sd-page {
            --sd-row: 34px;
            --sd-gap: 8px;
          }
        }
        @media (max-height: 640px) {
          .sd-page {
            --sd-row: 30px;
            --sd-gap: 6px;
          }
        }

        .sd-frame {
          width: min(100%, var(--sd-frame));
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
        }

        .sd-sidebar {
          position: sticky;
          top: 0;
          width: var(--sd-w);
          flex: 0 0 auto;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          gap: var(--sd-gap);
          padding: 14px 14px 14px 0;
          border-right: 1px solid var(--dim-gray);
          background: var(--white);
          transition: width 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: 3;
        }
        .sd-sidebar.is-collapsed {
          width: 72px;
          align-items: center;
          padding-left: 0;
        }

        .sd-head,
        .sd-side-balance,
        .sd-account,
        .sd-fixed { flex-shrink: 0; }

        .sd-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 48px;
          padding-left: 8px;
          width: 100%;
        }
        .is-collapsed .sd-head { justify-content: center; padding: 0; }
        .sd-head-actions { display: flex; gap: 2px; }
        .sd-logo { display: inline-flex; align-items: center; cursor: pointer; }

        .sd-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 0;
          background: transparent;
          color: var(--gray);
          border-radius: 8px;
          cursor: pointer;
        }
        .sd-icon-btn:hover { background: var(--c1-side); color: var(--black); }


        .sd-links {
          flex: 0 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .is-collapsed .sd-links { align-items: center; }

        .sd-row {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          height: var(--sd-row);
          padding: 0 12px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: var(--black);
          font: inherit;
          font-size: var(--sd-font);
          text-align: left;
          cursor: pointer;
          flex-shrink: 0;
        }
        .sd-row:hover { background: var(--c1-side); }
        .sd-row.is-active { background: var(--c1-side); font-weight: 700; }
        .sd-row.is-active .sd-row-icon { color: var(--c1); }
        .sd-row.is-accent { color: var(--c1); }
        .is-collapsed .sd-row { width: 46px; height: max(40px, var(--sd-row)); justify-content: center; padding: 0; }

        .sd-row-icon { position: relative; display: inline-flex; flex: 0 0 auto; }
        .sd-row-icon svg { width: var(--sd-icon); height: var(--sd-icon); }
        .sd-row-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sd-ext { opacity: 0.7; }

        .sd-badge {
          min-width: 22px;
          height: 20px;
          padding: 0 7px;
          border-radius: 10px;
          background: var(--c1);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }
        .sd-badge.is-red { background: var(--red-main); }
        .sd-dot {
          position: absolute;
          top: -2px;
          right: -3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--c1);
          box-shadow: 0 0 0 2px var(--white);
        }
        .sd-dot.is-red { background: var(--red-main); }
        .sd-meta { color: var(--gray); font-size: 0.8rem; white-space: nowrap; margin: 0; }

        .sd-more { width: 100%; }

        .sd-premium-slot {
          flex: 1 1 0;
          min-height: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          overflow: hidden;
        }
        .sd-banner-fit {
          width: auto;
          max-width: 100%;
          background: transparent;
        }
        .sd-banner-fit img { width: auto; max-width: 100%; height: auto; display: block; }
        .sd-trial-text { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
        .sd-premium-slot .sd-trial { padding: 7px 8px 7px 12px; flex-shrink: 0; }
        .sd-premium-slot .sd-trial-cta { padding: 4px 10px; }

        .sd-logo-toggle {
          position: relative;
          width: 44px;
          height: 44px;
          padding: 0;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: var(--black);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .sd-logo-mark,
        .sd-logo-expand {
          position: absolute;
          inset: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.12s;
        }
        .sd-logo-expand { opacity: 0; }
        .sd-logo-toggle:hover { background: var(--c1-side); }
        .sd-logo-toggle:hover .sd-logo-mark,
        .sd-logo-toggle:focus-visible .sd-logo-mark { opacity: 0; }
        .sd-logo-toggle:hover .sd-logo-expand,
        .sd-logo-toggle:focus-visible .sd-logo-expand { opacity: 1; }
        .sd-logo-toggle:focus-visible { outline: 2px solid var(--c1); outline-offset: 2px; }
        .sd-trial-text svg { color: var(--c1); flex: 0 0 auto; }
        .sd-premium-icon { color: var(--c1); }

        .sd-wallet {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 6px 10px 6px 6px;
          border: 1px solid var(--dim-gray);
          border-radius: 14px;
          background: var(--sd-hover);
          color: var(--black);
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .sd-wallet:hover { border-color: var(--gray); }
        .sd-wallet-dot {
          width: 28px;
          height: 28px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: var(--c1);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--c1) 18%, transparent);
        }
        .sd-wallet-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.15; }
        .sd-wallet-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em; color: var(--gray); }
        .sd-wallet-roll { height: 1.3em; overflow: hidden; }
        .sd-wallet-stack {
          display: flex;
          flex-direction: column;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sd-wallet:hover .sd-wallet-stack,
        .sd-wallet:focus-visible .sd-wallet-stack { transform: translateY(-50%); }
        .sd-wallet-value { height: 1.3em; font-weight: 800; font-size: 1rem; white-space: nowrap; }
        .sd-wallet-unit { font-weight: 500; font-size: 0.75rem; color: var(--gray); }
        .sd-wallet-chev { color: var(--gray); flex: 0 0 auto; transition: transform 0.2s ease; }
        .sd-wallet:hover .sd-wallet-chev { transform: translateX(2px); }
        .sd-wallet.sd-more-balance { display: none; }
        .sd-side-pop .sd-wallet { border-color: transparent; }
        @media (max-height: 900px) {
          .sd-wallet.sd-side-balance { display: none; }
          .sd-wallet.sd-more-balance { display: flex; }
        }

        .sd-events {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          height: 40px;
          padding: 0 8px 0 12px;
          border: 1px solid var(--dim-gray);
          border-radius: 12px;
          background: transparent;
          color: var(--black);
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .sd-events:hover { background: var(--sd-hover); }
        .sd-events.has-failed { border-color: color-mix(in srgb, var(--red-main) 55%, transparent); }
        .sd-events-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .sd-events-title svg { color: var(--gray); }
        .sd-events-count { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
        .sd-events-stat {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .sd-events-stat.is-ok {
          background: color-mix(in srgb, var(--green-main) 14%, transparent);
          color: var(--green-main);
        }
        .sd-events-stat.is-bad {
          background: color-mix(in srgb, var(--red-main) 16%, transparent);
          color: var(--red-main);
        }
        @media (max-height: 760px) {
          .sd-events { height: 36px; }
        }

        .sd-write { width: 100%; margin-top: 4px; }
        .is-collapsed .sd-write { width: auto; }
        .sd-write-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: calc(var(--sd-row) + 2px);
          border: 0;
          border-radius: 14px;
          background: var(--c1);
          color: #fff;
          font: inherit;
          font-size: var(--sd-font);
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 18px -8px color-mix(in srgb, var(--c1) 80%, transparent);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease;
        }
        .sd-write-btn svg { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .sd-write-btn:hover { filter: brightness(1.08); }
        .sd-write-btn:active { transform: scale(0.97); }
        .sd-write-btn.is-open svg { transform: rotate(45deg); }
        .is-collapsed .sd-write-btn { width: 46px; height: 46px; border-radius: 50%; }

        .sd-events-icon { flex-shrink: 0; }
        .sd-spin { color: var(--c1); animation: sd-spin 1.1s linear infinite; }
        @keyframes sd-spin { to { transform: rotate(360deg); } }
        .is-collapsed .sd-more { width: auto; }

        .sd-group { display: flex; flex-direction: column; gap: 2px; width: 100%; }
        .sd-group-title {
          margin: 0 0 4px;
          padding: 0 10px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--gray);
        }

        .sd-flyout {
          position: fixed;
          transform: translateY(-50%);
          padding: 6px 10px;
          border-radius: 8px;
          background: var(--black);
          color: var(--white);
          font-size: 0.82rem;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          z-index: 60;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          animation: sd-fly-in 0.12s ease-out;
        }
        .sd-flyout-badge {
          background: var(--c1);
          color: #fff;
          border-radius: 8px;
          padding: 0 6px;
          font-size: 0.72rem;
        }
        @keyframes sd-fly-in {
          from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }

        .sd-banner {
          display: block;
          width: 100%;
          padding: 0;
          border: 0;
          border-radius: 12px;
          overflow: hidden;
          background: var(--c1-side);
          cursor: pointer;
          flex-shrink: 0;
        }
        .sd-banner img { display: block; width: 100%; height: auto; }
        .sd-trial {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 12px;
          border: 1px solid var(--c1);
          border-radius: 12px;
          background: var(--c1-side);
          color: var(--black);
          font: inherit;
          font-size: 0.88rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }
        .sd-trial-cta {
          flex: 0 0 auto;
          padding: 5px 12px;
          border-radius: 8px;
          background: var(--c1);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .sd-log {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--dim-gray);
          border-radius: 12px;
          background: transparent;
          color: var(--gray);
          font: inherit;
          cursor: pointer;
        }
        .sd-log.has-failed { border-color: var(--red-main); }
        .sd-log:hover { background: var(--c1-side); }
        .sd-log-stat { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; }
        .sd-log-stat.is-red { color: var(--red-main); }

        .sd-updates {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          background: var(--c1-side);
        }
        .sd-updates-title { margin: 0; font-weight: 700; font-size: 0.9rem; }
        .sd-updates-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .sd-version { color: var(--c1); font-size: 0.8rem; font-weight: 700; }
        .sd-link {
          border: 0;
          background: none;
          padding: 0;
          color: var(--black);
          font: inherit;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
        }

        .sd-legal {
          margin: 0;
          padding: 0 6px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px 6px;
          font-size: 0.75rem;
          color: var(--gray);
        }
        .sd-legal a { color: var(--gray); text-decoration: none; }
        .sd-legal a:hover { color: var(--black); text-decoration: underline; }

        .sd-account { position: relative; width: 100%; }
        .is-collapsed .sd-account { width: auto; }
        .sd-account-card {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px;
          border: 1px solid var(--dim-gray);
          border-radius: 14px;
          background: var(--c1-side);
          color: var(--black);
          font: inherit;
          text-align: left;
          cursor: pointer;
        }
        .is-collapsed .sd-account-card { padding: 4px; border-radius: 50%; }
        .sd-account-card:hover { border-color: var(--gray); }
        .sd-avatar {
          position: relative;
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .sd-ring { position: absolute; inset: 0; transform: rotate(-90deg); }
        .sd-ring circle { fill: none; stroke-width: 2.5; }
        .sd-ring-track { stroke: var(--dim-gray); }
        .sd-ring-fill { stroke: var(--c1); stroke-linecap: round; stroke-dasharray: 113; stroke-dashoffset: 36; }
        .sd-avatar-inner,
        .sd-avatar-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #ee7700, #c43d00);
          color: #fff;
          font-weight: 800;
        }
        .sd-avatar-inner { width: 34px; height: 34px; }
        .sd-avatar-sm { width: 28px; height: 28px; font-size: 0.8rem; flex: 0 0 auto; }
        .sd-account-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .sd-account-name { font-weight: 700; font-size: var(--sd-font); }
        .sd-account-sub { color: var(--gray); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sd-account-chev { color: var(--gray); flex: 0 0 auto; }
        @media (max-height: 640px) {
          .sd-account-card { padding: 5px 8px; }
          .sd-avatar { width: 34px; height: 34px; }
          .sd-avatar-inner { width: 28px; height: 28px; font-size: 0.8rem; }
        }

        .sd-page { --sd-hover: rgba(255, 255, 255, 0.06); --sd-glass: rgba(22, 22, 24, 0.4); }
        [data-theme='gray'] .sd-page { --sd-glass: rgba(30, 30, 32, 0.7); }
        [data-theme='light'] .sd-page,
        [data-theme='white'] .sd-page { --sd-hover: rgba(0, 0, 0, 0.05); --sd-glass: rgba(248, 248, 248, 0.5); }
        [data-theme='creamy'] .sd-page { --sd-hover: rgba(100, 70, 30, 0.06); --sd-glass: rgba(250, 247, 243, 0.5); }

        .sd-pop {
          position: absolute;
          z-index: 40;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.1),
            0 4px 6px rgba(0, 0, 0, 0.25),
            0 12px 32px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          overflow: hidden;
          color: var(--black);
          animation: di-in 0.32s cubic-bezier(0.34, 1.4, 0.64, 1) backwards;
        }
        .sd-pop.is-closing { animation: di-out 0.18s cubic-bezier(0.4, 0, 0.6, 1) forwards; pointer-events: none; }
        [data-theme='gray'] .sd-pop { border-color: rgba(255, 255, 255, 0.12); }
        [data-theme='light'] .sd-pop,
        [data-theme='white'] .sd-pop {
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.08),
            0 4px 6px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        [data-theme='creamy'] .sd-pop {
          border-color: rgba(160, 110, 50, 0.18);
          box-shadow:
            0 0 0 1px rgba(160, 110, 50, 0.14),
            0 4px 6px rgba(100, 70, 30, 0.08),
            0 12px 32px rgba(100, 70, 30, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.85);
        }
        .sd-pop-glass {
          position: absolute;
          inset: 0;
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          background: var(--sd-glass);
          pointer-events: none;
        }
        .sd-pop-body { position: relative; z-index: 1; padding: 6px; }

        .sd-stagger,
        .sd-account-pop .sd-pop-body > * {
          animation: sd-item-in 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          animation-delay: calc(0.1s + var(--i, 0) * 0.035s);
        }
        .sd-account-pop .sd-pop-body > *:nth-child(1) { --i: 0; }
        .sd-account-pop .sd-pop-body > *:nth-child(2) { --i: 1; }
        .sd-account-pop .sd-pop-body > *:nth-child(3) { --i: 2; }
        .sd-account-pop .sd-pop-body > *:nth-child(4) { --i: 3; }
        .sd-account-pop .sd-pop-body > *:nth-child(5) { --i: 4; }
        .sd-account-pop .sd-pop-body > *:nth-child(6) { --i: 5; }
        .sd-account-pop .sd-pop-body > *:nth-child(7) { --i: 6; }
        .sd-account-pop .sd-pop-body > *:nth-child(8) { --i: 7; }
        .sd-account-pop .sd-pop-body > *:nth-child(9) { --i: 8; }
        .sd-account-pop .sd-pop-body > *:nth-child(10) { --i: 9; }
        .sd-account-pop .sd-pop-body > *:nth-child(11) { --i: 10; }
        @keyframes sd-item-in {
          from { opacity: 0; transform: translateY(6px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sd-pop.is-closing .sd-stagger,
        .sd-pop.is-closing .sd-pop-body > * { animation: none; }

        .sd-pop .sd-row:hover,
        .sd-pop .sd-row.is-active,
        .sd-pop .sd-menu-item:hover { background: var(--sd-hover); }
        .sd-pop .sd-updates { background: var(--sd-hover); border-color: transparent; }

        .sd-account-pop {
          bottom: calc(100% + 8px);
          left: 0;
          width: max(100%, 250px);
          transform-origin: bottom left;
        }
        .is-collapsed .sd-account-pop { left: calc(100% + 12px); bottom: 0; }

        .sd-side-pop {
          position: fixed;
          width: calc(var(--sd-w) + 10px);
          max-height: calc(100dvh - 24px);
          overflow-y: auto;
          scrollbar-width: none;
          z-index: 45;
        }
        .sd-side-pop::-webkit-scrollbar { display: none; }
        .sd-side-pop .sd-pop-body { display: flex; flex-direction: column; gap: 8px; padding: 8px; }
        .sd-side-pop .sd-group { gap: 2px; }
        .sd-side-pop .sd-group-title { margin: 4px 0 0; }
        .sd-create-pop .sd-pop-body { gap: 2px; }
        .sd-create-pop .sd-group-title { margin: 4px 0 6px; }
        .sd-create-row { height: auto; min-height: var(--sd-row); padding-top: 6px; padding-bottom: 6px; }
        .sd-create-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }
        .sd-create-desc { font-size: 0.78em; color: var(--gray); }
        .sd-more-head { display: flex; align-items: center; justify-content: space-between; padding: 2px 2px 0 0; }
        .sd-more-head .sd-group-title { margin: 0; }
        .sd-icon-btn-sm { width: 28px; height: 28px; }
        .sd-side-pop .sd-updates { padding: 10px 12px; }
        .sd-side-pop .sd-legal { padding: 0 8px 4px; }

        .sd-menu-title {
          margin: 4px 8px 6px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--gray);
        }
        .sd-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: var(--black);
          font: inherit;
          font-size: 0.9rem;
          text-align: left;
          cursor: pointer;
        }
        .sd-menu-item > span:not(.sd-avatar-sm) { flex: 1; }
        .sd-menu-item:hover { background: var(--c1-side); }
        .sd-menu-stack { display: flex; flex-direction: column; }
        .sd-menu-sub { color: var(--gray); font-size: 0.75rem; }
        .sd-check { color: var(--c1); }
        .sd-menu-sep { height: 1px; background: var(--dim-gray); margin: 6px 4px; }
        .sd-danger { color: var(--red-main); }

        .sd-row:focus-visible,
        .sd-wallet:focus-visible,
        .sd-write-btn:focus-visible,
        .sd-icon-btn:focus-visible,
        .sd-account-card:focus-visible,
        .sd-menu-item:focus-visible,
        .sd-banner:focus-visible,
        .sd-trial:focus-visible,
        .sd-log:focus-visible,
        .sd-events:focus-visible,
        .sd-link:focus-visible,
        .sd-choice:focus-visible,
        .sd-switch:focus-visible,
        .sd-seg button:focus-visible {
          outline: 2px solid var(--c1);
          outline-offset: 2px;
        }

        .sd-doc {
          flex: 1;
          min-width: 0;
          padding: 28px 0 96px 44px;
        }
        .sd-doc > * { max-width: 800px; }

        .sd-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 40px;
        }
        .sd-seg {
          display: inline-flex;
          padding: 3px;
          border-radius: 10px;
          background: var(--c1-side);
          border: 1px solid var(--dim-gray);
        }
        .sd-seg button {
          border: 0;
          background: transparent;
          color: var(--gray);
          font: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
        }
        .sd-seg button.is-on { background: var(--white); color: var(--black); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12); }

        .sd-eyebrow { margin: 0 0 10px; color: var(--c1); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em; }
        .sd-hero h1 {
          margin: 0 0 14px;
          font-size: clamp(2rem, 4.4vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.035em;
          font-weight: 800;
        }
        .sd-lede { font-size: 1.05rem; line-height: 1.6; color: var(--gray); margin: 0; }

        .sd-section { margin-top: 52px; }
        .sd-section h2 { margin: 0 0 12px; font-size: 1.35rem; letter-spacing: -0.02em; font-weight: 800; }
        .sd-section > p { margin: 0 0 16px; line-height: 1.65; }

        .sd-table { border: 1px solid var(--dim-gray); border-radius: 12px; overflow: hidden; }
        .sd-tr {
          display: grid;
          grid-template-columns: 1.3fr 0.8fr 1fr;
          gap: 16px;
          padding: 12px 16px;
          font-size: 0.9rem;
          line-height: 1.45;
        }
        .sd-table-4 .sd-tr { grid-template-columns: 1.3fr 0.6fr 0.6fr 1fr; }
        .sd-tr + .sd-tr { border-top: 1px solid var(--dim-gray); }
        .sd-th {
          background: var(--c1-side);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--gray);
        }
        .sd-td-key { font-weight: 700; }
        .sd-td-before { color: var(--gray); }

        .sd-settings {
          border: 1px solid var(--dim-gray);
          border-radius: 12px;
          padding: 18px;
          background: var(--c1-side);
        }
        .sd-settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--dim-gray);
        }
        .sd-settings-label { margin: 0; font-weight: 700; }
        .sd-settings-desc { margin: 2px 0 0; color: var(--gray); font-size: 0.85rem; }
        .sd-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
        .sd-choice {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 10px;
          border: 1.5px solid var(--dim-gray);
          border-radius: 12px;
          background: var(--white);
          color: var(--black);
          font: inherit;
          text-align: left;
          cursor: pointer;
        }
        .sd-choice.is-on { border-color: var(--c1); }
        .sd-choice-text { display: flex; flex-direction: column; }
        .sd-choice-label { font-weight: 700; font-size: 0.92rem; }
        .sd-choice-desc { color: var(--gray); font-size: 0.8rem; }
        .sd-radio {
          position: absolute;
          right: 12px;
          bottom: 16px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid var(--dim-gray);
        }
        .sd-choice.is-on .sd-radio { border: 5px solid var(--c1); }

        .sd-thumb {
          display: flex;
          height: 92px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--c1-side);
          border: 1px solid var(--dim-gray);
        }
        .sd-thumb-modern { flex-direction: column; }
        .sd-thumb-classic { justify-content: center; }
        .sd-thumb .t-bar {
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--dim-gray);
        }
        .sd-thumb .t-pill { width: 46%; height: 8px; border-radius: 6px; background: var(--dim-gray); }
        .sd-thumb .t-frame { width: 72%; display: flex; }
        .sd-thumb .t-side {
          width: 32%;
          border-right: 1px solid var(--dim-gray);
          padding: 8px 6px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .sd-thumb .t-line { height: 5px; border-radius: 3px; background: var(--dim-gray); }
        .sd-thumb .t-line:first-child { background: var(--c1); width: 70%; }
        .sd-thumb .t-line.short { width: 60%; }
        .sd-thumb .t-body { flex: 1; display: flex; justify-content: center; padding: 8px; }
        .sd-thumb .t-feed { width: 70%; border-radius: 5px; background: var(--dim-gray); opacity: 0.6; }

        .sd-switch {
          width: 40px;
          height: 22px;
          padding: 0;
          border: 0;
          border-radius: 12px;
          background: var(--dim-gray);
          position: relative;
          flex: 0 0 auto;
          cursor: pointer;
          transition: background 0.15s;
        }
        .sd-switch span {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.15s;
        }
        .sd-switch.is-on { background: var(--c1); }
        .sd-switch.is-on span { transform: translateX(18px); }

        .sd-list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 10px; line-height: 1.6; }
        .sd-list li::marker { color: var(--c1); }
        .sd-questions { padding: 20px 22px; border-radius: 12px; border: 1px dashed var(--c1); }

        .sd-modal-scrim {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .sd-modal {
          width: min(100%, 480px);
          max-height: 80vh;
          overflow-y: auto;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--dim-gray);
          background: var(--white);
          color: var(--black);
          font-size: 0.9rem;
        }
        .sd-modal-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .sd-modal-head > div { flex: 1; }
        .sd-modal-sub { margin-top: 20px; justify-content: space-between; }

        @media (max-width: 900px) {
          .sd-frame { flex-direction: column; }
          .sd-sidebar {
            position: relative;
            width: 100%;
            height: auto;
            padding: 14px 16px;
            border-right: 0;
            border-bottom: 1px solid var(--dim-gray);
          }
          .sd-sidebar.is-collapsed { width: 100%; }
          .sd-doc { padding: 24px 16px 80px; }
          .sd-tr,
          .sd-table-4 .sd-tr { grid-template-columns: 1fr; gap: 4px; }
          .sd-th { display: none; }
          .sd-choices { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .sd-sidebar,
          .sd-switch,
          .sd-switch span { transition: none; }
          .sd-flyout,
          .sd-pop,
          .sd-pop.is-closing,
          .sd-stagger,
          .sd-account-pop .sd-pop-body > *,
          .sd-spin { animation: none; }
          .sd-wallet-stack,
          .sd-write-btn,
          .sd-write-btn svg { transition: none; }
        }
      `}</style>
    </>
  );
}
