import "@/styles/root.css";
import "@/styles/animations.css";
import "@/styles/icons.css";
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

import { useState, useEffect } from "react";
import "@/lib/i18n";
import ReduxProvider from "@/Store/ReduxProvider";
import AppInit from "@/Components/AppInit";
import { useRouter } from "next/router";
import LoadingLogo from "@/Components/LoadingLogo";
import ToastMessages from "@/Components/ToastMessages";
import dynamic from "next/dynamic";

const SideBarClient = dynamic(() => import("@/Components/SideBar/Sidebar"), {
  ssr: false,
});

function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Define pages that should not show the sidebar
  const noSidebarPages = [
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
  ];

  // Check if current route should hide sidebar
  const shouldHideSidebar = noSidebarPages.includes(router.pathname);
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", shouldHideSidebar ? () => {} :handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);
  
  return (
    <ReduxProvider>
      <ToastMessages />
      <AppInit />
      {shouldHideSidebar ? (
        <div >
          {loading ? (
            <div
              className="fit-container fx-centered"
              style={{ height: "100vh" }}
            >
              <LoadingLogo size={58} />
            </div>
          ) : (
            <Component {...pageProps} />
          )}
        </div>
      ) : (
        <div
          className="page-container fit-container fx-centered fx-start-v"
          style={{ overflow: "scroll", height: "100dvh" }}
        >
          <div className="main-container">
            <main className="fit-container fx-centered fx-end-h fx-start-v">
              <div
                className="fx-scattered fx-start-v box-pad-h-s fit-container"
                style={{ gap: 0 }}
              >
                <SideBarClient />
                <div className="main-page-nostr-container">
                  {loading ? (
                    <div
                      className="fit-container fx-centered"
                      style={{ height: "100vh" }}
                    >
                      <LoadingLogo size={58} />
                    </div>
                  ) : (
                    <Component {...pageProps} />
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </ReduxProvider>
  );
}

export default App;
