import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Terms"), {
  ssr: true,
});

export default function index({ keyword }) {
  let data = {
    path: "terms",
    title: "Yakihonne terms",
    description:
      "Clear guidelines for participating in the Yakihonne ecosystem on Nostr. Fair and balanced terms that respect creator rights.",
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
