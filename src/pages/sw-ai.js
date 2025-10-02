import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/SWHomeAI"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "sw-ai",
    title: "Smart Widget AI",
    description:
      "Create intelligent widgets powered by AI. Build interactive content that engages your audience in new ways.",
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
