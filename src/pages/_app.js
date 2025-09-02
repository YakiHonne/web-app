// import "@/styles/root.css";
// import "@/styles/animations.css";
// import "@/styles/icons.css";
// import "@/styles/notificationsIcons.css";
// import "@/styles/placeholder.css";
// import "@/styles/essentials.css";
// import "@/styles/custom.css";
// import "@/styles/mobile.css";
// import "@/styles/chatAI.css";
// import "katex/dist/katex.css";
// import "highlight.js/styles/github.css";
// import "highlight.js/styles/github-dark.css";
// import "@uiw/react-md-editor/markdown-editor.css";
// import "@uiw/react-markdown-preview/markdown.css";
// import "@/styles/PlayPauseButton.css";

// import { useState, useEffect } from "react";
// import "@/lib/i18n";
// import ReduxProvider from "@/Store/ReduxProvider";
// import AppInit from "@/Components/AppInit";
// import { useRouter } from "next/router";
// import LoadingLogo from "@/Components/LoadingLogo";
// import ToastMessages from "@/Components/ToastMessages";
// import dynamic from "next/dynamic";

// const SideBarClient = dynamic(() => import("@/Components/SideBar/Sidebar"), {
//   ssr: false,
// });

// function App({ Component, pageProps }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   // Define pages that should not show the sidebar
//   const noSidebarPages = [
//     "/yakihonne-mobile-app",
//     "/yakihonne-paid-notes",
//     "/yakihonne-smart-widgets",
//     "/privacy",
//     "/terms",
//     "/login",
//     "/points-system",
//     "/write-article",
//     "/m/maci-poll",
//     "/docs/sw/[keyword]",
//   ];

//   // Check if current route should hide sidebar
//   const shouldHideSidebar = noSidebarPages.includes(router.pathname);
//   useEffect(() => {
//     const handleStart = () => setLoading(true);
//     const handleComplete = () => setLoading(false);

//     router.events.on("routeChangeStart", shouldHideSidebar ? () => {} :handleStart);
//     router.events.on("routeChangeComplete", handleComplete);
//     router.events.on("routeChangeError", handleComplete);

//     return () => {
//       router.events.off("routeChangeStart", handleStart);
//       router.events.off("routeChangeComplete", handleComplete);
//       router.events.off("routeChangeError", handleComplete);
//     };
//   }, [router]);

//   return (
//     <ReduxProvider>
//       <ToastMessages />
//       <AppInit />
//       {shouldHideSidebar ? (
//         <div >
//           {loading ? (
//             <div
//               className="fit-container fx-centered"
//               style={{ height: "100vh" }}
//             >
//               <LoadingLogo size={58} />
//             </div>
//           ) : (
//             <Component {...pageProps} />
//           )}
//         </div>
//       ) : (
//         <div
//           className="page-container fit-container fx-centered fx-start-v"
//           style={{ overflow: "scroll", height: "100dvh" }}
//         >
//           <div className="main-container">
//             <main className="fit-container fx-centered fx-end-h fx-start-v">
//               <div
//                 className="fx-scattered fx-start-v box-pad-h-s fit-container"
//                 style={{ gap: 0 }}
//               >
//                 <SideBarClient />
//                 <div className="main-page-nostr-container">
//                   {loading ? (
//                     <div
//                       className="fit-container fx-centered"
//                       style={{ height: "100vh" }}
//                     >
//                       <LoadingLogo size={58} />
//                     </div>
//                   ) : (
//                     <Component {...pageProps} />
//                   )}
//                 </div>
//               </div>
//             </main>
//           </div>
//         </div>
//       )}
//     </ReduxProvider>
//   );
// }

// export default App;

// import "@/styles/root.css";
// import "@/styles/animations.css";
// import "@/styles/icons.css";
// import "@/styles/notificationsIcons.css";
// import "@/styles/placeholder.css";
// import "@/styles/essentials.css";
// import "@/styles/custom.css";
// import "@/styles/mobile.css";
// import "@/styles/chatAI.css";
// import "katex/dist/katex.css";
// import "highlight.js/styles/github.css";
// import "highlight.js/styles/github-dark.css";
// import "@uiw/react-md-editor/markdown-editor.css";
// import "@uiw/react-markdown-preview/markdown.css";
// import "@/styles/PlayPauseButton.css";

// import { useState, useEffect } from "react";
// import "@/lib/i18n";
// import ReduxProvider from "@/Store/ReduxProvider";
// import AppInit from "@/Components/AppInit";
// import { useRouter } from "next/router";
// import LoadingLogo from "@/Components/LoadingLogo";
// import ToastMessages from "@/Components/ToastMessages";
// import dynamic from "next/dynamic";
// import KeepAlive from "@/components/KeepAlive";

