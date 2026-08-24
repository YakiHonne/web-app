import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Pricing"), {
  ssr: false,
});

export default function index({ keyword }) {
  let data = {
    path: "pricing",
    title: "Yakihonne pricing",
    description:
      "Compare YakiHonne plans and unlock more features with YakiPro.",
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
