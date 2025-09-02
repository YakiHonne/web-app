import dynamic from 'next/dynamic'
import React from 'react'
import HeadMetadata from '@/Components/HeadMetadata';

const ClientComponent = dynamic(() => import("@/(PagesComponents)/YakiMobileApp"), {
  ssr: true,
});

export default function index() {
  let data = {
    path: "yaki-mobile-app",
    title: "Yakihonne | Mobile App",
    description: "Access Yakihonne on the go with our mobile application. Full functionality in the palm of your hand.",
    image: "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  }
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  );
}