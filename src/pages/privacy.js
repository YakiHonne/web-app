import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Privacy"), {
  ssr: true,
});

export default function index({ keyword }) {
  let data = {
    path: "privacy",
    title: "Yakihonne | Yakihonne privacy policies",
    description:
      "Our commitment to protecting your data in a decentralized environment. Transparent privacy practices that prioritize user sovereignty.",
    image:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent keyword={keyword} />
    </div>
  );
}
