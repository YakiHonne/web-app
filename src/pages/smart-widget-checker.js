import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/SmartWidgetChecker"),
  {
    ssr: false,
  }
);

export default function index() {
  let data = {
    path: "smart-widget-checker",
    title: "Yakihonne | Smart Widget Checker",
    description:
      "Validate and test your smart widgets before deployment. Ensure quality and functionality across different environments.",
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