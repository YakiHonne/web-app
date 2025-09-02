import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/ProfileEdit"),
  {
    ssr: false,
  }
);

export default function index() {
  let data = {
    path: "settings/profile",
    title: "Yakihonne | Edit Profile",
    description:
      "Customize your decentralized identity. Update your profile information and preferences across the Nostr network.",
    image:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  );
}