// const SideBarClient = dynamic(() => import("@/Components/SideBar/Sidebar"), {
//   ssr: false,
// });

// // pages where the sidebar should be hidden
// const NO_SIDEBAR_PAGES = new Set([
//   "/yakihonne-mobile-app",
//   "/yakihonne-paid-notes",
//   "/yakihonne-smart-widgets",
//   "/privacy",
//   "/terms",
//   "/login",
//   "/points-system",
//   "/write-article",
//   "/m/maci-poll",
//   "/docs/sw/[keyword]",
// ]);

// function App({ Component, pageProps }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const shouldHideSidebar = NO_SIDEBAR_PAGES.has(router.pathname);

//   // ⚠️ Don’t replace the page with a loader; just show an overlay
//   useEffect(() => {
//     const handleStart = () => setLoading(true);
//     const handleDone = () => setLoading(false);

//     router.events.on("routeChangeStart", handleStart);
//     router.events.on("routeChangeComplete", handleDone);
//     router.events.on("routeChangeError", handleDone);

//     return () => {
//       router.events.off("routeChangeStart", handleStart);
//       router.events.off("routeChangeComplete", handleDone);
//       router.events.off("routeChangeError", handleDone);
//     };
//   }, [router]);

//   return (
//     <ReduxProvider>
//       <ToastMessages />
//       <AppInit />

//       {/* Single, stable outer layout (no branching that would unmount pages) */}
//       <div
//         className="page-container fit-container fx-centered fx-start-v"
//         style={{ overflow: "scroll", height: "100dvh" }}
//       >
//         <div className="main-container">
//           <main className="fit-container fx-centered fx-end-h fx-start-v">
//             <div
//               className="fx-scattered fx-start-v box-pad-h-s fit-container"
//               style={{ gap: 0 }}
//             >
//               {/* Sidebar area: just hide it when not needed */}
//               <div style={{ display: shouldHideSidebar ? "none" : "block" }}>
//                 <SideBarClient />
//               </div>

//               <div className="main-page-nostr-container" style={{ width: "100%" }}>
//                 {/* ✅ Keep pages mounted across route changes */}
//                 <KeepAlive routeKey={router.asPath}>
//                   {/* Important: DO NOT give this a changing key */}
//                   <Component {...pageProps} />
//                 </KeepAlive>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* 🔄 Navigation overlay (does NOT unmount content) */}
//       {loading && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background:
//               "rgba(0,0,0,0.0)", // transparent or dim if you prefer
//             pointerEvents: "none", // allow clicks to pass through if you want
//             zIndex: 9999,
//           }}
//         >
//           <LoadingLogo size={58} />
//         </div>
//       )}
//     </ReduxProvider>
//   );
// }

// export default App;

// import "@/styles/root.css";
// import "@/styles/animations.css";
// import "@/styles/icons.css";
// import "@/styles/notificationsIcons.css";
// import "@/styles/placeholder.css";
// import "@/styles/essentials.css";
// import "@/styles/custom.css";
// import "@/styles/mobile.css";
// import "@/styles/chatAI.css";
// import "katex/dist/katex.css";
// import "highlight.js/styles/github.css";
// import "highlight.js/styles/github-dark.css";
// import "@uiw/react-md-editor/markdown-editor.css";
// import "@uiw/react-markdown-preview/markdown.css";
// import "@/styles/PlayPauseButton.css";

// import { useState, useEffect, useRef } from "react";
// import "@/lib/i18n";
// import ReduxProvider from "@/Store/ReduxProvider";
// import AppInit from "@/Components/AppInit";
// import { useRouter } from "next/router";
// import LoadingLogo from "@/Components/LoadingLogo";
// import ToastMessages from "@/Components/ToastMessages";
// import dynamic from "next/dynamic";
// import KeepAlive from "@/Components/KeepAlive";

// const SideBarClient = dynamic(() => import("@/Components/SideBar/Sidebar"), {
//   ssr: false,
// });

// const NO_SIDEBAR_PAGES = new Set([
//   "/yakihonne-mobile-app",
//   "/yakihonne-paid-notes",
//   "/yakihonne-smart-widgets",
//   "/privacy",
//   "/terms",
//   "/login",
//   "/points-system",
//   "/write-article",
//   "/m/maci-poll",
//   "/docs/sw/[keyword]",
// ]);

// function App({ Component, pageProps }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const scrollPositions = useRef({}); // 🟢 per-path scroll memory
//   const scrollContainerRef = useRef(null);

