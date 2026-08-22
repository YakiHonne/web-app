import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Subscription"), {
  ssr: false,
});

export default function SubscriptionPageRoute() {
  const data = {
    path: "subscription",
    title: "Subscription & Usage — Yakihonne",
    description: "Manage your Yaki subscription plan and billing.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  );
}
