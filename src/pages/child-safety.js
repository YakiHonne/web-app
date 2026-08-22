import dynamic from "next/dynamic";
import React from "react";
import Head from "next/head";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/ChildSafety"), {
  ssr: true,
});

export default function index({ keyword }) {
  let data = {
    path: "child-safety",
    title: "Yakihonne child safety standards",
    description:
      "Child safety standards for the YakiHonne and YakiPro platforms, operated by JUSTHONNE TECHNOLOGY SDN BHD.",
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