//   const shouldHideSidebar = NO_SIDEBAR_PAGES.has(router.pathname);

//   // show overlay loader instead of unmounting
//   useEffect(() => {
//     const handleStart = () => {
//       // save current scroll before leaving
//       if (scrollContainerRef.current) {
//         scrollPositions.current[router.asPath] =
//           scrollContainerRef.current.scrollTop;
//       }
//       setLoading(true);
//     };

//     const handleDone = () => {
//       setLoading(false);

//       // restore scroll when arriving
//       requestAnimationFrame(() => {
//         const el = scrollContainerRef.current;
//         if (el) {
//           const saved = scrollPositions.current[router.asPath] || 0;
//           el.scrollTop = saved;
//         }
//       });
//     };

//     router.events.on("routeChangeStart", handleStart);
//     router.events.on("routeChangeComplete", handleDone);
//     router.events.on("routeChangeError", handleDone);

//     return () => {
//       router.events.off("routeChangeStart", handleStart);
//       router.events.off("routeChangeComplete", handleDone);
//       router.events.off("routeChangeError", handleDone);
//     };
//   }, [router]);

//   return (
//     <ReduxProvider>
//       <ToastMessages />
//       <AppInit />

//       <div className="main-container" style={{ display: "flex", height: "100dvh" }}>
//         {/* Sidebar stays fixed on the left */}
//         {!shouldHideSidebar && (
//           <div style={{ flexShrink: 0 }}>
//             <SideBarClient />
//           </div>
//         )}

//         {/* Scrollable content on the right */}
//         <div
//           className="main-page-nostr-container"
//           ref={scrollContainerRef}
//           style={{
//             flex: 1,
//             overflowY: "auto",
//             height: "100dvh",
//             position: "relative",
//           }}
//         >
//           <KeepAlive routeKey={router.asPath}>
//             <Component {...pageProps} />
//           </KeepAlive>
//         </div>
//       </div>

//       {/* Overlay loader */}
//       {loading && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "rgba(0,0,0,0.0)",
//             pointerEvents: "none",
//             zIndex: 9999,
//           }}
//         >
//           <LoadingLogo size={58} />
//         </div>
//       )}
//     </ReduxProvider>
//   );
// }

// export default App;

// import "@/styles/root.css";
// import "@/styles/animations.css";
// import "@/styles/icons.css";
// import "@/styles/notificationsIcons.css";
// import "@/styles/placeholder.css";
// import "@/styles/essentials.css";
// import "@/styles/custom.css";
// import "@/styles/mobile.css";
// import "@/styles/chatAI.css";
// import "katex/dist/katex.css";
// import "highlight.js/styles/github.css";
// import "highlight.js/styles/github-dark.css";
// import "@uiw/react-md-editor/markdown-editor.css";
// import "@uiw/react-markdown-preview/markdown.css";
// import "@/styles/PlayPauseButton.css";

// import { useState, useEffect, useRef } from "react";
// import "@/lib/i18n";
// import ReduxProvider from "@/Store/ReduxProvider";
// import AppInit from "@/Components/AppInit";
// import { useRouter } from "next/router";
// import LoadingLogo from "@/Components/LoadingLogo";
// import ToastMessages from "@/Components/ToastMessages";
// import dynamic from "next/dynamic";
// import KeepAlive from "@/Components/KeepAlive";

// const SideBarClient = dynamic(() => import("@/Components/SideBar/Sidebar"), {
//   ssr: false,
// });

// const NO_SIDEBAR_PAGES = new Set([
//   "/yakihonne-mobile-app",
//   "/yakihonne-paid-notes",
//   "/yakihonne-smart-widgets",
//   "/privacy",
//   "/terms",
//   "/login",
//   "/points-system",
//   "/write-article",
//   "/m/maci-poll",
//   "/docs/sw/[keyword]",
// ]);

// function App({ Component, pageProps }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const scrollPositions = useRef({}); // 🟢 per-path scroll memory
//   const scrollContainerRef = useRef(null);

//   const shouldHideSidebar = NO_SIDEBAR_PAGES.has(router.pathname);

//   // show overlay loader instead of unmounting
//   useEffect(() => {
//     const handleStart = () => {
//       // save current scroll before leaving
//       if (scrollContainerRef.current) {
//         scrollPositions.current[router.asPath] =
//           scrollContainerRef.current.scrollTop;
//       }
//       setLoading(true);
//     };

//     const handleDone = () => {
//       setLoading(false);

