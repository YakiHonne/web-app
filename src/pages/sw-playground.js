import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/Playground"),
  {
    ssr: false,
  }
);

export default function index() {
  let data = {
    path: "sw-playground",
    title: "Playground",
    description:
      "Experiment with Yakihonne features and test new functionality. A sandbox for exploring platform capabilities.",
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
