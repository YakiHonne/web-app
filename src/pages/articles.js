import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/Articles"), {
  ssr: false,
});

export default function index() {
  let data = {
    path: "articles",
    title: "Articles",
    description:
      "Explore articles curated content tailored to your interests in the decentralized Nostr ecosystem.",
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