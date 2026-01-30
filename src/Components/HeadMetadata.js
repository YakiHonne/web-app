import React from "react";
import Head from "next/head";
import Script from "next/script";

export default function HeadMetadata({ data }) {
  return (
    <>
      <Head>
        <title>{`Yakihonne | ${data.title}`}</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content={data.description} />
        <meta property="og:description" content={data.description} />
        <meta
          property="og:image"
          content={
            data.image ||
            "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="700" />
        <meta
          property="og:url"
          content={`https://yakihonne.com/${data.path}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Yakihonne" />
        <meta property="og:title" content={data.title} />
        <meta property="twitter:title" content={data.title} />
        <meta property="twitter:description" content={data.description} />
        <meta
          property="twitter:image"
          content={
            data.image ||
            "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png"
          }
        />
      </Head>
      <Script
        src="https://umami.yakihonne.com/script.js"
        data-website-id="36945883-46ba-48af-ba92-f28ac88e405d"
        strategy="afterInteractive"
        onError={() => {
          console.warn("Umami script failed to load");
        }}
      />
    </>
  );
}