//       // restore scroll when arriving
//       requestAnimationFrame(() => {
//         const el = scrollContainerRef.current;
//         if (el) {
//           const saved = scrollPositions.current[router.asPath] || 0;
//           el.scrollTop = saved;
//         }
//       });
//     };

//     router.events.on("routeChangeStart", handleStart);
//     router.events.on("routeChangeComplete", handleDone);
//     router.events.on("routeChangeError", handleDone);

//     return () => {
//       router.events.off("routeChangeStart", handleStart);
//       router.events.off("routeChangeComplete", handleDone);
//       router.events.off("routeChangeError", handleDone);
//     };
//   }, [router]);

//   return (
//     <ReduxProvider>
//       <ToastMessages />
//       <AppInit />

//       <div
//         className="page-container fit-container fx-centered fx-start-v"
//         style={{ overflow: "scroll", height: "100dvh" }}
//       >
//         <div className="main-container">
//           <main className="fit-container fx-centered fx-end-h fx-start-v">
//             <div
//               className="fx-scattered fx-start-v box-pad-h-s fit-container"
//               style={{ gap: 0 }}
//             >
//               {!shouldHideSidebar && (
//                 // <div style={{ flexShrink: 0 }}>
//                   <SideBarClient />
//                 // </div>
//               )}
//               <div
//                 className="main-page-nostr-container"
//                 ref={scrollContainerRef}
//               >
//                 <KeepAlive routeKey={router.asPath}>
//                   <Component {...pageProps} />
//                 </KeepAlive>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* Overlay loader */}
//       {loading && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "rgba(0,0,0,0.0)",
//             pointerEvents: "none",
//             zIndex: 9999,
//           }}
//         >
//           <LoadingLogo size={58} />
//         </div>
//       )}
//     </ReduxProvider>
//   );
// }

// export default App;

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
import KeepAlive from "@/Components/KeepAlive";
import Navbar from "@/Components/Navbar";

const SideBarClient = dynamic(() => import("@/Components/SideBar/Sidebar"), {
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
      <ToastMessages />
      <AppInit />
      <Navbar />
      <div
        className="page-container fit-container fx-centered fx-start-v"
        style={{ height: "100dvh" }} // parent container no scroll
      >
        <div className="main-container">
          <main className="fit-container fx-centered fx-end-h fx-start-v">
            <div
              className="fx-scattered fx-start-v box-pad-h-s fit-container"
              style={{ gap: 0 }}
            >
              {!shouldHideSidebar && <SideBarClient />}
              {/* {loading && (
                <div
                  style={{
                    zIndex: 99999999,
                  }}
                  className="fixed-container fx-centered"
                >
                  <LoadingLogo size={58} />
                </div>
              )} */}
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

      {/* Overlay loader */}
      {/* {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.0)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <LoadingLogo size={58} />
        </div>
      )} */}
    </ReduxProvider>
  );
}
// function App({ Component, pageProps }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const shouldHideSidebar = NO_SIDEBAR_PAGES.has(router.pathname);

//   // Pure overlay loader
//   useEffect(() => {
//     const handleStart = () => setLoading(true);
//     const handleDone = () => setLoading(false);

//     router.events.on("routeChangeStart", handleStart);
//     router.events.on("routeChangeComplete", handleDone);
//     router.events.on("routeChangeError", handleDone);

//     return () => {
//       router.events.off("routeChangeStart", handleStart);
//       router.events.off("routeChangeComplete", handleDone);
//       router.events.off("routeChangeError", handleDone);
//     };
//   }, [router]);

//   return (
//     <ReduxProvider>
//       <ToastMessages />
//       <AppInit />

//       <div
//         className="page-container fit-container fx-centered fx-start-v"
//         style={{ height: "100dvh" }}
//       >
//         <div className="main-container">
//           <main className="fit-container fx-centered fx-end-h fx-start-v">
//             <div
//               className="fx-scattered fx-start-v box-pad-h-s fit-container"
//               style={{ gap: 0 }}
//             >
//               {!shouldHideSidebar && <SideBarClient />}

//               <div
//                 className="main-page-nostr-container"
//                 style={{ flex: 1, position: "relative" }}
//               >
//                 {/* ✅ Always render the Component, no gating */}
//                 <KeepAlive routeKey={router.asPath}>
//                   <Component {...pageProps} />
//                 </KeepAlive>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* ✅ Overlay loader only */}
//       {loading && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "rgba(0,0,0,0.0)",
//             pointerEvents: "none",
//             zIndex: 9999,
//           }}
//         >
//           <LoadingLogo size={58} />
//         </div>
//       )}
//     </ReduxProvider>
//   );
// }

export default App;
