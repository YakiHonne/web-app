import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/YakiLevelingFeature"),
  {
    ssr: true,
  }
);

export default function index() {
  let data = {
    path: "points-system",
    title: "Points System",
    description: "Track your progress and achievements on the platform. Level up through engagement and quality contributions.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  }
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  );
}