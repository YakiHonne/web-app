import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/SmartWidgetEditor"),
  {
    ssr: false,
  }
);

export default function index() {
  let data = {
    path: "smart-widget-builder",
    title: "Yakihonne | Smart Widget Builder",
    description:
      "Design and code smart widgets with our intuitive editor. Bring your interactive content ideas to life.",
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