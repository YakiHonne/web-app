import "@/styles/root.css";
import "@/styles/animations.css";
import "@/styles/icons.css";
import "@/styles/notificationsIcons.css";
import "@/styles/placeholder.css";
import "@/styles/essentials.css";
import "@/styles/custom.css";
import "@/styles/mobile.css";
import "@/styles/chatAI.css";
import { useState, useEffect } from "react";
// Import client-side i18n instead of next-i18next
import "@/lib/i18n";
import ReduxProvider from "@/Store/ReduxProvider";
import Sidebar from "@/Components/SideBar/Sidebar";
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

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
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
      <div className="page-container fit-container fx-centered fx-start-v" style={{ overflow: "scroll", height: "100dvh" }}>
        <div className="main-container">
          {/* <Sidebar /> */}
          <main className="fit-container fx-centered fx-end-h fx-start-v">
            <div className="fx-scattered fx-start-v box-pad-h-s fit-container" style={{ gap: 0 }}>
              <SideBarClient />
              <div className="main-page-nostr-container">
                {loading ? (
                  <div
                    className="fit-container fx-centered"
                    style={{ height: "100vh" }}
                  >
                    <LoadingLogo size={58} />{" "}
                  </div>
                ) : (
                  <Component {...pageProps} />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ReduxProvider>
  );
}

export default App;
