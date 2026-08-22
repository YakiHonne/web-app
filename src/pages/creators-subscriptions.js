import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/CreatorsSubscriptions"), {
  ssr: false,
});

export default function CreatorsSubscriptionsPageRoute() {
  const data = {
    path: "creators-subscriptions",
    title: "Creators subscriptions — Yakihonne",
    description: "Manage the creators you are subscribed to and review your payments.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  );
}
