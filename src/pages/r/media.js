import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/MediaShareRelay"),
  {
    ssr: false,
  }
);

export default function index({ relayUrl }) {
  let data = {
    path: `r/media${relayUrl ? `?r=${relayUrl}` : ""}`,
    title: "Media from Shared Relay",
    description:
      "Discover media from shared relays across the Nostr network. Expand your media horizon beyond your usual feeds.",
    image: relayUrl
      ?  `https://${relayUrl.split("/")[0]}/favicon.ico`
      : "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };

  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const { r } = query;

  return {
    props: {
      relayUrl: r || null,
    },
  };
}
