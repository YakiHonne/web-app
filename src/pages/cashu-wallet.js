import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/Cashu/CashuWallet"),
  {
    ssr: false,
  },
);

export default function index() {
  let data = {
    path: "cashu",
    title: "Cashu",
    description: "Manage your Cashu wallets",
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
