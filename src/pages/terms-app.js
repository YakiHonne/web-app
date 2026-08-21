import dynamic from "next/dynamic";
import React from "react";
import Head from "next/head";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/TermsAppLegacy"), {
  ssr: true,
});

export default function index({ keyword }) {
  let data = {
    path: "terms-app",
    title: "Yakihonne mobile app EULA",
    description:
      "End User License Agreement for the YakiHonne mobile application, operated by JUSTHONNE TECHNOLOGY SDN BHD.",
    image:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ClientComponent keyword={keyword} />
    </div>
  );
}
