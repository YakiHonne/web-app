import "@/styles/root.css";
import "@/styles/animations.css";
import "@/styles/icons.css";
import "@/styles/notificationsIcons.css";
import "@/styles/placeholder.css";
import "@/styles/essentials.css";
import "@/styles/custom.css";
import "@/styles/mobile.css";
import "@/styles/chatAI.css";
import "@/styles/spark-wallet.css";
import "katex/dist/katex.css";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "@/styles/PlayPauseButton.css";

import { useState, useEffect } from "react";
import "@/lib/i18n";
import ReduxProvider from "@/Store/ReduxProvider";
import { ThemeProvider } from "next-themes";
import AppInit from "@/Components/AppInit";
import { useRouter } from "next/router";
import LoadingLogo from "@/Components/LoadingLogo";
import ToastMessages from "@/Components/ToastMessages";
import dynamic from "next/dynamic";
import KeepAlive from "@/Components/KeepAlive";
import FloatingDMs from "@/Components/FloatingDMs";

const SideBarClient = dynamic(() => import("@/Components/SideBar/Sidebar"), {
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

const NO_SIDEBAR_PAGES = new Set([
  "/yakihonne-mobile-app",
  "/yakihonne-paid-notes",
  "/yakihonne-smart-widgets",
  "/privacy",
  "/terms",
  "/login",
  "/points-system",
  "/write-article",
  "/m/maci-poll",
  "/docs/sw/[keyword]",
]);

function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const shouldHideSidebar = NO_SIDEBAR_PAGES.has(router.pathname);

  // fake loader (overlay only)
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
        <AppInit />
        <NavbarClient />
        <WarningBarClient />
        <div
          className="page-container fit-container fx-centered fx-start-v"
          style={{ height: "100dvh" }}
        >
          <div className="main-container">
            <main className="fit-container fx-centered fx-end-h fx-start-v">
              <div
                className="fx-scattered fx-start-v box-pad-h-s fit-container"
                style={{ gap: 0 }}
              >
                {!shouldHideSidebar && <SideBarClient />}

                <div
                  className="main-page-nostr-container"
                  style={{ flex: 1, position: "relative" }}
                >
                  <KeepAlive routeKey={router.asPath}>
                    <Component {...pageProps} />
                  </KeepAlive>
                </div>
              </div>
            </main>
          </div>
        </div>
        {loading && (
          <div
            className="fit-container content-source-and-filter fx-centered"
            style={{ zIndex: 10000 }}
          >
            <div className="main-container">
              <main
                style={{ height: "auto" }}
                className="fx-centered fx-end-h box-pad-h-s"
              >
                <div
                  className={`${
                    shouldHideSidebar
                      ? "fit-container"
                      : "main-page-nostr-container"
                  } fx-centered box-pad-v-m`}
                  style={{
                    borderBottom: "1px solid var(--very-dim-gray)",
                    backgroundColor: "var(--white)",
                    height: "100vh",
                  }}
                >
                  <div
                    style={{ gap: 0 }}
                    className={`fx-centered  fx-wrap fit-container`}
                  >
                    <div className="fx-centered">
                      <LoadingLogo size={58} />
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        )}
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default App;
