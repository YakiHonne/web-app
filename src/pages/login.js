import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Login"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "login",
    title: "Login",
    description:
      "Securely access your decentralized Yakihonne identity with cryptographic keys. One login unlocks all features across web and mobile platforms.",
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
