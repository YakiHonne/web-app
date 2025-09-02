import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/YakiSmartWidget"),
  {
    ssr: true,
  }
);

export default function index() {
  let data = {
    path: "yaki-smart-widget",
    title: "Yakihonne | Smart Widget Platform",
    description:
      "Learn about our smart widget platform and how to create interactive content experiences.",
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
