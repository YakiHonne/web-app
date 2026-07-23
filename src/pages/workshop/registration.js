import dynamic from "next/dynamic";
import React from "react";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/WorkshopRegistration"),
  { ssr: false }
);

export default function WorkshopRegistrationPage() {
  let data = {
    path: "workshop/registration",
    title: "Workshop registration",
    description:
      "Register for a YakiHonne workshop. Connect your account to reserve your spot.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  );
}
