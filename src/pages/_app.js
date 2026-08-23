import "@/styles/root.css";
import "@/styles/animations.css";
import "@/styles/notificationsIcons.css";
import "@/styles/placeholder.css";
import "@/styles/essentials.css";
import "@/styles/custom.css";
import "@/styles/mobile.css";
import "@/styles/chatAI.css";
import "katex/dist/katex.css";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "@/styles/PlayPauseButton.css";
import "@/styles/uplift.css";
import "@/styles/articlePreview.css";
import "@/styles/tiptap.css";
import "@/styles/legalDoc.css";
import "@/styles/pointsSystem.css";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "@/lib/i18n";
import ReduxProvider from "@/Store/ReduxProvider";
import { ThemeProvider } from "next-themes";
import AppInit from "@/Components/AppInit";
import { useRouter } from "next/router";
import Spinner from "@/Components/Spinner";
import ToastMessages from "@/Components/ToastMessages";
import dynamic from "next/dynamic";
import KeepAlive from "@/Components/KeepAlive";
import IinitiateNotifications from "@/Components/IinitiateNotifications";
import NewDesignAnnouncement from "@/Components/NewDesignAnnouncement";
import NavbarTour from "@/Components/NavbarTour";
import ProfileRelayCheck from "@/Components/ProfileRelayCheck";
import { nip19 } from "nostr-tools";

const TopNavbarClient = dynamic(() => import("@/Components/TopNavbar"), {
  ssr: false,
});
const NavbarClient = dynamic(() => import("@/Components/Navbar"), {
  ssr: false,
});
const FloatingDMsClient = dynamic(() => import("@/Components/FloatingDMs"), {
  ssr: false,
});
const WarningBarClient = dynamic(() => import("@/Components/WarningBar"), {
  ssr: false,
});
const TrialBannerClient = dynamic(() => import("@/Components/TrialBanner"), {
  ssr: false,
});
const PublishingClient = dynamic(() => import("@/Components/Publishing"), {
  ssr: false,
});
const InitiateCashu = dynamic(() => import("@/Components/InitiateCashu"), {
  ssr: false,
});
const UpgradeSheetHost = dynamic(() => import("@/Components/UpgradeSheetHost"), {
  ssr: false,
});
const PublishResultHostClient = dynamic(
  () => import("@/Components/PublishResultHost"),
  { ssr: false },
);
const OnboardingHost = dynamic(
  () => import("@/Components/Onboarding/OnboardingHost"),
  { ssr: false },
);

const tourSteps = [
  { selector: ".uplift-search-pill", title: "Search", description: "Find notes, profiles, and topics instantly." },
  { selector: ".uplift-nav-icon-btn[aria-label='Home']", title: "Home", description: "Your main feed — notes and updates from people you follow." },
  { selector: ".uplift-nav-icon-btn[aria-label='Articles']", title: "Articles", description: "Browse and read long-form content from creators." },
  { selector: ".uplift-plus-btn", title: "Create", description: "Post a note, write an article, share media, or build a widget.", requiresClick: true },
  { selector: ".uplift-nav-icon-btn[aria-label='Messages']", title: "Messages", description: "Chat directly with anyone on Nostr." },
  { selector: ".uplift-nav-icon-btn[aria-label='More']", title: "More", description: "Access Media, Relay Orbits, Explore, Smart Widgets, and your Dashboard.", requiresClick: true },
  { selector: ".uplift-balance-chip", title: "Wallet", description: "Hover to see the fiat equivalent of your Lightning balance in real time.", requiresHover: true },
  { selector: ".uplift-icon-btn[aria-label='Notifications']", title: "Notifications", description: "Stay up to date with replies, zaps, and mentions." },
  { selector: ".uplift-navbar .uplift-avatar-btn", title: "Profile", description: "Your identity, settings, and connected accounts.", requiresClick: true },
];

const NO_SIDEBAR_PAGES = new Set([
  "/yakihonne-mobile-app",
  "/yakihonne-paid-notes",
  "/yakihonne-smart-widgets",
  "/privacy",
  "/terms",
  "/terms-app",
  "/child-safety",
  "/refund-policy",
  "/login",
  "/points-system",
  "/m/maci-poll",
  "/docs/sw/[keyword]",
]);

const SETTLE_DELAY_MS = 1200;

