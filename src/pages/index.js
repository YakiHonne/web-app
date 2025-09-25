import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/HomeB"), {
  ssr: false,
});

export default function index() {
  
  let data = {
    path: "/",
    title: "Yakihonne | Home",
    description:
      "A censorship and data ownership free protocol, you'll enjoy a fully decentralized media experience.",
    image:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  )
}