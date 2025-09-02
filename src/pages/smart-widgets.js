import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/SmartWidgetHome"),
  {
    ssr: false,
  }
);

export default function index() {
  let data = {
    path: "smart-widgets",
    title: "Yakihonne | Smart Widgets",
    description:
      "Build and deploy smart widgets for enhanced user interaction. Create dynamic content experiences on the decentralized web.",
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