function ProfileRelayCheckGate() {
  const router = useRouter();
  const isOnRelaysTab =
    router.pathname === "/settings" && router.query?.tab === "relays";
  const isOnProfilePage = router.pathname === "/settings/profile";
  const suppressOnThisPage = isOnRelaysTab || isOnProfilePage;

  const userKeys = useSelector((state) => state.userKeys);
  const userMetadata = useSelector((state) => state.userMetadata);
  const userAllRelays = useSelector((state) => state.userAllRelays);
  const isUserDataLoaded = useSelector((state) => state.isUserDataLoaded);
  const [dismissed, setDismissed] = useState(true);
  const [settled, setSettled] = useState(false);

  const isLoggedIn = !!(userKeys && (userKeys.sec || userKeys.ext || userKeys.bunker));
  const dismissKey = userKeys?.pub
    ? `yakihonne_profile_relay_check_dismissed_${userKeys.pub}`
    : null;

  useEffect(() => {
    setDismissed(dismissKey ? !!localStorage.getItem(dismissKey) : true);
  }, [dismissKey]);

  const pubkeyStubs = userKeys?.pub
    ? [userKeys.pub.substring(0, 10), nip19.npubEncode(userKeys.pub).substring(0, 10)]
    : [];
  const isStubName = (value) => !value || pubkeyStubs.includes(value);
  const missingProfile =
    isLoggedIn &&
    settled &&
    userMetadata &&
    isStubName(userMetadata.name) &&
    isStubName(userMetadata.display_name) &&
    !userMetadata.picture;
  const missingRelays = isLoggedIn && settled && (!userAllRelays || userAllRelays.length === 0);

  useEffect(() => {
    if (!isLoggedIn || !isUserDataLoaded) {
      setSettled(false);
      return;
    }
    const timeout = setTimeout(() => setSettled(true), SETTLE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [isLoggedIn, isUserDataLoaded]);

  const shouldShow =
    !suppressOnThisPage && settled && !dismissed && (missingProfile || missingRelays);

  const handleDismiss = (dontShowAgain) => {
    if (dontShowAgain && dismissKey) {
      localStorage.setItem(dismissKey, "true");
    }
    setDismissed(true);
  };

  if (!shouldShow) return null;

  return (
    <ProfileRelayCheck
      missingProfile={missingProfile}
      missingRelays={missingRelays}
      onDismiss={handleDismiss}
    />
  );
}

function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const shouldHideSidebar = NO_SIDEBAR_PAGES.has(router.pathname);

  const isDesktop = () => typeof window !== "undefined" && window.innerWidth > 800;

  useEffect(() => {
    try {
      const idx = parseInt(localStorage.getItem("yaki-font-size"), 10);
      const sizes = ["14px", "16px", "18px", "20px"];
      if (!isNaN(idx) && sizes[idx]) {
        document.documentElement.style.fontSize = sizes[idx];
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("yakihonne_design_v2_seen")) {
      setShowAnnouncement(true);
    } else if (!localStorage.getItem("yakihonne_tour_v2_seen") && isDesktop()) {
      setShowTour(true);
    }
  }, []);

  const handleAnnouncementDismiss = () => {
    localStorage.setItem("yakihonne_design_v2_seen", "true");
    setShowAnnouncement(false);
    if (!localStorage.getItem("yakihonne_tour_v2_seen") && isDesktop()) setShowTour(true);
  };

  const handleTourComplete = () => {
    localStorage.setItem("yakihonne_tour_v2_seen", "true");
    setShowTour(false);
  };

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleDone = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleDone);
    router.events.on("routeChangeError", handleDone);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleDone);
      router.events.off("routeChangeError", handleDone);
    };
  }, [router]);

  return (
    <ReduxProvider>
      <ThemeProvider>
        <ToastMessages />
        {!shouldHideSidebar && <FloatingDMsClient />}
        <PublishingClient displayOff={true} />
        <AppInit />
        <IinitiateNotifications />
        <InitiateCashu />
        <UpgradeSheetHost />
        <PublishResultHostClient />
        <OnboardingHost />
        <NavbarClient />
        {!shouldHideSidebar && <TopNavbarClient />}
        <WarningBarClient />
        {!shouldHideSidebar && <TrialBannerClient />}
        <div
          className={`page-container fit-container fx-centered fx-start-v${!shouldHideSidebar ? " uplift-page-offset" : ""}`}
          style={{ minHeight: "100dvh" }}
        >
          <div className={`main-container${router.pathname === "/write-article" ? " main-container--wide" : ""}`}>
            <main className="fit-container fx-centered fx-end-h fx-start-v">
              <div
                className="fit-container"
                style={{ position: "relative" }}
              >
                <KeepAlive routeKey={router.asPath}>
                  <Component {...pageProps} />
                </KeepAlive>
              </div>
            </main>
          </div>
        </div>
        {showAnnouncement && (
          <NewDesignAnnouncement onDismiss={handleAnnouncementDismiss} />
        )}
        {showTour && (
          <NavbarTour steps={tourSteps} onComplete={handleTourComplete} />
        )}
        {!showAnnouncement && !showTour && <ProfileRelayCheckGate />}
        {loading && (
          <div
            className="fit-container sc-s-18"
            style={{
              width: "100%",
              position: "fixed",
              left: 0,
              top: 0,
              overflow: "hidden",
              zIndex: 999999999999,
              height: "20px",
              border: "none",
              backgroundColor: "transparent",
            }}
          >
            <div
              style={{
                height: "4px",
                backgroundColor: "var(--c1)",
                borderRadius: "10px",
              }}
              className="v-bounce"
            ></div>
          </div>
        )}
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default App;
