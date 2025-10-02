import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Dashboard"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "dashboard",
    title: "Dashboard",
    description:
      "Manage your content, track engagement, and monitor earnings in one intuitive dashboard. Your personal command center for the decentralized publishing world.",
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
