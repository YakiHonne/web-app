import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Media"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "media",
    title: "Media",
    description:
      "Explore media content from Nostr users.",
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