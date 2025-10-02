import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Search"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "search",
    title: "Search",
    description:
      "Find your favorite creators and content with our powerful search engine. Explore articles, notes, and smart widgets across the Nostr ecosystem.",
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
