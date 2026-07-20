import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/RefundPolicy"), {
  ssr: true,
});

export default function index({ keyword }) {
  let data = {
    path: "refund-policy",
    title: "Yakihonne refund policy",
    description:
      "When a payment to Yakihonne can be refunded, and how to report a platform error.",
    image:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent keyword={keyword} />
    </div>
  );
}
