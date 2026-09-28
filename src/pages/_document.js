import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html dir="auto">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=window.localStorage;var n=s.getItem("yaki-nav-layout");var c=s.getItem("yaki-sidebar-collapsed");var g=s.getItem("yaki-glass");var r=document.documentElement;r.setAttribute("data-nav",n==="sidebar"?"sidebar":"topbar");r.setAttribute("data-nav-collapsed",c==="1"?"1":"0");r.setAttribute("data-glass",g==="classic"?"classic":"glass");}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
