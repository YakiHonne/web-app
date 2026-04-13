import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/Blossom/Blossom"),
  {
    ssr: false,
  },
);

export default function index() {
  let data = {
    path: "blossom",
    title: "Blossom management",
    description: "Manage your blossom servers",
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
