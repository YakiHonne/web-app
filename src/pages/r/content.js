import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/ContentSharedRelay"),
  {
    ssr: false,
  }
);

export default function index({ relayUrl }) {
  let data = {
    path: `r/content${relayUrl ? `?r=${relayUrl}` : ""}`,
    title: "Yakihonne | Note from Shared Relay",
    description:
      "Access content from shared relays across the Nostr ecosystem. Discover new things beyond your usual network.",
    image: relayUrl
      ? `https://${relayUrl.split("/")[0]}/favicon.ico`
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
