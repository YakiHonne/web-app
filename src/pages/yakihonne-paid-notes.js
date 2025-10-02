import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/YakiFN"), {
  ssr: true,
});

export default function index() {
  let data = {
    path: "yakihonne-paid-notes",
    title: "Flash news and uncensored notes introduction",
    description:
      "Monetize your short-form content with Bitcoin Lightning microtransactions. Create premium notes with flexible access models for your audience.",
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
